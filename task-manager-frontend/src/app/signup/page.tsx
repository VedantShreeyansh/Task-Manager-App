"use client";
import { useState } from "react";
import axios from "axios";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await axios.post("http://localhost:5000/api/auth/signup", formData);

            alert("Signup Successful! Redirecting to Login...")
            window.location.href = "/login"; // Redirect to login
        } catch (err: any) {
            setError(err.response?.data?.message || "Signup failed. Please try again.");
        }
    };

    return (
        <div id="parent">
            <h1 className="flex text-2xl font-bold mt-4 justify-center">Signup Page</h1>
            <div className="flex justify-center items-center bg-orange min-h-screen mb-5">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                    <form onSubmit={handleSubmit} className="space-y-4 text-black">
                        <h3 className="flex text-2xl font-bold justify-center">Welcome to To-Do App</h3>
                        {error && <p className="text-red-500">{error}</p>}
                        <input
                            type="email"
                            name="email"
                            placeholder="Email ID"
                            className="w-full p-2 border border-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="w-full p-2 border border-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                            Signup
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
