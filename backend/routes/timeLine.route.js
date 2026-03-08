import express from 'express';
import { addMatterTimeLine, getTimeline, deleteTimeLine, updateTimeLine } from '../controllers/timeLine.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/add-matter-timeline', verifyToken, addMatterTimeLine)
router.get('/get-timeline', verifyToken, getTimeline)
router.delete('/delete-timeline/:id', verifyToken, deleteTimeLine)
router.put('/update-timeline/:id', verifyToken, updateTimeLine)

export default router;