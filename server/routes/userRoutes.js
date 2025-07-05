import { registerUser, loginUser, userCredit, paymentRazorpay, verifyRazorpay } from "../controllers/userController.js";
import express from "express";
import { userAuth } from "../middleware/auth.js";
const userRouter = express.Router();

// Route for user registration
userRouter.post("/register", registerUser);

// Route for user login
userRouter.post("/login", loginUser);

userRouter.post('/credits', userAuth, userCredit);

userRouter.post('/pay-razor', userAuth, paymentRazorpay)
userRouter.post('verify-razor', verifyRazorpay)

// Export the router
export default userRouter;