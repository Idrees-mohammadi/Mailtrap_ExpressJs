import express from "express";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { connectDB } from "./db/connectDB.js";
import { User } from "./models/user.model.js";
import { sendVerificationEmail, sendWelcomeEmail } from "./mailtrap/emails.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // allows us to parse incoming requests:req.body

app.post("/signup", async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const userAlreadyExists = await User.findOne({ email });

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully. Please verify your email.",
            user: { id: user._id, email: user.email, name: user.name },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

app.post("/verify", async (req, res) => {
    const { code } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        // send welcome email
        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: { id: user._id, email: user.email, name: user.name, isVerified: user.isVerified },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);
});
