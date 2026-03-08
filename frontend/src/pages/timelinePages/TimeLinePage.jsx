import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, X, Pencil, Trash } from 'lucide-react'
import { API_URL } from '../../../API_URL'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'

const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const TimeLinePage = () => {
    const { isAuthenticated } = useAuthStore()
    const [schedule, setSchedule] = useState([]);
    const [matters, setMatters] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        day: 'Segunda',
        startTime: '',
        endTime: '',
        matter_id: ''
    });

    useEffect(() => {
        if (!isAuthenticated) return; 
        fetchMatters();
        fetchTimeline();
    }, [isAuthenticated]);

    const fetchMatters = async () => {
        try {
            const res = await axios.get(API_URL+'/matter/get-matters');
            if (res.data.success) {
                setMatters(res.data.matters);
            }
        } catch (error) {
            console.error("Erro ao buscar matérias:", error);
        }
    };

    const fetchTimeline = async () => {
        try {
            const res = await axios.get(API_URL+'/timeline/get-timeline');
            if (res.data.success) {
                setSchedule(res.data.timeline);
            }
        } catch (error) {
            console.log("Erro ao buscar cronograma (rota pode não existir ainda)");
        }
    };

    const handleSaveMatter = async (e) => {
        e.preventDefault();
        
        const toastId = toast.loading("Salvando horário...")

        try {
            if (isEditing) {
                const res = await axios.put(API_URL+`/timeline/update-timeline/${editId}`, formData);
                if (res.data.success) {
                    toast.success("Horário atualizado com sucesso!", { id: toastId });
                    // Atualiza o item na lista local
                    setSchedule(prev => prev.map(item => item._id === editId ? res.data.timeLine : item));
                }
            } else {
                const res = await axios.post(API_URL+'/timeline/add-matter-timeline', formData);
                if (res.data.success) {
                    toast.success("Matéria adicionada com sucesso!", { id: toastId });
                    // Atualiza a lista localmente
                    const selectedMatter = matters.find(m => m._id === formData.matter_id);
                    const newEntry = { ...res.data.timeLine, matter_id: selectedMatter };
                    setSchedule(prev => [...prev, newEntry]);
                }
            }

            document.getElementById('add_matter_modal').close();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao salvar");
        }
    };

    const handleDelete = async (id) => {
        // if (!window.confirm("Tem certeza que deseja excluir este horário?")) return;
        const toastId = toast.loading("Deletando horário...")

        try {
            const res = await axios.delete(API_URL+`/timeline/delete-timeline/${id}`);
            if (res.data.success) {
                toast.success("Horário removido!", { id: toastId });
                setSchedule(prev => prev.filter(item => item._id !== id));
            }
        } catch (error) {
            toast.error("Erro ao excluir horário");
        }
    };

    const openAddModal = () => {
        resetForm();
        setIsEditing(false);
        document.getElementById('add_matter_modal').showModal();
    };

    const openEditModal = (item) => {
        setFormData({
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            matter_id: item.matter_id?._id || ""
        });
        setEditId(item._id);
        setIsEditing(true);
        document.getElementById('add_matter_modal').showModal();
    };

    const resetForm = () => {
        setFormData({
            day: 'Segunda',
            startTime: '',
            endTime: '',
            matter_id: ''
        });
        setEditId(null);
    };

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex justify-between items-center gap-3'>
                <h3 className=' font-medium'>◉ Organize seus horários de estudo</h3>
                {isAuthenticated ? (
                    <button onClick={openAddModal} className='btn'>
                        <Plus size={20} /> Adicionar Matéria
                    </button>
                ) : (
                    <Link to="/login" className="btn btn-soft btn-sm">Faça login para adicionar</Link>
                )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {daysOfWeek.map((day) => (
                    <div key={day} className='flex flex-col gap-3 border border-base-content/20 rounded-lg p-6 shadow-md'>
                        <div className=''>
                            <h2 className='font-semibold  '>{day}</h2>
                        </div>

                        <div className='flex-1 space-y-2 '>
                            {schedule
                                .filter(item => item.day === day)
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map((item) => (
                                    <div key={item._id} className='border border-base-content/20 rounded-lg px-2 py-1 hover:shadow-md transition-shadow cursor-pointer group hover:bg-base-200/50'>
                                        <div className='flex justify-between items-center'>

                                            <div className='flex items-center  gap-2'>
                                                <div className={`w-3 h-3 rounded-full ${item.matter_id?.color === '#ff6467' ? 'bg-red-400' :
                                                    item.matter_id?.color === '#05df72' ? 'bg-green-400' :
                                                        item.matter_id?.color === '#50a2ff' ? 'bg-blue-400' :
                                                            item.matter_id?.color === '#ff8904' ? 'bg-orange-400' :
                                                                'bg-purple-400'
                                                    }`}>
                                                </div>
                                                <div>
                                                    <div className='flex items-center gap-2'>
                                                        <h3 className='font-medium text-sm'>{item.matter_id?.title || "Matéria"}</h3>
                                                    </div>
                                                    <div className='flex justify-between items-center mb-1'>
                                                        <span className='text-xs text-base-content/60'>
                                                            {item.startTime} - {item.endTime}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isAuthenticated && (
                                            <div className='flex gap-2'>
                                                
                                                <button onClick={() => openEditModal(item)} className={`hover:cursor-pointer ${item.matter_id?.color === '#ff6467' ? 'hover:text-red-400' :
                                                    item.matter_id?.color === '#05df72' ? 'hover:text-green-400' :
                                                        item.matter_id?.color === '#50a2ff' ? 'hover:text-blue-400' :
                                                            item.matter_id?.color === '#ff8904' ? 'hover:text-orange-400' :
                                                                'hover:text-purple-400'
                                                    }`}>
                                                    <Pencil size={15}></Pencil>
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className={`hover:cursor-pointer ${item.matter_id?.color === '#ff6467' ? 'hover:text-red-400' :
                                                    item.matter_id?.color === '#05df72' ? 'hover:text-green-400' :
                                                        item.matter_id?.color === '#50a2ff' ? 'hover:text-blue-400' :
                                                            item.matter_id?.color === '#ff8904' ? 'hover:text-orange-400' :
                                                                'hover:text-purple-400'
                                                    }`}>
                                                    <Trash size={15}></Trash>
                                                </button>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            }

                            {schedule.filter(item => item.day === day).length === 0 && (
                                <div className='h-full flex flex-col text-base-content/60 '>
                                    <span className='text-xs'>Sem horários</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Adicionar Matéria */}
            <dialog id="add_matter_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">{isEditing ? 'Editar Horário' : 'Adicionar ao Cronograma'}</h3>

                    <form onSubmit={handleSaveMatter} className="py-4 flex flex-col gap-4">
                        <div>
                            <label className="label">
                                <span className="label-text font-medium">Dia da Semana</span>
                            </label>
                            <select
                                value={formData.day}
                                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                className="select select-bordered w-full"
                            >
                                {daysOfWeek.map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text font-medium">Matéria</span>
                            </label>
                            <select
                                value={formData.matter_id}
                                onChange={(e) => setFormData({ ...formData, matter_id: e.target.value })}
                                className="select select-bordered w-full"
                                required
                            >
                                <option value="">Selecione uma matéria</option>
                                {matters.map(matter => (
                                    <option key={matter._id} value={matter._id}>{matter.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Início</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Fim</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="input input-bordered w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => document.getElementById('add_matter_modal').close()}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}

export default TimeLinePage
