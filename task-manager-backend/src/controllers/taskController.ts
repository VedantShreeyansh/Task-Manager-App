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
  
      // 👇 Yeh line add kari: pehle task uthayenge sirf usi user ka
      const task = await Task.findOne({ _id: id, userId: req.user?.userId });
      if (!task) {
        res.status(404).json({ message: "Task not found or not authorized" });
        return;
      }
  
      // ✅ Ab update karenge
      Object.assign(task, req.body);
  
      if (status === "finished" && !task.endTime) {
        task.endTime = new Date();
      }
  
      await task.save();
  
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: "Error updating task", error });
    }
  };


  export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      // 👇 Yeh line add kari: pehle task uthayenge sirf usi user ka
      const task = await Task.findOne({ _id: id, userId: req.user?.userId });
      if (!task) {
        res.status(404).json({ message: "Task not found or not authorized" });
        return;
      }
  
      await task.deleteOne();
  
      res.status(200).json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting task", error });
    }
  };
  

  export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Check if the user is authenticated
      if (!req.user) {
        res.status(401).json({ message: "User not authenticated" });
        return;
      }
  
      const userId = req.user.userId;
  
      // Fetch tasks for the logged-in user
      const tasks = await Task.find({ userId });
  
      // Handle the case where there are no tasks
      if (tasks.length === 0) {
        res.status(200).json({
          totalTasks: 0,
          taskCompleted: 0,
          pendingTasks: 0,
          percentCompleted: "0.00",
          percentPending: "0.00",
          timeLapsed: 0,
          estimatedTimeToFinish: 0,
          pendingStats: [],
          avgCompletionTime: "N/A",
        });
        return;
      }
  
      // Calculate total tasks, completed tasks, and pending tasks
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task) => task.status === "finished");
      const pendingTasks = tasks.filter((task) => task.status === "pending");
  
      // Calculate percentages
      const percentCompleted = ((completedTasks.length / totalTasks) * 100).toFixed(2);
      const percentPending = ((pendingTasks.length / totalTasks) * 100).toFixed(2);
  
      // Calculate pending stats
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
  
      // Calculate average completion time for completed tasks
      const totalCompletionTime = completedTasks.reduce((acc, task) => {
        const startTime = new Date(task.startTime).getTime();
        const endTime = new Date(task.endTime).getTime();
        return acc + (endTime - startTime) / (1000 * 60 * 60); // hours
      }, 0);
  
      const avgCompletionTime =
        completedTasks.length > 0 ? (totalCompletionTime / completedTasks.length).toFixed(2) : "N/A";
  
      // Send the response
      res.status(200).json({
        totalTasks,
        taskCompleted: completedTasks.length,
        pendingTasks: pendingTasks.length,
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
