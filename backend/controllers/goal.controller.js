import Goal from "../models/goal.model.js";

export const createGoal = async (req, res) => {
    const { matter_id, quantity, title, daysOfWeek } = req.body;

    try {
        const existingGoal = await Goal.findOne({ matter_id, user_id: req.userId });

        if (existingGoal) {
            return res.status(400).json({
                success: false,
                message: "Você já possui uma meta cadastrada para esta matéria."
            });
        }

        const goal = new Goal({
            matter_id,
            quantity,
            title,
            daysOfWeek,
            user_id: req.userId
        });

        await goal.save();
        res.status(201).json({ success: true, message: "Goal created successfully", goal });
    } catch (error) {
        console.log("error in createGoal ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user_id: req.userId });
        res.status(200).json({ success: true, goals });
    } catch (error) {
        console.log("error in getGoals ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

//Editar Meta
export const updateGoal = async (req, res) => {
    const { id } = req.params;
    const { quantity, daysOfWeek } = req.body;

    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: id, user_id: req.userId },
            { quantity, daysOfWeek },
            { new: true }
        );
        res.status(200).json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
}

//  Marcar/Desmarcar conclusão de um dia
export const toggleCompletion = async (req, res) => {
    const { id } = req.params;
    const { date } = req.body; 

    try {
        const goal = await Goal.findOne({ _id: id, user_id: req.userId });
        if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

        const hasCompleted = goal.completedDates.includes(date);
        
        if (hasCompleted) {
            // DESMARCOU: Remove do array e tira 1 do total
            goal.completedDates = goal.completedDates.filter(d => d !== date);
            goal.lifetimeCompleted = Math.max(0, goal.lifetimeCompleted - 1);
        } else {
            // MARCOU: Adiciona no array e soma 1 no total
            goal.completedDates.push(date);
            goal.lifetimeCompleted += 1;
        }

        await goal.save();
        res.status(200).json({ success: true, goal });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteGoal = async (req, res) => {
    const { id } = req.params;

    try {
        // Garante que só o dono da meta pode deletá-la
        const goal = await Goal.findOneAndDelete({ _id: id, user_id: req.userId });

        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }

        res.status(200).json({ success: true, message: "Goal deleted successfully" });
    } catch (error) {
        console.log("error in deleteGoal ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}