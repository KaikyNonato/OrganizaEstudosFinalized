import express from "express";
import { createNote, getNotes, deleteNote, updateNote } from "../controllers/note.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/create-note", verifyToken, createNote);
router.get("/get-notes/:matterId", verifyToken, getNotes);
router.put("/update-note/:id", verifyToken, updateNote);
router.delete("/delete-note/:id", verifyToken, deleteNote);

export default router;