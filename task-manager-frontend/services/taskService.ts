import axios from "axios";
import type { Task } from "@/models/Task";

const BASE_URL = "http://localhost:5000/api/tasks";

// Get token from localStorage safely
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Auth token not found in localStorage");
  return {
    Authorization: `Bearer ${token}`,
  };
  console.log("Token:", localStorage.getItem("token"))
};

// Get all tasks
export const getTasks = async () => {
  const headers = getAuthHeaders();
  return axios.get(BASE_URL, { headers });
};

// Create a new task
export const createTask = async (taskData: Partial<Task>) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  return axios.post(BASE_URL, taskData, { headers });
};

// Update an existing task
export const updateTask = async (taskId: string, updatedTaskData: Partial<Task>) => {
  const headers = getAuthHeaders();
  return axios.put(`${BASE_URL}/${taskId}`, updatedTaskData, { headers });
};

// Update task status
export const updateTaskStatus = async (taskId: string, status: string) => {
  const headers = getAuthHeaders();
  return axios.patch(`${BASE_URL}/${taskId}`, { status }, { headers });
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  const headers = getAuthHeaders();
  return axios.delete(`${BASE_URL}/${taskId}`, { headers });
};

export const getDashboardStats = async () => {
  const headers = getAuthHeaders();
  return axios.get(`${BASE_URL}/dashboard-stats`, { headers });
};
