import express from "express";
import { createTask, getTasks, updateTask, deleteTask, getDashboardStats } from "../controllers/taskController";
import { authenticateToken } from "../middleware/authMiddleware";
import { AuthRequest } from "../express";
import Task from "../models/Task";

const router = express.Router();

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);
router.get("/dashboard-stats", authenticateToken, getDashboardStats);

router.get("/", authenticateToken, async (req: AuthRequest, res) => {
    try {
        const tasks  = await Task.find({ userId: req.user?.userId });
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks: ", error);
        res.status(500).json({ message: "Error fetching tasks "});
    }
});

export default router;