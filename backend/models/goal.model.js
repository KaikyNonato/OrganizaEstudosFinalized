import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    matter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Matter", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    title: { type: String, required: true },
    daysOfWeek: { type: [Number], required: true, default: [] },
    completedDates: { type: [String], default: [] },
    lifetimeCompleted: { type: Number, default: 0 }

}, { timestamps: true })

goalSchema.index({ matter_id: 1, user_id: 1 });

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;