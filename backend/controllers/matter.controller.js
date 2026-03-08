import cloudinary from '../utils/cloudinary.js';
import Matter from "../models/matter.model.js";
import Subject from "../models/subject.model.js";

export const createMatter = async (req, res) => {
    const { title, color } = req.body;

    try {
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        const matter = new Matter({
            title,
            user_id: req.userId,
            color: color || "#000000"
        });

        await matter.save();

        res.status(201).json({ success: true, message: "Matter created successfully", matter });
    } catch (error) {
        console.log("error in createMatter ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getMatters = async (req, res) => {    
    try {
        const matters = await Matter.find({ user_id: req.userId });
        res.status(200).json({ success: true, matters });
    } catch (error) {
        console.log("error in getMatters ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteMatter = async (req, res) => {
    const { id } = req.params;

    try {
        const matter = await Matter.findOne({ _id: id, user_id: req.userId });

        if (!matter) {
            return res.status(404).json({ success: false, message: "Matter not found" });
        }

        // 1. Buscar todos os assuntos dessa matéria
        const subjects = await Subject.find({ matter_id: id });

        // 2. Deletar arquivos do Cloudinary de todos os assuntos encontrados
        for (const subject of subjects) {
            if (subject.attachments && subject.attachments.length > 0) {
                const deletePromises = subject.attachments.map(file => cloudinary.uploader.destroy(file.public_id));
                await Promise.all(deletePromises);
            }
        }

        // 3. Deletar os assuntos e a matéria do banco de dados
        await Subject.deleteMany({ matter_id: id });
        await Matter.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Matter deleted successfully" });
    } catch (error) {
        console.log("error in deleteMatter ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const updateMatter = async (req, res) => {
    const { id } = req.params;
    const { title, color } = req.body;

    try {
        const matter = await Matter.findOne({ _id: id, user_id: req.userId });

        if (!matter) {
            return res.status(404).json({ success: false, message: "Matter not found" });
        }

        if (title) matter.title = title;
        if (color) matter.color = color;

        await matter.save();

        res.status(200).json({ success: true, message: "Matter updated successfully", matter });
        
    } catch (error) {
        
    }
}
