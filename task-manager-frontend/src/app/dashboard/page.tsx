"use client";
import React from "react";
import Navbar from "../components/Navbar";
import TaskStatistics from "./TaskStatistics";
import SummaryTaskStatistics from "./pendingTaskStats";
import TaskSummaryTable from "./SummaryTable";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div id="parent">
      <Navbar />
      <main className="container mx-auto mt-20 p-6">
        <h1 className="text-3xl font-bold mb-6 flex mx-auto justify-center items-center">Dashboard</h1>
        <TaskStatistics />
        <SummaryTaskStatistics />
        <TaskSummaryTable />
        <button className="bg-red-500 text-white px-4 ms-5 py-2 rounded">
          <Link href="/profile_page">Go to Profile Page</Link>
        </button>
        <button
          className="absolute right-23 bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.removeItem("token");
            alert("Logged out successfully!");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </main>
    </div>
  );
}