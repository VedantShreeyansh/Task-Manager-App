"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        _id: ""
    });

    useEffect(() => {
        axios.get("/api/getUserProfile")
            .then((res) => {
                setFormData(res.data as {email: string; username: string; _id: string; });  
            })
            .catch((error) => console.error("Error fetching user profile:", error));
    }, []);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);

            // Generate a preview URL for the selected file
            const fileUrl = URL.createObjectURL(file);
            setPreview(fileUrl);
        }
    };

    const onFileUpload = async () => {
        if (!file) {
            console.log("No file uploaded");
            return;
        }

        const uploadData = new FormData();
        uploadData.append("profilePicture", file);

        try {
            const response = await axios.post("/api/uploadFile", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log("File uploaded successfully", response.data);
        } catch (error) {
            console.log("Error uploading the file", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/updateProfile", formData);
            console.log("Profile updated successfully:", response.data);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-black">
                <h2 className="text-xl font-semibold text-center mb-4">Edit Profile</h2>

                {/* Profile Picture Preview */}
                <div className="flex flex-col items-center">
                    {preview ? (
                        <img src={preview} alt="Profile Preview" className="w-20 h-20 rounded-full border mb-2" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mb-2">
                            No Image
                        </div>
                    )}

                    <input type="file" className="mt-2" onChange={onFileChange} />
                    <button className="bg-blue-500 text-white px-3 py-1 mt-2 rounded" onClick={onFileUpload}>
                        Upload
                    </button>
                </div>

                {/* User Info Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border p-2 w-full rounded"
                            disabled
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="border p-2 w-full rounded"
                        />
                    </div>

                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
