import express from 'express';
import { createMatter, deleteMatter, getMatters, updateMatter } from '../controllers/matter.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

router.post("/create-matter", verifyToken ,  createMatter);
router.get("/get-matters",verifyToken , getMatters);
router.delete("/delete-matter/:id",verifyToken, deleteMatter);
router.put("/update-matter/:id",verifyToken, updateMatter);


export default router;