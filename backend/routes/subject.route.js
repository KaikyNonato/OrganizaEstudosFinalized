import express from 'express';
import multer from 'multer';
import { createSubject, deleteSubject, getSubjects, getAllSubjects, reorderSubjects, updateSubject, uploadAttachment, removeAttachment, concludedReview } from '../controllers/subject.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Configurando o multer para salvar temporariamente em memória
const upload = multer({ storage: multer.memoryStorage() });

router.post("/create-subject", createSubject);
router.get("/get-subjects", verifyToken, getAllSubjects);
router.get("/get-subjects/:matter_id", getSubjects);
router.put("/update-subject/:id", updateSubject);
router.delete("/delete-subject/:id", deleteSubject);
router.put('/reorder-subjects', reorderSubjects);
router.put('/concluded-review/:id/:review', concludedReview);


// NOVAS ROTAS DE ARQUIVO
router.post("/:id/upload", upload.single('file'), uploadAttachment);
router.put("/remove-file/:id", removeAttachment);

export default router;