import express from 'express';
import { addStudyTime, getAllUsersAdmin, getStudyTime, updateUser, updateUserAdmin } from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.put("/update-user", verifyToken, updateUser);
router.post("/add-study-time", verifyToken, addStudyTime);
router.get("/get-study-time", verifyToken, getStudyTime);


router.get("/admin/users", verifyToken, getAllUsersAdmin);
router.put("/admin/users/:id", verifyToken, updateUserAdmin);
export default router;