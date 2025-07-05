import axios from "axios";
import userModel from "../models/userModel.js";
import FormData from "form-data";

export const generateImage = async (req, res) => {
    try {
        const { userID, prompt } = req.body;
        console.log(userID + "  " + prompt);
        
        if (!userID || !prompt) {
            return res.status(400).json({ message: "Missing userId or prompt" });
        }

        const user = await userModel.findById(userID);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.creditBalance <= 0) {
            return res.status(403).json({ message: "No credit balance", creditBalance: user.creditBalance });
        }

        const formData = new FormData();
        formData.append("prompt", prompt);

        const { data } = await axios.post(
            "https://clipdrop-api.co/text-to-image/v1",
            formData,
            {
                headers: {
                    "x-api-key": process.env.API_KEY,
                    ...formData.getHeaders(), // IMPORTANT: include FormData headers
                },
                responseType: "arraybuffer",
            }
        );

        const base64Image = Buffer.from(data, "binary").toString("base64");
        const resultImage = `data:image/png;base64,${base64Image}`;

        await userModel.findByIdAndUpdate(user._id, {
            creditBalance: user.creditBalance - 1,
        });

        res.status(200).json({
            success: true,
            message: "Image Generated",
            creditBalance: user.creditBalance - 1,
            resultImage,
        });
    } catch (error) {
        console.error("Error in generateImage:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
