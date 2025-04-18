import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    priority: { type: Number, required: true, min: 1, max: 5 },
    status: { type: String, enum: ["pending", "finished"], default: "pending" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalTime: { type: String},
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
