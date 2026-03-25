import cloudinary from '../utils/cloudinary.js';
import Subject from "../models/subject.model.js";
import Matter from "../models/matter.model.js";
import https from 'https';



export const createSubject = async (req, res) => {
    const { title, matter_id } = req.body;

    try {
        if (!title || !matter_id) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // NOVO: Procura o último assunto desta matéria para saber qual é a última posição (order)
        const lastSubject = await Subject.findOne({ matter_id }).sort("-order");
        const newOrder = lastSubject ? lastSubject.order + 1 : 0;

        const subject = new Subject({
            title,
            matter_id,
            order: newOrder // Adiciona o novo assunto no final da fila!
        });

        await subject.save();

        res.status(201).json({ success: true, message: "Subject created successfully", subject });
    } catch (error) {
        console.log("error in createSubject ", error);
        res.status(500).json({ success: false, message: "Error creating subject" });
    }
}


export const getSubjects = async (req, res) => {
    const { matter_id } = req.params;

    try {
        const subjects = await Subject.find({ matter_id });
        res.status(200).json({ success: true, subjects });
    } catch (error) {
        console.log("error in getSubjects ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getAllSubjects = async (req, res) => {
    try {
        const matters = await Matter.find({ user_id: req.userId });
        const matterIds = matters.map(matter => matter._id);

        const subjects = await Subject.find({ matter_id: { $in: matterIds } }).populate('matter_id');
        res.status(200).json({ success: true, subjects });
    } catch (error) {
        console.log("error in getAllSubjects ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const updateSubject = async (req, res) => {
    const { id } = req.params;
    const { title, status, review1, review2, review3, link } = req.body;

    try {
        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        if (title) subject.title = title;

        // Atualiza o link. A verificação `!== undefined` permite que um link seja limpo (enviando uma string vazia).
        if (link !== undefined) subject.link = link;

        // NOVO: Atualiza as datas manualmente se vierem na requisição
        if (review1) subject.review1 = review1;
        if (review2) subject.review2 = review2;
        if (review3) subject.review3 = review3;

        // Mantém a lógica existente do status
        if (status) {
            subject.status = status;
            if (status === "CONCLUIDO") {
                // Só cria novas datas automaticamente se não estivermos enviando elas na edição
                if (!review1) subject.review1 = new Date(Date.now() + 24 * 60 * 60 * 1000);
                if (!review2) subject.review2 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                if (!review3) subject.review3 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            } else {
                subject.review1 = null;
                subject.review2 = null;
                subject.review3 = null;
                subject.review1_concluded = false;
                subject.review2_concluded = false;
                subject.review3_concluded = false;
            }
        }

        await subject.save();

        res.status(200).json({ success: true, message: "Subject updated successfully", subject });
    } catch (error) {
        console.log("error in updateSubject ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const reorderSubjects = async (req, res) => {
    try {
        const { updates } = req.body; // Array de { _id, order }

        // Atualiza todos os assuntos em paralelo
        const promises = updates.map(update =>
            Subject.findByIdAndUpdate(update._id, { order: update.order })
        );

        await Promise.all(promises);

        res.status(200).json({ success: true, message: "Ordem atualizada" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro ao reordenar" });
    }
};

export const deleteSubject = async (req, res) => {
    const { id } = req.params;

    try {
        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        // Deleta os arquivos do Cloudinary associados a este assunto antes de excluir o registro
        if (subject.attachments && subject.attachments.length > 0) {
            const deletePromises = subject.attachments.map(file => cloudinary.uploader.destroy(file.public_id));
            await Promise.all(deletePromises);
        }

        await Subject.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Subject deleted successfully" });
    } catch (error) {
        console.log("error in deleteSubject ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}



export const uploadAttachment = async (req, res) => {
    const { id } = req.params;

    try {
        const subject = await Subject.findById(id);

        if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });
        if (subject.attachments.length >= 3) return res.status(400).json({ success: false, message: "Limite de 3 arquivos atingido." });
        if (!req.file) return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });

        // Converte o buffer do Multer para Base64 para enviar ao Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Faz o upload para o Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: "auto", // Importante para aceitar PDFs
            folder: "subjects_pdfs"
        });

        // Salva a referência no MongoDB
        subject.attachments.push({
            name: req.file.originalname,
            url: result.secure_url,
            public_id: result.public_id
        });

        await subject.save();

        res.status(200).json({ success: true, message: "Arquivo anexado com sucesso", subject });
    } catch (error) {
        console.log("error in uploadAttachment ", error);
        res.status(500).json({ success: false, message: "Erro ao fazer upload do arquivo" });
    }
}

export const removeAttachment = async (req, res) => {
    const { id } = req.params;
    const { public_id } = req.body; // Enviamos pelo body para evitar problemas com barras na URL

    try {
        const subject = await Subject.findById(id);
        if (!subject) return res.status(404).json({ success: false, message: "Subject not found" });

        // Deleta o arquivo do Cloudinary
        await cloudinary.uploader.destroy(public_id);

        // Remove do array no MongoDB
        subject.attachments = subject.attachments.filter(att => att.public_id !== public_id);
        await subject.save();

        res.status(200).json({ success: true, message: "Arquivo removido com sucesso" });
    } catch (error) {
        console.log("error in removeAttachment ", error);
        res.status(500).json({ success: false, message: "Erro ao remover arquivo" });
    }
}


export const concludedReview = async (req, res) => {
    const { id } = req.params;
    const { review } = req.params;

    try {
        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({ success: false, message: "Subject not found" });
        }

        if (review === "review1") {
            subject.review1_concluded = true;
        } else if (review === "review2") {
            subject.review2_concluded = true;
        } else if (review === "review3") {
            subject.review3_concluded = true;
        }

        await subject.save();

        res.status(200).json({ success: true, message: "Review concluída com sucesso" });

    } catch (error) {
        console.log("error in concludedReview ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const UndoCompletedReview = async (req, res) => {
    const { id } = req.params;
    const { review } = req.params;

    try {
        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(400).json({ success: false, message: "Subject not found" });
        }

        if (review === "review1") {
            subject.review1_concluded = false;
        } else if (review === "review2") {
            subject.review2_concluded = false;
        } else if (review === "review3") {
            subject.review3_concluded = false;
        }

        await subject.save();

        res.status(200).json({ success: true, message: "Review desmarcada com sucesso" });
        
    } catch (error) {
        
    }
}



export const streamPdf = async (req, res) => {
    try {
        const { subjectId, publicId } = req.params;
        const decodedPublicId = decodeURIComponent(publicId);

        const subject = await Subject.findById(subjectId).populate('matter_id');

        if (!subject) {
            return res.status(404).json({ success: false, message: "Assunto não encontrado" });
        }

        //Verifica se o usuário que fez a requisição é o dono da matéria
        if (subject.matter_id.user_id.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: "Acesso negado. Você não é o dono deste arquivo." });
        }

        //Verifica se o arquivo existe dentro do assunto
        const attachment = subject.attachments.find(att => att.public_id === decodedPublicId);
        if (!attachment) {
            return res.status(404).json({ success: false, message: "Arquivo não encontrado no banco de dados." });
        }

        // Faz o download do Cloudinary e repassa (Pipe) para o Frontend
        https.get(attachment.url, (stream) => {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(attachment.name)}"`);

            // O pipe conecta o download do Cloudinary direto na resposta pro Frontend
            stream.pipe(res);
        }).on('error', (e) => {
            console.log("Erro no stream do Cloudinary: ", e);
            res.status(500).json({ success: false, message: "Erro ao ler o arquivo na nuvem." });
        });

    } catch (error) {
        console.log("error in streamPdf ", error);
        res.status(500).json({ success: false, message: "Erro interno no servidor" });
    }
}
