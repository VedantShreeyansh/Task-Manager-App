"use client";
import { useState, useEffect } from "react";
import { getDashboardStats } from "../../../services/taskService";

interface SummaryTaskStats {
  pendingTasks: number;
  totalTimeLapsed: number;
  totalTimeToFinish: number;
}

export default function SummaryTaskStatistics() {
  const [stats, setStats] = useState<SummaryTaskStats>({
    pendingTasks: 0,
    totalTimeLapsed: 0,
    totalTimeToFinish: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryTaskStatistics = async () => {
      try {
        const response = await getDashboardStats();
        const { pendingTasks, totalTimeLapsed, totalTimeToFinish } = response.data || {
          pendingTasks: 0,
          totalTimeLapsed: 0,
          totalTimeToFinish: 0,
        };
        setStats({ pendingTasks, totalTimeLapsed, totalTimeToFinish });
      } catch (error) {
        console.error("Error fetching summary task statistics:", error);
        setStats({
          pendingTasks: 0,
          totalTimeLapsed: 0,
          totalTimeToFinish: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryTaskStatistics();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-none p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Pending Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-400 p-6 rounded text rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold">Pending Tasks</h3>
          <p className="text-2xl font-bold mt-2">{stats.pendingTasks}</p>
        </div>
        <div className="bg-green-400 p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold">Total Time Lapsed</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalTimeLapsed}</p>
        </div>
        <div className="bg-orange-400 p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold">Total Time to Finish</h3>
          <p className="text-2xl font-bold mt-2">{stats.totalTimeToFinish}</p>
        </div>
      </div>
    </div>
  );
}