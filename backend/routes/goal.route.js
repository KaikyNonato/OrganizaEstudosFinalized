import express from 'express';
import { createGoal, deleteGoal, getGoals, toggleCompletion, updateGoal } from '../controllers/goal.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';


const router = express.Router();

router.post("/create-goal",verifyToken, createGoal)
router.get("/get-goals",verifyToken, getGoals)
router.put('/update-goal/:id', verifyToken, updateGoal);
router.put('/toggle-completion/:id', verifyToken, toggleCompletion);
router.delete('/delete-goal/:id', verifyToken, deleteGoal);

export default router;