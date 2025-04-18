"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TaskSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    priority: { type: Number, required: true, min: 1, max: 5 },
    status: { type: String, enum: ["pending", "finished"], default: "pending" },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
});
exports.default = mongoose_1.default.model("Task", TaskSchema);
