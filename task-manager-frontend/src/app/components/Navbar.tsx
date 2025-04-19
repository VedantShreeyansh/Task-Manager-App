"use client";
import {useEffect, useState} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {useRouter} from "next/navigation";


export default function Navbar() {
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const pathname = usePathname();
 const router = useRouter();


useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
}, []);

const hiddenRoutes = ["/login", "/signup"];


if (hiddenRoutes.includes(pathname)){
  return null;
}

    // const handleNavigation = (path: string) => {
    //     if (isAuthenticated) {
    //         Router.push(path);
    //     }
    // }

    return (
      <nav className="w-full bg-blue-600 text-white p-4 fixed top-0 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Manager</h1>
          <div className="space-x-6">
            <button
              onClick={() => router.push('/dashboard')}
              disabled={!isAuthenticated}
              className={`px-4 py-2 rounded ${
                isAuthenticated ? "hover:bg-orange-600" : "opacity-50"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/tasks')}
              disabled={!isAuthenticated}
              className={`px-4 py-2 rounded ${
                isAuthenticated ? "hover:bg-orange-600" : "opacity-50"
              }`}
            >
              Task List
            </button>
          </div>
        </div>
      </nav>
    );
  }
