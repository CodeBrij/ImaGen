import mongoose from "mongoose";

const connectDB = async (req,res) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Internal Server Error: " + error);
    }
}

export default connectDB;