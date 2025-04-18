"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();

const router = express_1.default.Router();

// SIGNUP ROUTE
router.post("/signup", [
    (0, express_validator_1.body)("email").isEmail().withMessage("Enter a valid email"),
    (0, express_validator_1.body)("password").isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
], async (req, res) => {
    try {
        console.log("Signup Request Body:", req.body);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log("Validation Errors:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        let user = await User_1.default.findOne({ email });
        if (user) {
            console.log("User already exists:", email);
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);

        user = new User_1.default({ email, password: hashedPassword });
        await user.save();

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: "JWT Secret not set in environment variables" });
        }

        const payload = {
            _id: user._id,
            email: user.email,
        };

        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: "1h" });
        return res.status(201).json({ token });

    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// LOGIN ROUTE
router.post("/login", [
    (0, express_validator_1.body)("email").isEmail().withMessage("Enter a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: "JWT Secret not set in environment variables" });
        }

        const payload = {
            _id: user._id,
            email: user.email,
        };

        const token = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: "1h" });
        return res.json({ token });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});

exports.default = router;
