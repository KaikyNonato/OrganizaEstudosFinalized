import express from 'express';
import multer from 'multer';
import { createSubject, deleteSubject, getSubjects, getAllSubjects, reorderSubjects, updateSubject, uploadAttachment, removeAttachment, concludedReview, streamPdf } from '../controllers/subject.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Configurando o multer para salvar temporariamente em memória
const upload = multer({ storage: multer.memoryStorage() });

router.post("/create-subject",verifyToken, createSubject);
router.get("/get-subjects", verifyToken, getAllSubjects);
router.get("/get-subjects/:matter_id",verifyToken, getSubjects);
router.put("/update-subject/:id",verifyToken, updateSubject);
router.delete("/delete-subject/:id",verifyToken, deleteSubject);
router.put('/reorder-subjects',verifyToken, reorderSubjects);
router.put('/concluded-review/:id/:review',verifyToken, concludedReview);


// NOVAS ROTAS DE ARQUIVO
router.post("/:id/upload",verifyToken, upload.single('file'), uploadAttachment);
router.put("/remove-file/:id",verifyToken, removeAttachment);

router.get("/stream-pdf/:subjectId/:publicId", verifyToken, streamPdf);

export default router;
