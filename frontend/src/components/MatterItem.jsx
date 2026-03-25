// Arquivo: MatterItem.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader } from 'lucide-react';

import { API_URL } from '../../API_URL';
import { useMatterStore } from '../../src/store/matterStore';

// Importando os Sub-componentes que criamos
import MatterHeader from './MatterHeader';
import SubjectItem from './SubjectItem';
import MatterModals from './MatterModals';

const MatterItem = ({ matter }) => {
    const { subjectsByMatter, fetchSubjects, fetchMatters } = useMatterStore();
    const subjects = subjectsByMatter[matter._id] || [];

    const colors = [
        { hex: '#ff6467', className: 'bg-red-400' },
        { hex: '#05df72', className: 'bg-green-400' },
        { hex: '#50a2ff', className: 'bg-blue-400' },
        { hex: '#ff8904', className: 'bg-orange-400' },
        { hex: '#c27aff', className: 'bg-purple-400' }
    ];

    // UI States
    const [isExpanded, setIsExpanded] = useState(true);
    const [viewingSubject, setViewingSubject] = useState(null);

    // Form States
    const [subjectTitle, setSubjectTitle] = useState('');
    const [editingSubject, setEditingSubject] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editReviewDate, setEditReviewDate] = useState('');
    const [editTitleMatter, setEditTitleMatter] = useState('');
    const [editColorMatter, setEditColorMatter] = useState('');
    const [editLink, setEditLink] = useState('');

    // Loading States
    const [deletingFileId, setDeletingFileId] = useState(null);
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);
    const [isUpdatingSubject, setIsUpdatingSubject] = useState(false);
    const [isDeletingSubject, setIsDeletingSubject] = useState(null);
    const [isSavingSubject, setIsSavingSubject] = useState(false);
    const [isDeletingMatter, setIsDeletingMatter] = useState(false);

    useEffect(() => {
        fetchSubjects(matter._id, false);
    }, [matter._id, fetchSubjects]);

    // --- Controladores de Modais ---
    const openDetailsModal = (subject) => {
        setViewingSubject(subject);
        document.getElementById(`details_subject_modal_${matter._id}`).showModal();
    };

    const openEditMatterModal = () => {
        setEditTitleMatter(matter.title);
        setEditColorMatter(matter.color);
        document.getElementById(`edit_matter_modal_${matter._id}`).showModal();
    };

    const openEditModal = (subject) => {
        setEditingSubject(subject);
        setEditTitle(subject.title);
        setEditLink(subject.link || '');

        if (subject.review1 && subject.status === 'CONCLUIDO') {
            const d = new Date(subject.review1);
            const offset = d.getTimezoneOffset() * 60000;
            const localDate = new Date(d.getTime() - offset);
            setEditReviewDate(localDate.toISOString().split('T')[0]);
        } else {
            setEditReviewDate('');
        }
        document.getElementById(`edit_subject_modal_${matter._id}`).showModal();
    };

    // --- Lógicas de API ---
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
            const response = await axios.post(API_URL + `/subject/${subjectId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (response.data.success) {
                toast.success("Arquivo anexado!", { id: toastId });
                fetchSubjects(matter._id, true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao anexar arquivo", { id: toastId });
        }
        e.target.value = '';
    };

    const handleDeleteFile = async (subjectId, publicId) => {
        setDeletingFileId(publicId);
        try {
            const response = await axios.put(API_URL + `/subject/remove-file/${subjectId}`, { public_id: publicId }, { withCredentials: true });
            if (response.data.success) {
                toast.success("Arquivo removido!");
                await fetchSubjects(matter._id, true);
            }
        } catch (error) {
            toast.error("Erro ao remover arquivo");
        } finally {
            setDeletingFileId(null);
        }
    };

    const handleCreateSubject = async () => {
        if (!subjectTitle) return;
        setIsCreatingSubject(true);
        try {
            const response = await axios.post(API_URL + "/subject/create-subject", { title: subjectTitle, matter_id: matter._id }, { withCredentials: true });
            if (response.data.success) {
                toast.success("Assunto criado com sucesso!");
                setSubjectTitle('');
                fetchSubjects(matter._id, true);
                setIsExpanded(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao criar assunto");
        } finally {
            setIsCreatingSubject(false);
        }
    };

    const handleUpdateMatter = async (e) => {
        e.preventDefault();
        setIsUpdatingSubject(true);
        try {
            const response = await axios.put(API_URL + `/matter/update-matter/${matter._id}`, { title: editTitleMatter, color: editColorMatter }, { withCredentials: true });
            if (response.data.success) {
                toast.success("Matéria atualizada!");
                fetchMatters(true);
                document.getElementById(`edit_matter_modal_${matter._id}`).close();
            }
        } catch (error) {
            toast.error("Erro ao atualizar matéria");
        } finally {
            setIsUpdatingSubject(false);
        }
    };

    const handleUpdateSubject = async () => {
        if (!editingSubject || !editTitle.trim()) return;
        setIsSavingSubject(true);

        let finalLink = editLink.trim();
        if (finalLink && !/^https?:\/\//i.test(finalLink)) {
            finalLink = 'https://' + finalLink;
        }

        const payload = { title: editTitle, link: finalLink };

        if (editReviewDate && editingSubject.status === 'CONCLUIDO') {
            const [year, month, day] = editReviewDate.split('-');
            const r1 = new Date(year, month - 1, day);
            const r2 = new Date(r1); r2.setDate(r2.getDate() + 6);
            const r3 = new Date(r1); r3.setDate(r3.getDate() + 29);
            payload.review1 = r1; payload.review2 = r2; payload.review3 = r3;
        }

        try {
            const response = await axios.put(API_URL + `/subject/update-subject/${editingSubject._id}`, payload, { withCredentials: true });
            if (response.data.success) {
                toast.success("Assunto atualizado!");
                fetchSubjects(matter._id, true);
                document.getElementById(`edit_subject_modal_${matter._id}`).close();
            }
        } catch (error) {
            toast.error("Erro ao atualizar assunto");
        } finally {
            setIsSavingSubject(false);
        }
    };

    const handleUpdateStatus = async (subjectId, newStatus) => {
        try {
            const response = await axios.put(API_URL + `/subject/update-subject/${subjectId}`, { status: newStatus }, { withCredentials: true });
            if (response.data.success) {
                fetchSubjects(matter._id, true);
            }
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        setIsDeletingSubject(subjectId);
        try {
            const response = await axios.delete(API_URL + `/subject/delete-subject/${subjectId}`, { withCredentials: true });
            if (response.data.success) {
                toast.success("Assunto deletado com sucesso!");
                fetchSubjects(matter._id, true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao deletar assunto");
        } finally {
            setIsDeletingSubject(null);
        }
    };

    const handleDeleteMatter = async () => {
        setIsDeletingMatter(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
            const response = await axios.delete(API_URL + `/matter/delete-matter/${matter._id}`, { withCredentials: true });
            if (response.data.success) {
                toast.success("Matéria deletada com sucesso!");
                fetchMatters(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao deletar matéria");
        } finally {
            setIsDeletingMatter(false);
        }
    };

    const handleMoveSubject = async (index, direction) => {
        const newSubjects = [...subjects];
        if (direction === 'up' && index > 0) {
            [newSubjects[index], newSubjects[index - 1]] = [newSubjects[index - 1], newSubjects[index]];
        } else if (direction === 'down' && index < newSubjects.length - 1) {
            [newSubjects[index], newSubjects[index + 1]] = [newSubjects[index + 1], newSubjects[index]];
        } else return;

        useMatterStore.setState((state) => ({ subjectsByMatter: { ...state.subjectsByMatter, [matter._id]: newSubjects } }));

        try {
            const updates = newSubjects.map((s, i) => ({ _id: s._id, order: i }));
            await axios.put(API_URL + "/subject/reorder-subjects", { updates }, { withCredentials: true });
        } catch (error) {
            toast.error("Erro ao salvar a nova ordem");
            fetchSubjects(matter._id, true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-base-content/20 p-4 sm:p-6 rounded-lg flex flex-col shadow-md bg-base-100"
        >
            <MatterHeader 
                matter={matter} 
                isExpanded={isExpanded} 
                setIsExpanded={setIsExpanded} 
                openEditMatterModal={openEditMatterModal} 
                handleDeleteMatter={handleDeleteMatter} 
                isDeletingMatter={isDeletingMatter} 
            />

            <AnimatePresence>
                {isExpanded && (
                    <motion.div className="overflow-hidden mt-2">
                        <div className='flex flex-col gap-4'>
                            {subjects.length > 0 ? (
                                subjects.map((subject, index) => (
                                    <SubjectItem 
                                        key={subject._id}
                                        subject={subject}
                                        matter={matter}
                                        index={index}
                                        totalSubjects={subjects.length}
                                        onMove={handleMoveSubject}
                                        onUpdateStatus={handleUpdateStatus}
                                        onFileUpload={handleFileUpload}
                                        openEditModal={openEditModal}
                                        openDetailsModal={openDetailsModal}
                                        onDeleteSubject={handleDeleteSubject}
                                        isDeletingSubject={isDeletingSubject}
                                        onDeleteFile={handleDeleteFile}
                                        deletingFileId={deletingFileId}
                                    />
                                ))
                            ) : (
                                <span className='text-xs text-base-content/50 italic mb-2 mt-1'>Nenhum assunto cadastrado.</span>
                            )}

                            {/* Campo Criar Assunto */}
                            <div className='flex items-center justify-between gap-2 mt-1 p-[4px]'>
                                <input
                                    placeholder='Novo assunto'
                                    className='input-sm input w-full bg-base-200 focus:bg-base-100'
                                    type="text"
                                    value={subjectTitle}
                                    onChange={(e) => setSubjectTitle(e.target.value)}
                                />
                                <button onClick={handleCreateSubject} className='btn btn-sm' title='Adicionar' disabled={isCreatingSubject}>
                                    {isCreatingSubject ? <Loader size={15} className="animate-spin" /> : <Plus size={15} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isExpanded && (
                <div className='py-10 text-center text-sm text-base-content/50 italic'>
                    Matéria fechada, abra para ver o conteudo
                </div>
            )}

            <MatterModals 
                matter={matter} colors={colors} viewingSubject={viewingSubject} 
                editingSubject={editingSubject} editTitle={editTitle} setEditTitle={setEditTitle} 
                editLink={editLink} setEditLink={setEditLink} editReviewDate={editReviewDate} 
                setEditReviewDate={setEditReviewDate} isSavingSubject={isSavingSubject} 
                handleUpdateSubject={handleUpdateSubject} editTitleMatter={editTitleMatter} 
                setEditTitleMatter={setEditTitleMatter} editColorMatter={editColorMatter} 
                setEditColorMatter={setEditColorMatter} isUpdatingSubject={isUpdatingSubject} 
                handleUpdateMatter={handleUpdateMatter}
            />
        </motion.div>
    );
};

export default MatterItem;
