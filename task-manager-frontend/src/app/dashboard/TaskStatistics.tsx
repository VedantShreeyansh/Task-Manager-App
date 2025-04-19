"use client";
import { useState, useEffect } from "react";
import { getDashboardStats } from "../../../services/taskService";

interface TaskStats {
  totalTasks: number;
  taskCompleted: number | null;
  pendingTasks: number | null;
  timeLapsed: number | null; // in hours
  estimatedTimeToFinish: number | null; // in hours
}

export default function TaskStatistics() {
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0, // Default to 0 for "Total Tasks"
    taskCompleted: null,
    pendingTasks: null,
    timeLapsed: null,
    estimatedTimeToFinish: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskStatistics = async () => {
      try {
        const response = await getDashboardStats();
        const data = response.data || {
          totalTasks: 0,
          taskCompleted: null,
          pendingTasks: null,
          timeLapsed: null,
          estimatedTimeToFinish: null,
        };
        setStats(data);
      } catch (error) {
        console.error("Error fetching task statistics:", error);
        setStats({
          totalTasks: 0,
          taskCompleted: null,
          pendingTasks: null,
          timeLapsed: null,
          estimatedTimeToFinish: null,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaskStatistics();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-none p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Summary</h2>
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-blue-400 p-6 rounded text rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold">Total Tasks</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalTasks}</p>
        </div>
        <div className="bg-green-400 p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold">Completed Tasks</h3>
          <p className="text-2xl font-bold mt-2">{stats.taskCompleted !== null ? stats.taskCompleted : "N/A"}</p>
        </div>
        <div className="bg-orange-400 p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold">Pending Tasks</h3>
          <p className="text-2xl font-bold mt-2">{stats.pendingTasks !== null ? stats.pendingTasks : "N/A"}</p>
        </div>
        <div className="bg-red-400 p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold">Time Lapsed (hrs)</h3>
          <p className="text-2xl font-bold mt-2">{stats.timeLapsed !== null ? stats.timeLapsed : "N/A"}</p>
        </div>
        <div className="bg-purple-400 p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold">Estimated Time to Finish</h3>
          <p className="text-2xl font-bold mt-2">{stats.estimatedTimeToFinish !== null ? stats.estimatedTimeToFinish : "N/A"}</p>
        </div>
      </div>
    </div>
  );
}