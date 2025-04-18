import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from './config/db'; 
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/taskRoutes";
import protectedRoutes from "./routes/protected";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", protectedRoutes); 

console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

const PORT = process.env.PORT || 5000;

connectDB();

try {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
} catch (error) {
    console.error("Server Startup Error:", error);
}
