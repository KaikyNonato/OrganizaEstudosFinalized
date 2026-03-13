import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Clock, CircleCheck, FileText, Paperclip } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { API_URL } from '../../../API_URL'
import { useAuthStore } from '../../store/authStore'
import { useMatterStore } from '../../store/matterStore' 
import { Link } from 'react-router-dom' // <-- IMPORTAÇÃO DO LINK ADICIONADA

const Countdown = ({ targetDate, textSize = "text-sm" }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            const isToday = now.getDate() === target.getDate() &&
                now.getMonth() === target.getMonth() &&
                now.getFullYear() === target.getFullYear();

            if (isToday) {
                setIsLate(false);
                setTimeLeft("HOJE");
            } else if (diff <= 0) {
                setIsLate(true);
                const absDiff = Math.abs(diff);
                const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

                if (days > 0) {
                    setTimeLeft(`${days} dia${days > 1 ? 's' : ''}`);
                } else {
                    const hours = Math.floor(absDiff / (1000 * 60 * 60));
                    const minutes = Math.floor(absDiff / (1000 * 60));
                    setTimeLeft(` ${hours > 0 ? hours + 'h' : minutes + 'm'}`);
                }
            } else if (diff > 24 * 60 * 60 * 1000) {
                setIsLate(false);
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                setTimeLeft(`${days + 1} dia${days >= 1 ? 's' : ''}`);
            } else {
                setIsLate(false);
                const hours = Math.floor(diff / (1000 * 60 * 60));
                setTimeLeft(`${hours} horas `);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return <span className={`font-mono ${textSize} truncate font-semibold ${isLate ? 'text-red-400' : timeLeft === 'HOJE' ? 'text-green-400' : ''} flex gap-1 items-center text-center`}>
        <Clock className='min-w-[20px] sm:hidden' size={15} />
        {isLate ? <span className='max-sm:hidden'>atrasado há</span> : (timeLeft !== "HOJE" && <span className='max-sm:hidden'>em</span>)}
        {timeLeft}
    </span>;
};

const ReviewsPage = () => {
    const { allSubjects: subjects, fetchAllSubjects } = useMatterStore()
    const [selectedSubject, setSelectedSubject] = useState(null)
    const { isAuthenticated } = useAuthStore()

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllSubjects(false)
        }
    }, [isAuthenticated, fetchAllSubjects])

    const handleConclude = async (id, review) => {
        try {
            const response = await axios.put(API_URL + `/subject/concluded-review/${id}/${review}`, {}, { withCredentials: true })
            if (response.data.success) {
                toast.success("Revisão concluída")
                fetchAllSubjects(true)
            }
        } catch (error) {
            console.error("Erro ao concluir revisão:", error)
            toast.error("Erro ao concluir revisão")
        }
    }

    const checkIsLate = (date) => {
        return new Date(date) < new Date();
    }

    const checkIsToday = (date) => {
        const d = new Date(date);
        const today = new Date();
        return d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
    }

    const openSubjectModal = (subject) => {
        setSelectedSubject(subject)
        document.getElementById('subject_details_modal').showModal()
    }

    return (
        <div className='flex flex-col gap-6'>
            <p className='font-medium'>◉ Revisões espaçadas de 24h, 7 e 30 dias</p>
            <div className='flex flex-col gap-6'>

                {/* --- 24 HORAS --- */}
                <div className='border border-base-content/20 p-6 rounded-lg flex flex-col gap-2 shadow-md'>
                    <div className='font-bold  text-lg flex items-center gap-2'>
                        <Clock size={20}></Clock>
                        24 Horas
                    </div>
                    {subjects.filter(subject => subject.review1 && !subject.review1_concluded).length === 0 ? (
                        <span className='text-sm text-base-content/60'>Nenhuma revisão cadastrada</span>
                    ) : (subjects.filter(subject => subject.review1 && !subject.review1_concluded).sort((a, b) => new Date(a.review1) - new Date(b.review1)).map(subject => (
                        <div className={`border rounded-lg p-2 flex justify-between items-center gap-2 cursor-pointer hover:bg-base-200/50 hover:shadow-md transition-shadow ${checkIsToday(subject.review1) ? 'border-green-400' : checkIsLate(subject.review1) ? 'border-red-400' : 'border-base-content/20'}`} key={subject._id} onClick={() => openSubjectModal(subject)}>
                            <div className='flex items-center gap-2 min-w-0'>
                                <div className={`rounded-full min-w-4 min-h-4 text-white ${subject.matter_id?.color === '#ff6467' ? 'bg-red-400' : subject.matter_id?.color === '#05df72' ? 'bg-green-400' : subject.matter_id?.color === '#50a2ff' ? 'bg-blue-400' : subject.matter_id?.color === '#ff8904' ? 'bg-orange-400' : 'bg-purple-400'}`}>
                                </div>
                                <div className='min-w-0'>
                                    <p className="font-semibold truncate text-sm">{subject.title}</p>
                                    <p className='text-sm text-base-content/60 truncate '>{subject.matter_id?.title}</p>
                                </div>
                            </div>

                            <div className='flex gap-2 items-center'>
                                <span className={`badge badge-ghost rounded max-sm:hidden ${checkIsToday(subject.review1) ? 'text-green-400' : checkIsLate(subject.review1) ? 'text-red-400 ' : ''}`}>24 Horas</span>
                                <div className='text-base-content/40'>
                                    <Countdown targetDate={subject.review1} textSize="text-xs" />
                                </div>
                                {isAuthenticated && (
                                    <button onClick={(e) => { e.stopPropagation(); handleConclude(subject._id, "review1") }} className='btn btn-soft btn-sm'><CircleCheck size={15} />Feito</button>
                                )}
                            </div>
                        </div>
                    )))}
                </div>

                {/* --- 7 DIAS --- */}
                <div className='border border-base-content/20 p-6 rounded-lg flex flex-col gap-2 shadow-md'>
                    <div className='font-bold  text-lg flex items-center gap-2'>
                        <Clock size={20}></Clock>
                        7 Dias
                    </div>
                    <div className='flex flex-col gap-2'>
                        {subjects.filter(subject => subject.review2 && !subject.review2_concluded).length === 0 ? (
                            <span className='text-sm text-base-content/60'>Nenhuma revisão cadastrada</span>
                        ) : (subjects.filter(subject => subject.review2 && !subject.review2_concluded).sort((a, b) => new Date(a.review2) - new Date(b.review2)).map(subject => (
                            <div className={`border rounded-lg p-2 flex justify-between items-center gap-2 cursor-pointer hover:bg-base-200/50 hover:shadow-md transition-shadow ${checkIsToday(subject.review2) ? 'border-green-400' : checkIsLate(subject.review2) ? 'border-red-400' : 'border-base-content/20'}`} key={subject._id} onClick={() => openSubjectModal(subject)}>
                                <div className='flex items-center gap-2  min-w-0'>
                                    <div className={`rounded-full min-w-4 min-h-4 text-white ${subject.matter_id?.color === '#ff6467' ? 'bg-red-400' : subject.matter_id?.color === '#05df72' ? 'bg-green-400' : subject.matter_id?.color === '#50a2ff' ? 'bg-blue-400' : subject.matter_id?.color === '#ff8904' ? 'bg-orange-400' : 'bg-purple-400'}`}>
                                    </div>
                                    <div className='min-w-0'>
                                        <p className="font-semibold min-w-0 truncate text-sm">{subject.title}</p>
                                        <p className='text-sm text-base-content/60 truncate'>{subject.matter_id?.title}</p>
                                    </div>
                                </div>

                                <div className='flex gap-2 items-center'>
                                    <span className={`badge badge-ghost rounded max-sm:hidden ${checkIsToday(subject.review2) ? 'text-green-400' : checkIsLate(subject.review2) ? 'text-red-400 ' : ''}`}>7 Dias</span>
                                    <div className='text-base-content/40 '>
                                        <Countdown targetDate={subject.review2} textSize="text-xs" />
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleConclude(subject._id, "review2") }} className='btn btn-soft btn-sm'><CircleCheck size={15}></CircleCheck>Feito</button>
                                </div>
                            </div>
                        )))}
                    </div>
                </div>

                {/* --- 30 DIAS --- */}
                <div className='border border-base-content/20 p-6 rounded-lg flex flex-col gap-2 shadow-md'>
                    <div className='font-bold  text-lg flex items-center gap-2'>
                        <Clock size={20}></Clock>
                        30 Dias
                    </div>
                    <div className='flex flex-col gap-2'>
                        {subjects.filter(subject => subject.review3 && !subject.review3_concluded).length === 0 ? (
                            <span className='text-sm text-base-content/60'>Nenhuma revisão cadastrada</span>
                        ) : (subjects.filter(subject => subject.review3 && !subject.review3_concluded).sort((a, b) => new Date(a.review3) - new Date(b.review3)).map(subject => (
                            <div className={`border rounded-lg p-2 flex justify-between items-center gap-2 cursor-pointer hover:bg-base-200/50 hover:shadow-md transition-shadow ${checkIsToday(subject.review3) ? 'border-green-400' : checkIsLate(subject.review3) ? 'border-red-400' : 'border-base-content/20'}`} key={subject._id} onClick={() => openSubjectModal(subject)}>
                                <div className='flex items-center gap-2 min-w-0'>
                                    <div className={`rounded-full min-w-4 min-h-4 text-white ${subject.matter_id?.color === '#ff6467' ? 'bg-red-400' : subject.matter_id?.color === '#05df72' ? 'bg-green-400' : subject.matter_id?.color === '#50a2ff' ? 'bg-blue-400' : subject.matter_id?.color === '#ff8904' ? 'bg-orange-400' : 'bg-purple-400'}`}>
                                    </div>
                                    <div className='min-w-0'>
                                        <p className="font-semibold truncate text-sm">{subject.title}</p>
                                        <p className='text-sm text-base-content/60 truncate'>{subject.matter_id?.title}</p>
                                    </div>
                                </div>

                                <div className='flex gap-2 items-center'>
                                    <span className={`badge badge-ghost rounded max-sm:hidden ${checkIsToday(subject.review3) ? 'text-green-400' : checkIsLate(subject.review3) ? 'text-red-400' : ''}`}>30 Dias</span>
                                    <div className='text-base-content/40 '>
                                        <Countdown targetDate={subject.review3} textSize="text-xs" />
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleConclude(subject._id, "review3") }} className='btn btn-soft btn-sm'><CircleCheck size={15}></CircleCheck>Feito</button>
                                </div>
                            </div>
                        )))}
                    </div>
                </div>

                {/* --- CONCLUÍDAS --- */}
                <div className='border border-base-content/20 p-6 rounded-lg flex flex-col gap-2 shadow-md'>
                    <div className='font-bold  text-lg flex items-center gap-2'>
                        <CircleCheck size={20}></CircleCheck>
                        Concluídas
                    </div>
                    <div className='flex flex-col gap-2'>
                        {!subjects.some(s => s.review1_concluded || s.review2_concluded || s.review3_concluded) ? (
                            <span className='text-sm text-base-content/60'>Nenhuma revisão concluída</span>
                        ) : (subjects.map(subject => {
                            const concluded = [];
                            if (subject.review1_concluded) concluded.push({ label: "24 Horas", key: "r1" });
                            if (subject.review2_concluded) concluded.push({ label: "7 Dias", key: "r2" });
                            if (subject.review3_concluded) concluded.push({ label: "30 Dias", key: "r3" });

                            return concluded.map(review => (
                                <div className='flex gap-2 border border-base-content/20 rounded-lg p-2  justify-between items-center cursor-pointer hover:bg-base-200/50 hover:shadow-md transition-shadow' key={`${subject._id}-${review.key}`} onClick={() => openSubjectModal(subject)}>
                                    <div className='flex items-center gap-2 min-w-0'>
                                        <div className={`rounded-full min-w-4 min-h-4 text-white ${subject.matter_id?.color === '#ff6467' ? 'bg-red-400' : subject.matter_id?.color === '#05df72' ? 'bg-green-400' : subject.matter_id?.color === '#50a2ff' ? 'bg-blue-400' : subject.matter_id?.color === '#ff8904' ? 'bg-orange-400' : 'bg-purple-400'}`}>
                                        </div>
                                        <div className='min-w-0'>
                                            <p className="font-semibold truncate text-sm">{subject.title}</p>
                                            <p className='text-sm text-base-content/60 truncate'>{subject.matter_id?.title}</p>
                                        </div>
                                    </div>
                                    <span className='badge badge-ghost rounded max-sm:px-5 truncate'>{review.label}</span>
                                </div>
                            ));
                        }))}
                    </div>
                </div>
            </div>

            {/* MODAL DE DETALHES */}
            <dialog id="subject_details_modal" className="modal">
                <div className="modal-box">
                    {selectedSubject && (
                        <>
                            <h3 className="font-bold text-lg mb-4 break-words hyphens-auto">{selectedSubject.title}</h3>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Matéria:</span>
                                    <div className="flex items-center gap-2 bg-base-200 px-2 py-1 rounded-full text-xs">
                                        <div className={`w-2 h-2 rounded-full ${selectedSubject.matter_id?.color === '#ff6467' ? 'bg-red-400' :
                                            selectedSubject.matter_id?.color === '#05df72' ? 'bg-green-400' :
                                                selectedSubject.matter_id?.color === '#50a2ff' ? 'bg-blue-400' :
                                                    selectedSubject.matter_id?.color === '#ff8904' ? 'bg-orange-400' :
                                                        'bg-purple-400'
                                            }`}></div>
                                        <span>{selectedSubject.matter_id?.title}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Status:</span>
                                    <span className={`badge badge-sm flex gap-1  ${selectedSubject.status === 'CONCLUIDO' ? 'badge-success text-white' : 'badge-ghost'}`}>
                                        <CircleCheck className='min-w-3' size={12}></CircleCheck>
                                        CONCLUÍDO
                                        {/* {selectedSubject.status || 'PENDENTE'} */}
                                    </span>
                                </div>

                                <div className="bg-base-200/50 flex flex-col gap-1 text-center border border-base-content/20 p-3 rounded-lg">
                                    <span className='text-start font-semibold text-sm opacity-70'>Cronograma de Revisões:</span>
                                    <div className={`flex justify-between gap-3   ${selectedSubject.review1_concluded ? 'text-green-400 line-through' : checkIsLate(selectedSubject.review1) ? 'text-red-400 line-through' : ''}`}>
                                        <span className="text-xs font-bold">1ª Revisão (24h):</span>
                                        <span className=" font-mono">{new Date(selectedSubject.review1).toLocaleDateString()}</span>
                                    </div>

                                    <div className={`flex justify-between gap-3   ${selectedSubject.review2_concluded ? 'text-green-400 line-through ' : checkIsLate(selectedSubject.review2) ? 'text-red-400 line-through' : ''}`}>
                                        <span className="text-xs font-bold">2ª Revisão (7 dias):</span>
                                        <span className=" font-mono">{new Date(selectedSubject.review2).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`flex justify-between gap-3    ${selectedSubject.review3_concluded ? 'text-green-400 line-through' : checkIsLate(selectedSubject.review3) ? 'text-red-400 line-through' : ''}`}>
                                        <span className="text-xs font-bold">3ª Revisão (30 dias):</span>
                                        <span className="font-mono">{new Date(selectedSubject.review3).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* --- MUDANÇA DOS ANEXOS AQUI (USANDO O LINK) --- */}
                                {selectedSubject.attachments && selectedSubject.attachments.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        <div className='flex gap-1 text-sm '>
                                            <span className="font-semibold text-sm flex items-center gap-2 min-w-3"><Paperclip size={16}></Paperclip> Anexos</span>
                                            ({selectedSubject.attachments.length})
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {selectedSubject.attachments.map((file, idx) => (
                                                <Link 
                                                    key={idx} 
                                                    to={`/view-pdf/${selectedSubject._id}/${encodeURIComponent(file.public_id)}`} 
                                                    className="flex items-center gap-2 p-2 border border-base-content/20 rounded hover:bg-base-200 transition-colors text-sm"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileText size={16}
                                                        className={` min-w-[20px]  ${selectedSubject.matter_id?.color === '#ff6467' ? 'text-red-400' :
                                                            selectedSubject.matter_id?.color === '#05df72' ? 'text-green-400' :
                                                                selectedSubject.matter_id?.color === '#50a2ff' ? 'text-blue-400' :
                                                                    selectedSubject.matter_id?.color === '#ff8904' ? 'text-orange-400' : 'text-purple-400'
                                                            }`} />
                                                    <span className="truncate">{file.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className='flex gap-1 text-sm '>
                                            <span className="font-semibold text-sm flex items-center gap-2 min-w-3"><Paperclip size={16}></Paperclip> Anexos</span>
                                            ({selectedSubject.attachments.length})
                                        </div>
                                        <div className="text-sm text-base-content/50 italic bg-base-200/30 p-2 rounded text-center">
                                            Nenhum arquivo anexado.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-action">
                                <form method="dialog">
                                    <button className="btn">Fechar</button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    )
}

export default ReviewsPage
