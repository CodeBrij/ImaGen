import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password with 10 salt rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        })

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, creditBalance: newUser.creditBalance } });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, creditBalance: user.creditBalance } });
    } catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const userCredit = async (req, res) => {

    try {
        const { userID } = req.body;

        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ creditBalance: user.creditBalance || 0 });
    } catch (error) {
        console.error("Error fetching user credit:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,    
});

export const paymentRazorpay = async (req, res) => {
    try {
        const { userID, planId } = req.body;

        const userData = await userModel.findById(userID);
        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let credits, plan, amount;
        switch (planId) {
            case 'Basic':
                plan = "Basic";
                credits = 100;
                amount = 10;
                break;
            case 'Advanced':
                plan = "Advanced";
                credits = 500;
                amount = 50;
                break;
            case 'Business':
                plan = "Business";
                credits = 5000;
                amount = 250;
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid plan selected" });
        }

        const transactionData = {
            userID,
            plan,
            amount,
            credits,
            date: new Date(),
        };

        const newTransaction = await transactionModel.create(transactionData);

        const options = {
            amount: amount * 100, // in paise
            currency: process.env.CURRENCY || "INR",
            receipt: String(newTransaction._id),
        };

        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ success: false, message: "Failed to create order" });
            }
            res.json({ success: true, order });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const verifyRazorpay = async (req,res) => {
    try {
        const {razorpay_order_id} = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if(orderInfo.status === 'paid'){
            const transactionData = await transactionModel.findById(orderInfo.receipt);
            if(transactionData.payment){
                return res.json({success:false, message: "Payment failed, already paid"});
            }
            
            const userData = await userModel.findById(transactionData._id, {payment: true})
            const creditBalance = userData.creditBalance + transactionData.credits;
            await userModel.findByIdAndUpdate(userData._id, {creditBalance});
            res.json({success:true, message: "Payment successful", user: {id: userData._id, name: userData.name, email: userData.email, creditBalance: userData.creditBalance}});
        }
        else {
            res.json({success:false, message: "Payment failed, order not paid"});
        }

        
    } catch (error) {
        
    }
}