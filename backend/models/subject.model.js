import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "PENDENTE"
    },
    matter_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Matter",
        required: true
    },
    order: {
        type: Number,
        default: 0
    },
    // NOVO: Array para guardar os arquivos anexados
    attachments: [{
        name: String,
        url: String,
        public_id: String
    }],
    review1: {
        type: Date,
        default: null
    },
    review2: {
        type: Date,
        default: null
    },
    review3: {
        type: Date,
        default: null
    }, 
    review1_concluded: {
        type: Boolean,
        default: false
    },
    review2_concluded: {
        type: Boolean,
        default: false
    },
    review3_concluded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;