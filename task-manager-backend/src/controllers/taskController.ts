import { NextFunction, Request, Response } from "express";
import Task from "../models/Task";

interface AuthRequest extends Request {
  user?: { userId: string };
}


export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, startTime, endTime, priority, status, description } = req.body;

    if (!title || !startTime || !endTime || !priority || !status) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const newTask = new Task({
      title,
      startTime,
      endTime,
      priority,
      status,
      description,
      userId: req.user.userId,
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Server error", error: errorMessage });
  }
};


export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { priority, status, sort, page = 1, limit = 10 } = req.query;

    let query: any = { userId: req.user.userId };

    if (priority) {
      query.priority = Number(priority);
    }
    if (status) {
      query.status = status;
    }

    let sortOptions: any = {};
    if (sort === "startTime") sortOptions.startTime = 1;
    else if (sort === "-startTime") sortOptions.startTime = -1;
    else if (sort === "endTime") sortOptions.endTime = 1;
    else if (sort === "-endTime") sortOptions.endTime = -1;

    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalTasks = await Task.countDocuments(query);

    res.json({
      totalTasks,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTasks / Number(limit)),
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Update Task
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    if (status === "finished" && !updatedTask.endTime) {
      updatedTask.endTime = new Date();
      await updatedTask.save();
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};


export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};


export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const userId = req.user.userId;

    const tasks = await Task.find({ userId });

    if (tasks.length === 0) {
      res.status(200).json({ message: "No tasks present" });
      return;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "finished");
    const pendingTasks = tasks.filter((task) => task.status === "pending");

    const percentCompleted = ((completedTasks.length / totalTasks) * 100).toFixed(2);
    const percentPending = ((pendingTasks.length / totalTasks) * 100).toFixed(2);

    const pendingStats: any = {};

    pendingTasks.forEach((task) => {
      const priority = task.priority;
      const startTime = new Date(task.startTime).getTime();
      const endTime = new Date(task.endTime).getTime();
      const currentTime = Date.now();

      const lapsedTime = currentTime > startTime ? currentTime - startTime : 0;
      const balanceTime = endTime > currentTime ? endTime - currentTime : 0;

      if (!pendingStats[priority]) {
        pendingStats[priority] = { totalLapsed: 0, totalBalance: 0, count: 0 };
      }

      pendingStats[priority].totalLapsed += lapsedTime;
      pendingStats[priority].totalBalance += balanceTime;
      pendingStats[priority].count += 1;
    });

    const pendingStatsFormatted = Object.keys(pendingStats).map((priority) => ({
      priority: Number(priority),
      totalLapsed: (pendingStats[priority].totalLapsed / (1000 * 60)).toFixed(2), // in minutes
      totalBalance: (pendingStats[priority].totalBalance / (1000 * 60)).toFixed(2), // in minutes
    }));

    const totalCompletionTime = completedTasks.reduce((acc, task) => {
      const startTime = new Date(task.startTime).getTime();
      const endTime = new Date(task.endTime).getTime();
      return acc + (endTime - startTime) / (1000 * 60 * 60); // hours
    }, 0);

    const avgCompletionTime =
      completedTasks.length > 0 ? (totalCompletionTime / completedTasks.length).toFixed(2) : "N/A";

    res.status(200).json({
      totalTasks,
      percentCompleted,
      percentPending,
      pendingStats: pendingStatsFormatted,
      avgCompletionTime,
    });
  } catch (error) {
    console.error("Error in getting taskDashboard:", error);
    res.status(500).json({ message: "Internal Server error", error });
  }
};
