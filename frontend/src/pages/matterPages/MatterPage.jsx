import React, { useEffect, useState } from 'react'
import { Plus, Trash, Paperclip, PencilLine, ArrowUp, ArrowDown, FileText, CircleCheck, CircleX, ChevronDown, ChevronUp } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '../../../API_URL'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useMatterStore } from '../../store/matterStore'

// Componente isolado para gerenciar cada matéria e seus assuntos
const MatterItem = ({ matter }) => {
    const { subjectsByMatter, fetchSubjects, fetchMatters } = useMatterStore()
    const subjects = subjectsByMatter[matter._id] || []

    const [subjectTitle, setSubjectTitle] = useState('')
    const [editingSubject, setEditingSubject] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [editReviewDate, setEditReviewDate] = useState('') // NOVO: Estado para a data da revisão
    const [editTitleMatter, setEditTitleMatter] = useState('')
    const [editColorMatter, setEditColorMatter] = useState('')

    const [isExpanded, setIsExpanded] = useState(true)
    const [expandedAttachments, setExpandedAttachments] = useState({})

    const colors = [
        { hex: '#ff6467', className: 'bg-red-400' },
        { hex: '#05df72', className: 'bg-green-400' },
        { hex: '#50a2ff', className: 'bg-blue-400' },
        { hex: '#ff8904', className: 'bg-orange-400' },
        { hex: '#c27aff', className: 'bg-purple-400' }
    ]

    useEffect(() => {
        fetchSubjects(matter._id, false)
    }, [matter._id, fetchSubjects])

    const toggleAttachments = (subjectId) => {
        setExpandedAttachments(prev => ({ ...prev, [subjectId]: !prev[subjectId] }))
    }

    const handleFileUpload = async (e, subjectId) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            return toast.error("Apenas arquivos PDF são permitidos");
        }

        const subject = subjects.find(s => s._id === subjectId);
        if (subject.attachments && subject.attachments.length >= 3) {
            return toast.error("Máximo de 3 arquivos permitidos por assunto.");
        }

        const formData = new FormData();
        formData.append("file", file);

        const toastId = toast.loading("Enviando arquivo...");
        
        try {
            const response = await axios.post(API_URL+`/subject/${subjectId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (response.data.success) {
                toast.success("Arquivo anexado!", { id: toastId });
                fetchSubjects(matter._id, true);
                setExpandedAttachments(prev => ({ ...prev, [subjectId]: true }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao anexar arquivo", { id: toastId });
        }

        e.target.value = '';
    }

    const handleDeleteFile = async (subjectId, publicId) => {
        const toastId = toast.loading("Removendo arquivo...");

        try {
            const response = await axios.put(API_URL+`/subject/remove-file/${subjectId}`, {
                public_id: publicId
            }, { withCredentials: true });
            if (response.data.success) {
                toast.success("Arquivo removido!", { id: toastId });
                fetchSubjects(matter._id, true);
            }
        } catch (error) {
            toast.error("Erro ao remover arquivo", { id: toastId });
        }
    }

    const handleCreateSubject = async () => {
        if (!subjectTitle) return;

        const toastId = toast.loading("Criando assunto...")

        try {
            const response = await axios.post(API_URL+"/subject/create-subject", {
                title: subjectTitle,
                matter_id: matter._id
            }, { withCredentials: true })
            if (response.data.success) {
                toast.success("Assunto criado com sucesso!", { id: toastId })
                setSubjectTitle('')
                fetchSubjects(matter._id, true)
                setIsExpanded(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Erro ao criar assunto", { id: toastId })
        }
    }

    const openEditMatterModal = () => {
        setEditTitleMatter(matter.title)
        setEditColorMatter(matter.color)
        document.getElementById(`edit_matter_modal_${matter._id}`).showModal()
    }

    const handleUpdateMatter = async (e) => {
        e.preventDefault()
        const toastId = toast.loading("Atualizando matéria...")

        try {
            const response = await axios.put(API_URL+`/matter/update-matter/${matter._id}`, {
                title: editTitleMatter,
                color: editColorMatter
            }, { withCredentials: true })
            if (response.data.success) {
                toast.success("Matéria atualizada!", { id: toastId })
                fetchMatters(true)
                document.getElementById(`edit_matter_modal_${matter._id}`).close()
            }
        } catch (error) {
            toast.error("Erro ao atualizar matéria", { id: toastId })
        }
    }

    const handleDeleteSubject = async (subjectId) => {
        const toastId = toast.loading("Deletando assunto...")

        try {
            const response = await axios.delete(API_URL+`/subject/delete-subject/${subjectId}`, { withCredentials: true })
            if (response.data.success) {
                toast.success("Assunto deletado com sucesso!", { id: toastId })
                fetchSubjects(matter._id, true)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao deletar assunto", { id: toastId })
        }
    }

    const handleUpdateStatus = async (subjectId, newStatus) => {
        try {
            const response = await axios.put(API_URL+`/subject/update-subject/${subjectId}`, { status: newStatus }, { withCredentials: true })
            if (response.data.success) {
                fetchSubjects(matter._id, true)
            }
        } catch (error) {
            toast.error("Erro ao atualizar status")
        }
    }

    const openEditModal = (subject) => {
        setEditingSubject(subject)
        setEditTitle(subject.title)
        
        // Puxa a data da primeira revisão se existir para mostrar no input
        if (subject.review1 && subject.status === 'CONCLUIDO') {
            const d = new Date(subject.review1);
            // Corrige o fuso horário para preencher o input type="date" corretamente
            const offset = d.getTimezoneOffset() * 60000;
            const localDate = new Date(d.getTime() - offset);
            setEditReviewDate(localDate.toISOString().split('T')[0]);
        } else {
            setEditReviewDate('');
        }
        
        document.getElementById(`edit_subject_modal_${matter._id}`).showModal()
    }

    // NOVO: Função atualizada para enviar datas e título
    const handleUpdateSubject = async () => {
        const toastId = toast.loading("Editando assunto...")
        if (!editingSubject || !editTitle.trim()) return

        const payload = { title: editTitle }

        // Recalcula as datas se o usuário alterou a data da primeira revisão
        if (editReviewDate && editingSubject.status === 'CONCLUIDO') {
            const [year, month, day] = editReviewDate.split('-')
            const r1 = new Date(year, month - 1, day)
            
            // A revisão 2 (7 dias) é 6 dias após a primeira (dia 1)
            const r2 = new Date(r1)
            r2.setDate(r2.getDate() + 6)
            
            // A revisão 3 (30 dias) é 29 dias após a primeira
            const r3 = new Date(r1)
            r3.setDate(r3.getDate() + 29)

            payload.review1 = r1
            payload.review2 = r2
            payload.review3 = r3
        }

        try {
            const response = await axios.put(API_URL+`/subject/update-subject/${editingSubject._id}`, payload, { withCredentials: true })
            if (response.data.success) {
                toast.success("Assunto atualizado!", { id: toastId })
                fetchSubjects(matter._id, true)
                document.getElementById(`edit_subject_modal_${matter._id}`).close()
            }
        } catch (error) {
            toast.error("Erro ao atualizar assunto", { id: toastId })
        }
    }

    const handleMoveSubject = async (index, direction) => {
        const newSubjects = [...subjects]
        if (direction === 'up' && index > 0) {
            [newSubjects[index], newSubjects[index - 1]] = [newSubjects[index - 1], newSubjects[index]]
        } else if (direction === 'down' && index < newSubjects.length - 1) {
            [newSubjects[index], newSubjects[index + 1]] = [newSubjects[index + 1], newSubjects[index]]
        } else {
            return
        }

        useMatterStore.setState((state) => ({
            subjectsByMatter: {
                ...state.subjectsByMatter,
                [matter._id]: newSubjects
            }
        }))

        try {
            const updates = newSubjects.map((s, i) => ({ _id: s._id, order: i }))
            await axios.put(API_URL+"/subject/reorder-subjects", { updates }, { withCredentials: true })
        } catch (error) {
            toast.error("Erro ao salvar a nova ordem")
            fetchSubjects(matter._id, true)
        }
    }

    const handleDeleteMatter = async () => {
        const toastId = toast.loading("Deletando matéria...")
        try {
            const response = await axios.delete(API_URL+`/matter/delete-matter/${matter._id}`, { withCredentials: true })
            if (response.data.success) {
                toast.success("Matéria deletada com sucesso!", { id: toastId })
                fetchMatters(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao deletar matéria", { id: toastId })
        }
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }} 
            className="border border-base-content/20 p-4 sm:p-6 rounded-lg flex flex-col shadow-md bg-base-100"
        >
            <div className='flex items-center justify-between mb-2'>
                <div 
                    className='flex gap-2 items-center min-w-0 flex-1 cursor-pointer hover:opacity-70 transition-opacity'
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className={`rounded-full min-w-4 w-4 h-4 text-white ${matter.color === '#ff6467' ? 'bg-red-400' : matter.color === '#05df72' ? 'bg-green-400' : matter.color === '#50a2ff' ? 'bg-blue-400' : matter.color === '#ff8904' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                    <div className='flex items-center gap-2 min-w-0'>
                        <h3 className="font-bold text-lg truncate lg:max-w-100" title={matter.title}>{matter.title}</h3>
                    </div>
                    <div className="text-base-content/50 ml-1">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>
                
                <div className='flex gap-2 ml-4'>
                    <button onClick={openEditMatterModal} className='btn btn-sm btn-ghost hover:bg-transparent hover:border-transparent hover:shadow-none p-0 '><PencilLine className={`  ${matter.color === '#ff6467' ? 'hover:text-red-400' : matter.color === '#05df72' ? 'hover:text-green-400' : matter.color === '#50a2ff' ? 'hover:text-blue-400' : matter.color === '#ff8904' ? 'hover:text-orange-400' : 'hover:text-purple-400'}`} size={15}></PencilLine></button>
                    <button onClick={handleDeleteMatter} className='btn btn-sm btn-ghost hover:bg-transparent hover:border-transparent hover:shadow-none p-0' title='Deletar Matéria'><Trash className=' hover:text-red-400' size={15}></Trash></button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="overflow-hidden mt-2"
                    >
                        <div className='flex flex-col gap-4'>
                            {subjects.length > 0 ? (
                                subjects.map((subject, index) => (
                                    <div key={subject._id} className="flex flex-col">
                                        <div className={`bg-base-200/60 py-1.5 pl-3 pr-1 border-base-content/20 border text-sm flex flex-col gap-2 ${subject.attachments && subject.attachments.length > 0 ? 'rounded-t-lg' : 'rounded-lg'}`}>
                                            <div className='flex justify-between items-center'>
                                                <div className='flex gap-3 items-center min-w-0'>
                                                    <div className='flex flex-col'>
                                                        <button onClick={() => handleMoveSubject(index, 'up')} disabled={index === 0} className='btn btn-xs btn-ghost w-4 h-4 min-h-0 p-0 disabled:bg-transparent disabled:text-base-content/10'>
                                                            <ArrowUp size={15} />
                                                        </button>
                                                        <button onClick={() => handleMoveSubject(index, 'down')} disabled={index === subjects.length - 1} className='btn btn-sm btn-ghost w-4 h-4 min-h-0 p-0 disabled:bg-transparent disabled:text-base-content/10'>
                                                            <ArrowDown size={15} />
                                                        </button>
                                                    </div>
                                                    {subject.status === 'PENDENTE' ? <CircleX className='text-red-400 max-sm:min-w-5 min-w-5' size={15} /> : <CircleCheck className='text-green-400 max-sm:min-w-5 min-w-5' size={15} />}
                                                    <span className='font-semibold truncate lg:max-w-100' title={subject.title}>{subject.title}</span>
                                                </div>

                                                <div className='flex items-center gap-2 '>
                                                    <select className="select select-xs select-bordered mr-1 hover:cursor-pointer max-lg:w-16 lg:w-27" value={subject.status} onChange={(e) => handleUpdateStatus(subject._id, e.target.value)}>
                                                        <option value="PENDENTE">PENDENTE</option>
                                                        <option value="CONCLUIDO">CONCLUIDO</option>
                                                    </select>

                                                    <label
                                                        className={`cursor-pointer transition-colors ${subject.attachments?.length >= 3 ? 'text-gray-400 opacity-50 cursor-not-allowed' : ''}`}
                                                        title={subject.attachments?.length >= 3 ? 'Limite de 3 arquivos atingido' : 'Anexar PDF'}
                                                    >
                                                        <input
                                                            type="file"
                                                            accept=".pdf"
                                                            className='hidden'
                                                            onChange={(e) => handleFileUpload(e, subject._id)}
                                                            disabled={subject.attachments?.length >= 3}
                                                        />
                                                        <Paperclip className={`${matter.color === '#ff6467' ? 'hover:text-red-400' : matter.color === '#05df72' ? 'hover:text-green-400' : matter.color === '#50a2ff' ? 'hover:text-blue-400' : matter.color === '#ff8904' ? 'hover:text-orange-400' : 'hover:text-purple-400'}`} size={15} />
                                                    </label>

                                                    <button onClick={() => openEditModal(subject)} className='btn btn-sm btn-ghost hover:bg-transparent hover:border-transparent hover:shadow-none p-0'>
                                                        <PencilLine className={`${matter.color === '#ff6467' ? 'hover:text-red-400' : matter.color === '#05df72' ? 'hover:text-green-400' : matter.color === '#50a2ff' ? 'hover:text-blue-400' : matter.color === '#ff8904' ? 'hover:text-orange-400' : 'hover:text-purple-400'}`} size={15}></PencilLine>
                                                    </button>
                                                    <button onClick={() => handleDeleteSubject(subject._id)} className='btn btn-sm btn-ghost pl-0 hover:bg-transparent hover:border-transparent hover:shadow-none' title='Deletar Assunto'>
                                                        <Trash className='hover:text-red-400' size={15}></Trash>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {subject.attachments && subject.attachments.length > 0 && (
                                            <div className='border border-t-0 border-base-content/20 rounded-b-lg bg-base-200/40'>
                                                <div 
                                                    className='flex justify-between items-center p-2 cursor-pointer hover:bg-base-300/50 transition-colors'
                                                    onClick={() => toggleAttachments(subject._id)}
                                                >
                                                    <span className='text-xs font-semibold text-base-content/60 ml-2'>Anexos ({subject.attachments.length})</span>
                                                    <div className="text-base-content/50 mr-2">
                                                        {expandedAttachments[subject._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </div>
                                                </div>
                                                
                                                <AnimatePresence>
                                                    {expandedAttachments[subject._id] && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }} 
                                                            animate={{ height: 'auto', opacity: 1 }} 
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className='overflow-hidden'
                                                        >
                                                            <div className='p-2 pt-0 flex flex-col gap-2'>
                                                                {subject.attachments.map(file => (
                                                                    <a key={file.public_id} href={file.url} target="_blank" rel="noopener noreferrer" className='hover:underline hover:text-primary truncate font-normal' title={file.name}>
                                                                        <div className='btn btn-sm btn-soft flex justify-between items-center gap-2 hover:text-primary min-w-0 bg-base-100'>
                                                                            <div className='flex items-center gap-2 truncate'>
                                                                                <FileText className={`min-w-[20px] ${matter.color === '#ff6467' ? 'text-red-400' : matter.color === '#05df72' ? 'text-green-400' : matter.color === '#50a2ff' ? 'text-blue-400' : matter.color === '#ff8904' ? 'text-orange-400' : 'text-purple-400'}`} size={15}></FileText>
                                                                                {file.name}
                                                                            </div>
                                                                            <button onClick={(e) => { e.preventDefault(); handleDeleteFile(subject._id, file.public_id); }} className='text-base-content hover:text-red-400 p-1'>
                                                                                <Trash size={15} />
                                                                            </button>
                                                                        </div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <span className='text-xs text-base-content/50 italic mb-2 mt-1'>Nenhum assunto cadastrado.</span>
                            )}

                            <div className='flex items-center justify-between gap-2 mt-1'>
                                <input
                                    placeholder='Novo assunto'
                                    className='input-sm input w-full bg-base-200 focus:bg-base-100'
                                    type="text"
                                    value={subjectTitle}
                                    onChange={(e) => setSubjectTitle(e.target.value)}
                                />
                                <button onClick={handleCreateSubject} className='btn btn-sm' title='Adicionar'><Plus size={15}></Plus></button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL DE EDIÇÃO DE ASSUNTO COM NOVA OPÇÃO DE DATA */}
            <dialog id={`edit_subject_modal_${matter._id}`} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Editar Assunto</h3>
                    <div className="py-4 flex flex-col gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Título do Assunto</span></label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                        </div>

                        {/* Só mostra a opção de data se o assunto já estiver concluído */}
                        {editingSubject?.status === 'CONCLUIDO' && (
                            <div className="form-control mt-2 border-t border-base-content/10 pt-4">
                                <label className="label">
                                    <span className="label-text font-medium">Alterar Data da 1ª Revisão (24h)</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={editReviewDate}
                                    onChange={(e) => setEditReviewDate(e.target.value)}
                                />
                                <label className="label">
                                    <span className="text-base-content/60 text-xs whitespace-normal text-left">
                                        As revisões de 7 e 30 dias serão recalculadas automaticamente com base nesta nova data.
                                    </span>
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="modal-action">
                        <button className="btn" onClick={() => document.getElementById(`edit_subject_modal_${matter._id}`).close()}>Cancelar</button>
                        <button className="btn btn-primary" onClick={handleUpdateSubject}>Salvar</button>
                    </div>
                </div>
            </dialog>

            <dialog id={`edit_matter_modal_${matter._id}`} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Editar Matéria</h3>
                    <form onSubmit={handleUpdateMatter}>
                        <div className="py-4">
                            <input type="text" placeholder="Nome da matéria" className="input input-bordered w-full" value={editTitleMatter} onChange={(e) => setEditTitleMatter(e.target.value)} required />
                        </div>
                        <div className='flex gap-5 items-center justify-center'>
                            {colors.map((c) => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    className={`btn w-10 h-10 rounded-full ${c.className} ${editColorMatter === c.hex ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                    onClick={() => setEditColorMatter(c.hex)}
                                ></button>
                            ))}
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" title='Cancelar' onClick={() => document.getElementById(`edit_matter_modal_${matter._id}`).close()}>Cancelar</button>
                            <button type="submit" className="btn btn-primary " title='Salvar Matéria'>Salvar</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </motion.div>
    )
}

const MatterPage = () => {
    const { isAuthenticated } = useAuthStore()
    const { matters, fetchMatters } = useMatterStore()
    
    const [title, setTitle] = useState('')
    const [selectedColor, setSelectedColor] = useState('#ff6467')

    const colors = [
        { hex: '#ff6467', className: 'bg-red-400' },
        { hex: '#05df72', className: 'bg-green-400' },
        { hex: '#50a2ff', className: 'bg-blue-400' },
        { hex: '#ff8904', className: 'bg-orange-400' },
        { hex: '#c27aff', className: 'bg-purple-400' }
    ]

    useEffect(() => {
        if (isAuthenticated) {
            fetchMatters(false) 
        }
    }, [isAuthenticated, fetchMatters])

    const handleCreateMatter = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(API_URL+"/matter/create-matter", { title, color: selectedColor }, { withCredentials: true })
            if (response.data.success) {
                toast.success("Matéria criada com sucesso!")
                setTitle('')
                setSelectedColor('#ff6467')
                document.getElementById('create_matter_modal').close()
                fetchMatters(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Erro ao criar matéria")
        }
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center justify-between'>
                <p className='font-medium'>◉ Gerencie suas matérias e assuntos</p>
                {isAuthenticated ? (
                    <button className='btn' title='Adicionar nova Matéria' onClick={() => document.getElementById('create_matter_modal').showModal()}>
                        <Plus /> Nova Materia  
                    </button>
                ) : (
                    <Link to="/login" className="btn btn-soft btn-sm">Faça login para adicionar</Link>
                )}
            </div>

            <dialog id="create_matter_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Nova Matéria</h3>
                    <form onSubmit={handleCreateMatter}>
                        <div className="py-4">
                            <input type="text" placeholder="Nome da matéria" className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className='flex gap-5 items-center justify-center'>
                            {colors.map((c) => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    className={`btn w-10 h-10 rounded-full ${c.className} ${selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                    onClick={() => setSelectedColor(c.hex)}
                                ></button>
                            ))}
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" title='Cancelar adição da Matéria' onClick={() => document.getElementById('create_matter_modal').close()}>Cancelar</button>
                            <button type="submit" className="btn  btn-primary" title='Salvar Matéria'>Salvar</button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* LISTA DE MATÉRIAS */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-4'>
                {matters.length > 0 ? matters.map((matter) => (
                    <MatterItem key={matter._id} matter={matter} />
                )) : (
                    <div className="col-span-full text-center text-base-content/50 py-10 border border-dashed border-base-content/20 rounded-lg">
                        Nenhuma matéria cadastrada no momento.
                    </div>
                )}
            </div>
        </div>
    )
}

export default MatterPage
