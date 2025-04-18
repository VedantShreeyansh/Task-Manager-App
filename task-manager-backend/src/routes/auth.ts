import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ SIGNUP
router.post(
    "/signup",
    [
        body("email").isEmail().withMessage("Enter a valid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
    ],
    async (req: Request, res: Response): Promise<void> => {
        try {
            console.log("Signup Request Body:", req.body);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const email = req.body.email.toLowerCase(); // normalize email
            const password = req.body.password;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log("User already exists:", email);
                res.status(400).json({ message: "User already exists" });
                return;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new User({ email, password: hashedPassword });
            await newUser.save();

            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                res.status(500).json({ message: "JWT Secret not set" });
                return;
            }

            const token = jwt.sign({ userId: newUser._id }, jwtSecret, { expiresIn: "1h" });
            res.status(201).json({ token });
        } catch (error: any) {
            console.error("Signup Error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);

// ✅ LOGIN
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Enter a valid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req: Request, res: Response): Promise<void> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }

            const email = req.body.email.toLowerCase(); // normalize
            const password = req.body.password;

            const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
            
            if (!user) {
                res.status(400).json({ message: "Invalid credentials" });
                return;
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                res.status(400).json({ message: "Invalid credentials" });
                return;
            }

            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                res.status(500).json({ message: "JWT Secret not set" });
                return;
            }
           
            const token = jwt.sign({ userId: user._id,  email: user.email}, jwtSecret, { expiresIn: "1h" });
            res.status(200).json({ token });
        } catch (error: any) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
);

export default router;
