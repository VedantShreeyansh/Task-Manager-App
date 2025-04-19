"use client";

import React, { useEffect, useState } from "react";
import { Modal, Box } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { getTasks, createTask, deleteTask, updateTask } from "../../../services/taskService";

interface Task {
  _id: string;
  title: string;
  priority: number;
  status: string;
  startTime: string;
  endTime: string;
  totalTime?: string;
  description?: string;
}

const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({});

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    priority: 1,
    startTime: "",
    endTime: "",
  });

  const formatToIST = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateStr).toLocaleString("en-IN", options);
  };

  

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, startTime, endTime, priority } = newTask;
    if (!title || !startTime || !endTime || !priority) {
      alert("Please fill all fields");
      return;
    }

    try {
      const newTaskObj: Partial<Task> = {
        title,
        description: newTask.description ?? "",
        priority: priority ?? 1,
        status: "pending",
        startTime,
        endTime,
      };

      const response = await createTask(newTaskObj);
      const createdTask: Task = response.data;
      setTasks((prev) => [...prev, createdTask]);
      setNewTaskModal(false);
      setNewTask({ title: "", priority: 1, startTime: "", endTime: "" });
    } catch (error) {
      console.error("Error adding the task:", error);
      alert("Failed to add task. Please try again");
    }
  };

  const handleDeleteSelected = async () => {
    const confirmed = window.confirm("Are you sure you want to delete selected task?");
    if (confirmed) {
      try {
        await Promise.all(selectedTaskIds.map((id) => deleteTask(id)));
        const remainingTasks = tasks.filter((task) => !selectedTaskIds.includes(task._id));
        setTasks(remainingTasks);
        setSelectedTaskIds([]);
      } catch (error) {
        console.error("Error deleting tasks:", error);
      }
    }
  };

  const handleOpenEditModal = (task: Task) => {
    setCurrentTask(task);
    setEditTaskModal(true);
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentTask._id) return;

      await updateTask(currentTask._id, currentTask);
      const updatedTasks = tasks.map((task) =>
        task._id === currentTask._id ? { ...task, ...currentTask } : task
      );
      setTasks(updatedTasks);
      setEditTaskModal(false);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const calculateTotalTime = (start: string, end: string) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  return (
    <div id="parent">
      <Navbar />
      <div className="bg-none p-6 shadow-md rounded-lg mt-16 mb-4">

        {/* Add Task Button */}
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => setNewTaskModal(true)}
        >
          Add Task
        </button>

        {/* Add Task Modal */}
        <Modal open={newTaskModal} onClose={() => setNewTaskModal(false)}>
          <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg w-[90%] md:w-[50%] text-black">
            <h3 className="text-lg font-bold mb-4">Add New Task</h3>
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="datetime-local"
                value={newTask.startTime}
                onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="datetime-local"
                value={newTask.endTime}
                onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setNewTaskModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </Box>
        </Modal>

        {/* Delete Button */}
        <div className="mt-4">
          <button
            onClick={handleDeleteSelected}
            disabled={selectedTaskIds.length === 0}
            className={`bg-red-500 text-white px-4 py-2 rounded mb-4 ${
              selectedTaskIds.length === 0 ? "cursor-not-allowed" : "hover:bg-red-800"
            }`}
          >
            Delete Selected
          </button>

          {/* Task Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-black-200 text-left">
                  <th className="px-4 py-2"></th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Priority</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Start Time</th>
                  <th className="px-4 py-2">End Time</th>
                  <th className="px-4 py-2">Total Time (hrs)</th>
                  <th className="px-4 py-2">Edit</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border-t hover:bg-b-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task._id)}
                        onChange={() => {
                          if (selectedTaskIds.includes(task._id)) {
                            setSelectedTaskIds(selectedTaskIds.filter((id) => id !== task._id));
                          } else {
                            setSelectedTaskIds([...selectedTaskIds, task._id]);
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-2">{task.title}</td>
                    <td className="px-4 py-2">{task.priority}</td>
                    <td className="px-4 py-2">{task.status}</td>
                    <td className="px-4 py-2">{formatToIST(task.startTime)}</td>
                    <td className="px-4 py-2">{formatToIST(task.endTime)}</td>
                    <td className="px-4 py-2">
                      {task.startTime && task.endTime
                        ? `${calculateTotalTime(task.startTime, task.endTime)}`
                        : "--"}
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => handleOpenEditModal(task)}>
                        <FaEdit className="text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Task Modal */}
        <Modal open={editTaskModal} onClose={() => setEditTaskModal(false)}>
          <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg w-[90%] md:w-[50%] text-black">
            <h3 className="text-lg font-bold mb-4">Edit Task</h3>
            <form onSubmit={handleEditTask}>
              <input
                type="text"
                value={currentTask.title}
                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="number"
                value={currentTask.priority}
                onChange={(e) => setCurrentTask({ ...currentTask, priority: Number(e.target.value) })}
                className="w-full p-2 mb-3 border rounded"
              />
              <select
                value={currentTask.status}
                onChange={(e) => setCurrentTask({ ...currentTask, status: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="finished">Finished</option>
              </select>
              <input
                type="datetime-local"
                value={currentTask.startTime}
                onChange={(e) => setCurrentTask({ ...currentTask, startTime: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              />
              <input
                type="datetime-local"
                value={currentTask.endTime}
                onChange={(e) => setCurrentTask({ ...currentTask, endTime: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              />
              <div className="flex justify-end space-x-4">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditTaskModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Update
                </button>
              </div>
            </form>
          </Box>
        </Modal>

      </div>
    </div>
  );
};

export default TaskPage;
