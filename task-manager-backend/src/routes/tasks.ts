import express from "express";
import "../types/express";
import Task from "../models/Task";
import { authenticateToken } from "../middleware/authMiddleware";
import { AuthRequest } from "../express";

const router = express.Router();

// GET /api/tasks
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const tasks = await Task.find({ userId: req.user?.userId });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// POST /api/tasks
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, status, priority, startTime, endTime, totalTime } = req.body;

    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const newTask = new Task({
      title,
      description,
      status,
      priority,
      startTime,
      endTime,
      totalTime,
      userId: req.user?.userId,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Error creating task" });
  }
});

// PUT /api/tasks/:taskId
router.put("/:taskId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.user?.userId },
      req.body,
      { new: true }
    );
    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task" });
  }
});

// PATCH /api/tasks/:taskId
router.patch("/:taskId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.user?.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Error updating task status" });
  }
});

// DELETE /api/tasks/:taskId
router.delete("/:taskId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.params;
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: req.user?.userId,
    });
    if (!deletedTask) {
      res.status(404).json({ message: "Task not found" });
    } else {
      res.json({ message: "Task deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task" });
  }
});

export default router;
