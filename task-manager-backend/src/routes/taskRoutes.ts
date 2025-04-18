import express from "express";
import { createTask, getTasks, updateTask, deleteTask, getDashboardStats } from "../controllers/taskController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);
router.get("/dashboard-stats", authenticateToken, getDashboardStats);

export default router;