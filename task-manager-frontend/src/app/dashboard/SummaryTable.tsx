"use client";
import { useEffect, useState } from "react";
import { getDashboardStats } from "../../../services/taskService";

interface SummaryTable {
  priority: number;
  pendingTasks: number;
  timeLapsed: number;
  timeToFinish: number;
}

export default function TaskSummaryTable() {
  const [summaryTable, setTaskSummary] = useState<SummaryTable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaryTable = async () => {
      try {
        const response = await getDashboardStats();
        setTaskSummary(response.data.pendingStats || []);
      } catch (error) {
        console.error("Error fetching summary table:", error);
        setTaskSummary([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryTable();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (summaryTable.length === 0) {
    return <p>No task summary available.</p>;
  }

  return (
    <div className="bg-black p-6 shadow-md rounded-lg mt-6">
      <h2 className="text-xl font-bold mb-4">Task Summary Table</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="p3 text-left">Task Priority</th>
            <th className="p3 text-left">Pending Tasks</th>
            <th className="p3 text-left">Time Lapsed</th>
            <th className="p-3 text-left">Time to Finish (hrs)</th>
          </tr>
        </thead>
        <tbody>
          {summaryTable.map((task) => (
            <tr key={task.priority} className="border-b border-gray-300">
              <td className="p-3">{task.priority}</td>
              <td className="p-3">{task.pendingTasks}</td>
              <td className="p-3">{task.timeLapsed}</td>
              <td className="p-3">{task.timeToFinish}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}