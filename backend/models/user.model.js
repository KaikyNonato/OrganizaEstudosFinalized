import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    totalStudyTime: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetPasswordtoken: String,
    resetPasswordexpiresAt: Date,
    verificationToken: String,
    verificationExpiresAt: {
        type: Date,
        expires: 0
    }

}, {timestamps: true});
// Gatilho: Quando um usuário for deletado, apaga tudo relacionado a ele
userSchema.pre('findOneAndDelete', async function() { 
    const userId = this.getQuery()._id;
    
    if (userId) {
        try {
            // Buscamos os modelos dinamicamente para evitar erro de importação
            const Matter = mongoose.model('Matter');
            const Subject = mongoose.model('Subject');
            const TimeLine = mongoose.model('TimeLine');

            // 1. Achar todas as matérias desse usuário
            const matters = await Matter.find({ user_id: userId });
            const matterIds = matters.map(m => m._id);

            // 2. Deletar todos os assuntos vinculados a essas matérias
            await Subject.deleteMany({ matter_id: { $in: matterIds } });

            // 3. Deletar as matérias e o cronograma do usuário
            await Matter.deleteMany({ user_id: userId });
            await TimeLine.deleteMany({ user_id: userId });
            
        } catch (error) {
            console.log("Erro na exclusão em cadeia: ", error);
        }
    }
});

const User = mongoose.model("User", userSchema);

export default User;
