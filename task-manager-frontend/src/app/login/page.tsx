"use client";
import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

// Token payload ka type define karte hain
type TokenPayload = {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
};

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post<{ token: string }>(
        "http://localhost:5000/api/auth/login",
        formData
      );
      const token = response.data.token;

      // Decode the token to get email
      const decoded: TokenPayload = jwtDecode(token);
      const userEmail = decoded.email;
     

      // Store token and email in localStorage
      localStorage.setItem("token", token); 
      localStorage.getItem("token");
      if (userEmail) {
        localStorage.setItem("userEmail", userEmail);
      } else {
        console.warn("Email not found in token");
      }

      alert("Login Successful! Redirecting to Dashboard...");
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="parent">
      <Navbar />
      <h1 className="flex text-2xl font-bold mt-4 justify-center">Login Page</h1>
      <main className="flex flex-col items-center justify-center min-h-screen mt-1">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <form onSubmit={handleSubmit} className="space-y-4 text-black">
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
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
