import mongoose from "mongoose";

const matterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    color: {
        type: String,
        required: true,
        default: "#000000"
    }

}, { timestamps: true })

const Matter = mongoose.model("Matter", matterSchema);

export default Matter;
