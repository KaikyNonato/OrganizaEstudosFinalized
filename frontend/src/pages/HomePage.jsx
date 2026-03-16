import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { BookOpenText, CircleCheck, Clock, ListTodo, TrendingUp, Plus, X, Link2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL } from '../../API_URL'
import { motion } from 'framer-motion'

const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const HomePage = () => {
    const { isAuthenticated, user, checkAuth } = useAuthStore()
    const [mattersCount, setMattersCount] = useState(0)
    const [pendingCount, setPendingCount] = useState(0)
    const [completedCount, setCompletedCount] = useState(0)
    const [todaysSchedule, setTodaysSchedule] = useState([])
    const [studiedTime, setStudiedTime] = useState(0)

    // ESTADOS PARA OS LINKS RÁPIDOS
    const [links, setLinks] = useState(user?.quickLinks || [])
    const [newLinkName, setNewLinkName] = useState('')
    const [newLinkUrl, setNewLinkUrl] = useState('')

    useEffect(() => {
        if (user?.quickLinks) {
            setLinks(user.quickLinks);
        }
    }, [user])

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            try {
                const [mattersResponse, subjectsResponse, timelineResponse, studyTimeResponse] = await Promise.all([
                    axios.get(API_URL + "/matter/get-matters", { withCredentials: true }),
                    axios.get(API_URL + "/subject/get-subjects", { withCredentials: true }),
                    axios.get(API_URL + "/timeline/get-timeline", { withCredentials: true }),
                    axios.get(API_URL + "/user/get-study-time", { withCredentials: true })
                ]);

                if (mattersResponse.data.success) {
                    setMattersCount(mattersResponse.data.matters.length);
                }

                if (subjectsResponse.data.success) {
                    const subjects = subjectsResponse.data.subjects;
                    let pending = 0;
                    let completed = 0;

                    subjects.forEach(sub => {
                        if (sub.status === 'CONCLUIDO') {
                            completed++;
                        } else {
                            pending++;
                        }
                    });

                    setPendingCount(pending);
                    setCompletedCount(completed);
                }

                if (timelineResponse.data.success) {
                    const todayIndex = new Date().getDay();
                    const todayString = daysOfWeek[todayIndex];
                    const todayItems = timelineResponse.data.timeline
                        .filter(item => item.day === todayString)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));
                    setTodaysSchedule(todayItems);
                }

                if (studyTimeResponse.data.success) {
                    setStudiedTime(studyTimeResponse.data.totalStudyTime);
                }
            } catch (error) {
                console.error("Erro ao buscar dados:", error)
            }
        }

        fetchData()
    }, [isAuthenticated])

    const formatStudyTime = (totalMinutes) => {
        if (!totalMinutes || totalMinutes === 0) return "0h";
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    };

    const handleAddLink = async (e) => {
        e.preventDefault();
        if (links.length >= 5) return toast.error("Limite máximo de 5 links atingido.");

        let formattedUrl = newLinkUrl;
        if (!/^https?:\/\//i.test(formattedUrl)) {
            formattedUrl = 'https://' + formattedUrl;
        }

        const updatedLinks = [...links, { name: newLinkName, url: formattedUrl }];

        try {
            const response = await axios.put(API_URL + "/user/update-user", { quickLinks: updatedLinks }, { withCredentials: true });
            if (response.data.success) {
                setLinks(updatedLinks);
                setNewLinkName('');
                setNewLinkUrl('');
                document.getElementById('add_link_modal').close();
                // checkAuth(); 
                toast.success("Link adicionado!");
            }
        } catch (error) {
            toast.error("Erro ao salvar link.");
        }
    }

    const handleDeleteLink = async (indexToRemove) => {
        const updatedLinks = links.filter((_, idx) => idx !== indexToRemove);
        try {
            const response = await axios.put(API_URL + "/user/update-user", { quickLinks: updatedLinks }, { withCredentials: true });
            if (response.data.success) {
                setLinks(updatedLinks);
                // checkAuth(); 
                toast.success("Link removido!");
            }
        } catch (error) {
            toast.error("Erro ao remover link.");
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='flex flex-col gap-6'>
            <div className='flex justify-between items-center gap-2'>
                <h3 className='font-medium min-w-0 truncate'>◉ Visão geral dos seus estudos</h3>

                {/* VERSÃO DESKTOP: LINKS EM BOLINHAS */}
                <div className='hidden md:flex gap-3 items-center shrink-0'>
                    {links.map((link, idx) => (
                        <div key={idx} className="relative group">
                            <a
                                className='border border-base-content/20 bg-base-200 hover:bg-base-300 transition-colors rounded-full w-10 h-10 flex items-center justify-center font-bold uppercase text-sm'
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={link.name}
                            >
                                {link.name.charAt(0)}
                            </a>
                            <button
                                onClick={() => handleDeleteLink(idx)}
                                className="absolute -top-1 -right-1 bg-error text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remover link"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}

                    {links.length < 5 && (
                        <button
                            onClick={() => document.getElementById('add_link_modal').showModal()}
                            className='border border-dashed border-base-content/40 text-base-content/60 hover:text-base-content hover:border-base-content rounded-full w-10 h-10 flex items-center justify-center transition-colors'
                            title="Adicionar Link"
                        >
                            <Plus size={18} />
                        </button>
                    )}
                </div>

                {/* VERSÃO MOBILE: BOTÃO PARA ABRIR MODAL */}
                <div className='md:hidden shrink-0'>
                    <button
                        onClick={() => document.getElementById('mobile_links_modal').showModal()}
                        className='btn btn-sm btn-ghost border border-base-content/20 rounded-full text-xs font-medium'
                    >
                        <Link2 size={14} /> Links
                    </button>
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 '>
                    <div className='flex flex-col gap-3  border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Matérias</span>
                            <BookOpenText size={15} ></BookOpenText>
                        </div>
                        <span className='text-4xl'>{mattersCount}</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Assuntos pendentes</span>
                            <ListTodo size={15} ></ListTodo>
                        </div>
                        <span className='text-4xl'>{pendingCount}</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Assuntos concluídos</span>
                            <CircleCheck size={15} ></CircleCheck>
                        </div>
                        <span className='text-4xl'>{completedCount}</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Horas estudadas</span>
                            <Clock size={15} />
                        </div>
                        <span className='text-4xl'>{formatStudyTime(studiedTime)}</span>
                    </div>
                </div>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold text-xl sm:text-2xl'>Progresso Geral</span>
                            <TrendingUp size={20} ></TrendingUp>
                        </div>
                        <progress className="progress w-full h-3.5" value={(pendingCount + completedCount) > 0 ? (completedCount / (pendingCount + completedCount) * 100) : 0} max="100"></progress>
                        <span className="text-sm">{(pendingCount + completedCount) > 0 ? (completedCount / (pendingCount + completedCount) * 100).toFixed(1) : 0}% dos assuntos foram concluídos</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Estudar Hoje</span>
                            <span className='text-xs badge badge-ghost'>{daysOfWeek[new Date().getDay()]}</span>
                        </div>
                        <div className='flex flex-col gap-2 overflow-y-auto max-h-[200px]'>
                            {todaysSchedule.length > 0 ? (
                                todaysSchedule.map((item) => (
                                    <div key={item._id} className='flex items-center justify-between bg-base-200/50 p-2 rounded-lg border border-base-content/5'>
                                        <div className='flex items-center gap-2'>
                                            <div className={`w-2 h-2 rounded-full ${item.matter_id?.color === '#ff6467' ? 'bg-red-400' :
                                                item.matter_id?.color === '#05df72' ? 'bg-green-400' :
                                                    item.matter_id?.color === '#50a2ff' ? 'bg-blue-400' :
                                                        item.matter_id?.color === '#ff8904' ? 'bg-orange-400' :
                                                            'bg-purple-400'
                                                }`}></div>
                                            <span className='font-medium text-sm truncate max-w-[120px] sm:max-w-[200px]'>{item.matter_id?.title}</span>
                                        </div>
                                        <span className='text-xs font-mono opacity-70'>{item.startTime} - {item.endTime}</span>
                                    </div>
                                ))
                            ) : (
                                <span className='text-sm text-base-content/60 italic'>Nenhum horário agendado.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE ADICIONAR LINK */}
            <dialog id="add_link_modal" className="modal">
                <div className="modal-box max-w-sm">
                    <h3 className="font-bold text-lg mb-4">Adicionar Link Rápido</h3>
                    <form onSubmit={handleAddLink} className="flex flex-col gap-3">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Nome</span></label>
                            <input
                                type="text"
                                placeholder="Ex: YouTube"
                                className="input input-bordered w-full"
                                value={newLinkName}
                                onChange={(e) => setNewLinkName(e.target.value)}
                                maxLength="15"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">URL do Site</span></label>
                            <input
                                type="text"
                                placeholder="Ex: youtube.com"
                                className="input input-bordered w-full"
                                value={newLinkUrl}
                                onChange={(e) => setNewLinkUrl(e.target.value)}
                                required
                            />
                        </div>
                        <div className="modal-action mt-6">
                            <button type="button" className="btn" onClick={() => document.getElementById('add_link_modal').close()}>Cancelar</button>
                            <button type="submit" className="btn btn-primary">Salvar Link</button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* MODAL DE LINKS PARA MOBILE */}
            <dialog id="mobile_links_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Meus Links Rápidos</h3>

                    <div className="flex flex-col gap-2">
                        {links.length === 0 ? (
                            <p className="text-sm text-base-content/60 italic text-center py-4">Nenhum link adicionado.</p>
                        ) : (
                            links.map((link, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-base-200 p-2.5 rounded-lg">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 flex-1 overflow-hidden hover:text-primary transition-colors"
                                    >
                                        <div className="bg-base-100 border border-base-content/10 rounded-full w-8 h-8 flex items-center justify-center font-bold uppercase text-xs shrink-0">
                                            {link.name.charAt(0)}
                                        </div>
                                        <span className="font-medium truncate text-sm">{link.name}</span>
                                    </a>
                                    <button
                                        onClick={() => handleDeleteLink(idx)}
                                        className="btn btn-sm btn-circle btn-ghost text-error"
                                        title="Remover link"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {links.length < 5 && (
                        <button
                            onClick={() => {
                                document.getElementById('mobile_links_modal').close();
                                document.getElementById('add_link_modal').showModal();
                            }}
                            className='btn btn-outline btn-sm w-full mt-4 border-dashed border-base-content/40 text-base-content/70'
                        >
                            <Plus size={16} /> Novo Link
                        </button>
                    )}

                    <div className="modal-action">
                        <form method="dialog" className="w-full">
                            <button className="btn w-full">Fechar</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </motion.div>
    )
}

export default HomePage
