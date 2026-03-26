import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, CheckCircle2, Trash, Trophy, Flame } from 'lucide-react'
import axios from 'axios';
import { API_URL } from '../../../API_URL';
import toast from 'react-hot-toast';
import { useMatterStore } from '../../store/matterStore';

const WEEK_DAYS = [
    { label: "Don", fullName: "Domingo", index: 0 },
    { label: "Seg", fullName: "Segunda", index: 1 },
    { label: "Ter", fullName: "Terça", index: 2 },
    { label: "Qua", fullName: "Quarta", index: 3 },
    { label: "Qui", fullName: "Quinta", index: 4 },
    { label: "Sex", fullName: "Sexta", index: 5 },
    { label: "Sáb", fullName: "Sábado", index: 6 },
];

const getDatesOfCurrentWeek = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const dates = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - currentDay + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
    }
    return dates;
};

const getTodayDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// O ALGORITMO DO STREAK
const calculateStreak = (goal, todayStr) => {
    if (!goal.daysOfWeek || goal.daysOfWeek.length === 0) return 0;

    let streak = 0;
    const [year, month, day] = todayStr.split('-').map(Number);
    let currentDate = new Date(year, month - 1, day); // Começa exatamente à meia-noite de hoje

    // Volta no tempo até 365 dias para contar a ofensiva
    for (let i = 0; i < 365; i++) {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        const dayOfWeek = currentDate.getDay(); // 0 a 6

        // Verifica se este dia da semana faz parte da meta
        if (goal.daysOfWeek.includes(dayOfWeek)) {
            if (goal.completedDates.includes(dateStr)) {
                streak++; // Cumpriu a meta, ofensiva aumenta!
            } else if (dateStr !== todayStr) {
                break; // Falhou em um dia no passado, a ofensiva é quebrada!
            }
            // OBS: Se for 'hoje' e não estiver cumprida, a ofensiva não quebra (ainda há tempo)
        }

        // Volta um dia no calendário
        currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
};

const GoalsPage = () => {
    const { matters, fetchMatters } = useMatterStore();
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const weekDates = getDatesOfCurrentWeek();
    const todayStr = getTodayDateStr();

    const [matterId, setMatterId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [daysOfWeek, setDaysOfWeek] = useState([]);
    const [goalType, setGoalType] = useState('questões');

    const [editingGoal, setEditingGoal] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');
    const [editDaysOfWeek, setEditDaysOfWeek] = useState([]);

    const fetchGoals = useCallback(async () => {
        try {
            const response = await axios.get(API_URL + "/goal/get-goals", { withCredentials: true });
            if (response.data.success) {
                setGoals(response.data.goals);
            }
        } catch (error) {
            console.error("Erro ao buscar metas:", error);
        }
    }, []);

    useEffect(() => {
        fetchMatters(false);
        fetchGoals();
    }, [fetchMatters, fetchGoals]);

    const availableMatters = matters.filter(matter =>
        !goals.some(goal => goal.matter_id === matter._id)
    );

    let totalMetasSemana = 0;
    let concluidasSemana = 0;
    let lifetimeCompletedGoals = 0;

    goals.forEach(goal => {
        lifetimeCompletedGoals += (goal.lifetimeCompleted || 0);

        totalMetasSemana += goal.daysOfWeek.length;
        goal.daysOfWeek.forEach(dayIndex => {
            const dateForThisDay = weekDates[dayIndex];
            if (goal.completedDates.includes(dateForThisDay)) {
                concluidasSemana++;
            }
        });
    });

    const progressPercentage = totalMetasSemana > 0 ? Math.round((concluidasSemana / totalMetasSemana) * 100) : 0;

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        if (daysOfWeek.length === 0) return toast.error("Selecione pelo menos um dia da semana.");
        setIsLoading(true);

        try {
            const selectedMatter = matters.find(m => m._id === matterId);
            if (!selectedMatter) return toast.error("Selecione uma matéria válida.");

            const finalTitle = `${selectedMatter.title.trim()} - ${goalType}`;
            const response = await axios.post(API_URL + "/goal/create-goal", {
                title: finalTitle, quantity: Number(quantity), matter_id: matterId, daysOfWeek
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success("Meta criada!");
                setMatterId(''); setQuantity(''); setDaysOfWeek([]); setGoalType('questões');
                document.getElementById('add_goal_modal').close();
                fetchGoals();
            }
        } catch (error) { toast.error(error.response?.data?.message || "Erro ao criar meta"); }
        finally { setIsLoading(false); }
    }

    const handleUpdateGoal = async (e) => {
        e.preventDefault();
        if (editDaysOfWeek.length === 0) return toast.error("Selecione pelo menos um dia.");
        setIsLoading(true);

        try {
            const response = await axios.put(API_URL + `/goal/update-goal/${editingGoal._id}`, {
                quantity: Number(editQuantity), daysOfWeek: editDaysOfWeek
            }, { withCredentials: true });

            if (response.data.success) {
                toast.success("Meta atualizada!");
                document.getElementById('edit_goal_modal').close();
                fetchGoals();
            }
        } catch (error) { toast.error("Erro ao atualizar"); }
        finally { setIsLoading(false); }
    }

    const toggleDayCompletion = async (goalId, dateStr) => {
        try {
            setGoals(prev => prev.map(g => {
                if (g._id !== goalId) return g;
                const isAdding = !g.completedDates.includes(dateStr);
                const newDates = isAdding
                    ? [...g.completedDates, dateStr]
                    : g.completedDates.filter(d => d !== dateStr);

                // Atualiza também o contador lifetime localmente para feedback imediato
                const newLifetime = isAdding ? (g.lifetimeCompleted || 0) + 1 : Math.max(0, (g.lifetimeCompleted || 0) - 1);

                return { ...g, completedDates: newDates, lifetimeCompleted: newLifetime };
            }));

            await axios.put(API_URL + `/goal/toggle-completion/${goalId}`, { date: dateStr }, { withCredentials: true });
        } catch (error) {
            toast.error("Erro ao atualizar status");
            fetchGoals();
        }
    }

    const handleDeleteGoal = async (goalId) => {

        try {
            const response = await axios.delete(API_URL + `/goal/delete-goal/${goalId}`, { withCredentials: true });
            if (response.data.success) {
                toast.success("Meta excluída com sucesso!");
                fetchGoals();
            }
        } catch (error) {
            toast.error("Erro ao excluir meta");
        }
    }

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setEditQuantity(goal.quantity);
        setEditDaysOfWeek(goal.daysOfWeek);
        document.getElementById('edit_goal_modal').showModal();
    }

    const toggleDaySelection = (dayIndex, isEdit = false) => {
        if (isEdit) {
            setEditDaysOfWeek(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]);
        } else {
            setDaysOfWeek(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]);
        }
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className="flex justify-between items-center gap-2">
                <span>◉ Metas (Questões / Leitura)</span>
                <button className='btn' onClick={() => document.getElementById('add_goal_modal').showModal()}>
                    <Plus size={18} /> Nova Meta
                </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex flex-col justify-center gap-2 bg-base-200/50 p-5 rounded-lg border border-base-content/10'>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className='font-bold text-lg flex items-center gap-2'>
                                <CheckCircle2 className="text-primary" /> Progresso da Semana
                            </h3>
                            <p className="text-sm text-base-content/60 mt-1">
                                {concluidasSemana} de {totalMetasSemana} metas diárias concluídas
                            </p>
                        </div>
                    </div>
                    <progress className="progress progress-primary w-full mt-2" value={progressPercentage} max="100"></progress>
                </div>

                <div className='flex justify-between items-center bg-gradient-to-br from-primary/10 to-base-200/50 p-5 rounded-lg border border-primary/20'>
                    <div className='flex flex-col'>
                        <h3 className='font-bold text-lg flex items-center gap-2 text-primary'>
                            <Trophy className="text-primary" /> Total de metas completas
                        </h3>
                        <p className="text-sm text-base-content/60 mt-1">
                            Metas batidas desde o início
                        </p>
                        <span className="text-3xl font-black text-base-content mt-2">
                            {lifetimeCompletedGoals} <span className="text-sm font-medium text-base-content/50">dias concluídos</span>
                        </span>
                    </div>
                </div>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.length > 0 ? (
                    goals.map(goal => {
                        // Chamando o algoritmo para descobrir a streak desta meta
                        const currentStreak = calculateStreak(goal, todayStr);

                        return (
                            <div key={goal._id} className="p-4 border border-base-content/20 rounded-lg shadow-sm flex flex-col gap-3 bg-base-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1 items-start">
                                        <h4 className="font-bold truncate text-[15px]" title={goal.title}>{goal.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-primary bg-primary/10 p-1.5  rounded-lg">
                                                {goal.quantity} {goal.title.endsWith('leitura') ? 'minutos' : 'questões'} / dia
                                            </span>

                                            <div className={`flex items-center gap-1 text-xs font-bold p-1 rounded-lg border ${currentStreak > 0 ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-base-200 text-base-content/50 border-base-content/10'}`}>
                                                <Flame size={12} className={currentStreak > 0 ? 'fill-orange-500 text-orange-500' : ''} />
                                                {currentStreak}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1">
                                        <button onClick={() => openEditModal(goal)} className="btn btn-ghost btn-xs px-1 text-base-content/50 hover:text-primary" title="Editar Meta">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteGoal(goal._id)} className="btn btn-ghost btn-xs px-1 text-base-content/50 hover:text-red-500" title="Excluir Meta">
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <span className="text-[10px] uppercase font-bold text-base-content/40 tracking-wider">Dias agendados:</span>
                                    <div className="flex justify-between gap-1 mt-1.5">
                                        {WEEK_DAYS.map((day) => {
                                            const isActive = goal.daysOfWeek.includes(day.index);
                                            const dateStr = weekDates[day.index];
                                            const isCompleted = goal.completedDates.includes(dateStr);

                                            const isPast = dateStr < todayStr;
                                            const isMissed = isPast && !isCompleted;

                                            if (!isActive) {
                                                return (
                                                    <div key={day.index} className="w-8 h-8 rounded-lg bg-base-200/50 text-base-content/30 flex items-center justify-center text-xs border border-base-content/5">
                                                        {day.label}
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={day.index}
                                                    onClick={() => toggleDayCompletion(goal._id, dateStr)}
                                                    disabled={isPast}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all transform shadow-sm
                                                        ${isCompleted ?
                                                            `bg-success text-white shadow-success/30 ${isPast ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}` :
                                                            isMissed ?
                                                                'bg-error text-white shadow-error/30 opacity-80 cursor-not-allowed' :
                                                                'bg-base-200 text-base-content hover:bg-base-300 border border-base-content/20 hover:scale-105 active:scale-95'}
                                                    `}
                                                    title={isPast ? `${day.fullName} (${isCompleted ? 'Concluída e Travada' : 'Meta Perdida'})` : `${day.fullName} (${isCompleted ? 'Concluída' : 'Pendente'})`}
                                                >
                                                    {day.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="p-6 border border-dashed border-base-content/20 rounded-lg text-base-content/60 italic text-center col-span-full bg-base-200/30">
                        Nenhuma meta cadastrada. Clique em "Nova Meta" para começar!
                    </div>
                )}
            </section>

            <dialog id="add_goal_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Adicionar Nova Meta</h3>
                    <form onSubmit={handleCreateGoal} className="flex flex-col gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Tipo de Meta</span></label>
                            <select className="select select-bordered w-full" value={goalType} onChange={(e) => setGoalType(e.target.value)} required>
                                <option value="questões">Questões</option>
                                <option value="leitura">Leitura</option>
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Selecione a Matéria</span></label>
                            <select className="select select-bordered w-full" value={matterId} onChange={(e) => setMatterId(e.target.value)} required>
                                <option value="" disabled>Selecione uma matéria</option>
                                {availableMatters.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                                {availableMatters.length === 0 && <option value="" disabled>Todas as matérias já possuem meta</option>}
                            </select>
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">{goalType === 'questões' ? 'Questões' : 'Minutos'} por dia</span></label>
                            <input type="number" min="1" placeholder="Ex: 50" className="input input-bordered w-full" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Dias de estudo</span></label>
                            <div className="flex gap-2 justify-between mt-1">
                                {WEEK_DAYS.map(day => (
                                    <button
                                        type="button"
                                        key={day.index}
                                        onClick={() => toggleDaySelection(day.index)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${daysOfWeek.includes(day.index) ? 'bg-primary text-white shadow-md' : 'bg-base-200 text-base-content/60 hover:bg-base-300'}`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="modal-action mt-6">
                            <button type="button" className="btn" onClick={() => document.getElementById('add_goal_modal').close()}>Cancelar</button>
                            <button type="submit" disabled={isLoading || availableMatters.length === 0} className="btn btn-primary">
                                {isLoading ? <span className="loading loading-spinner"></span> : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>

            <dialog id="edit_goal_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Editar Meta: {editingGoal?.title}</h3>
                    <form onSubmit={handleUpdateGoal} className="flex flex-col gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Nova quantidade</span></label>
                            <input type="number" min="1" className="input input-bordered w-full" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} required />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Alterar dias</span></label>
                            <div className="flex gap-2 justify-between mt-1">
                                {WEEK_DAYS.map(day => (
                                    <button
                                        type="button"
                                        key={day.index}
                                        onClick={() => toggleDaySelection(day.index, true)}
                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${editDaysOfWeek.includes(day.index) ? 'bg-primary text-white shadow-md' : 'bg-base-200 text-base-content/60 hover:bg-base-300'}`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="modal-action mt-6">
                            <button type="button" className="btn" onClick={() => document.getElementById('edit_goal_modal').close()}>Cancelar</button>
                            <button type="submit" disabled={isLoading} className="btn btn-primary">
                                {isLoading ? <span className="loading loading-spinner"></span> : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop"><button>close</button></form>
            </dialog>
        </div>
    )
}

export default GoalsPage
