import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/dashboard", authenticateToken, (req, res) => {
    res.json({ message: "You are authorized to access this dashboard"});
});

export default router;

