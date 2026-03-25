import React, { useState } from 'react';
import { ArrowUp, ArrowDown, CircleX, CircleCheck, LinkIcon, Paperclip, PencilLine, Trash, ChevronUp, ChevronDown, FileText, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const SubjectItem = ({ 
    subject, matter, index, totalSubjects, 
    onMove, onUpdateStatus, onFileUpload, 
    openEditModal, openDetailsModal, 
    onDeleteSubject, isDeletingSubject, 
    onDeleteFile, deletingFileId 
}) => {
    const [isAttachmentsExpanded, setIsAttachmentsExpanded] = useState(false);

    const toggleAttachments = (e) => {
        e.stopPropagation();
        setIsAttachmentsExpanded(!isAttachmentsExpanded);
    };

    return (
        <div className="flex flex-col">
            <div
                className={`bg-base-200/60 py-1.5 pl-3 pr-1 border-base-content/20 border text-sm flex flex-col gap-2 ${subject.attachments && subject.attachments.length > 0 ? 'rounded-t-lg' : 'rounded-lg'} cursor-pointer hover:bg-base-200/80 transition-colors`}
                onClick={(e) => { if (!e.target.closest('button, select, input, label, a')) openDetailsModal(subject) }}
            >
                <div className='flex justify-between items-center'>
                    <div className='flex gap-3 items-center min-w-0'>
                        <div className='flex flex-col'>
                            <button onClick={(e) => { e.stopPropagation(); onMove(index, 'up'); }} disabled={index === 0} className='btn btn-xs btn-ghost w-4 h-4 min-h-0 p-0 disabled:bg-transparent disabled:text-base-content/10'>
                                <ArrowUp size={15} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onMove(index, 'down'); }} disabled={index === totalSubjects - 1} className='btn btn-sm btn-ghost w-4 h-4 min-h-0 p-0 disabled:bg-transparent disabled:text-base-content/10'>
                                <ArrowDown size={15} />
                            </button>
                        </div>
                        {subject.status === 'PENDENTE' ? <CircleX className='text-red-400 max-sm:min-w-5 min-w-5' size={15} /> : <CircleCheck className='text-green-400 max-sm:min-w-5 min-w-5' size={15} />}
                        <span className='font-semibold truncate lg:max-w-100' title={subject.title}>
                            {subject.title}
                        </span>
                    </div>

                    <div className='flex items-center gap-2 '>
                        <select className="select select-xs select-bordered mr-1 hover:cursor-pointer max-lg:w-16 lg:w-27" value={subject.status} onChange={(e) => { e.stopPropagation(); onUpdateStatus(subject._id, e.target.value); }}>
                            <option value="PENDENTE">PENDENTE</option>
                            <option value="CONCLUIDO">CONCLUIDO</option>
                        </select>

                        {subject.link && (
                            <a
                                href={subject.link.startsWith('http') ? subject.link : `https://${subject.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={`btn btn-sm btn-ghost hover:bg-transparent hover:border-transparent hover:shadow-none p-0 ${matter.color === '#ff6467' ? 'text-red-400 hover:text-red-500' : matter.color === '#05df72' ? 'text-green-400 hover:text-green-500' : matter.color === '#50a2ff' ? 'text-blue-400 hover:text-blue-500' : matter.color === '#ff8904' ? 'text-orange-400 hover:text-orange-500' : 'text-purple-400 hover:text-purple-500'}`}
                                title="Acessar Link"
                            >
                                <LinkIcon size={15} />
                            </a>
                        )}

                        <label
                            className={`cursor-pointer transition-colors ${subject.attachments?.length >= 3 ? 'text-gray-400 opacity-50 cursor-not-allowed' : ''}`}
                            title={subject.attachments?.length >= 3 ? 'Limite de 3 arquivos atingido' : 'Anexar PDF'}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                className='hidden'
                                onChange={(e) => onFileUpload(e, subject._id)}
                                disabled={subject.attachments?.length >= 3}
                            />
                            <Paperclip className={`${matter.color === '#ff6467' ? 'hover:text-red-400' : matter.color === '#05df72' ? 'hover:text-green-400' : matter.color === '#50a2ff' ? 'hover:text-blue-400' : matter.color === '#ff8904' ? 'hover:text-orange-400' : 'hover:text-purple-400'}`} size={15} />
                        </label>

                        <button onClick={(e) => { e.stopPropagation(); openEditModal(subject); }} className='btn btn-sm btn-ghost hover:bg-transparent hover:border-transparent hover:shadow-none p-0'>
                            <PencilLine className={`${matter.color === '#ff6467' ? 'hover:text-red-400' : matter.color === '#05df72' ? 'hover:text-green-400' : matter.color === '#50a2ff' ? 'hover:text-blue-400' : matter.color === '#ff8904' ? 'hover:text-orange-400' : 'hover:text-purple-400'}`} size={15} />
                        </button>

                        <button disabled={isDeletingSubject === subject._id} onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject._id); }} className='btn btn-sm btn-ghost pl-0 hover:bg-transparent hover:border-transparent hover:shadow-none' title='Deletar Assunto'>
                            {isDeletingSubject === subject._id ? <Loader size={15} className="animate-spin" /> : <Trash className='hover:text-red-400 ' size={15} />}
                        </button>
                    </div>
                </div>
            </div>

            {subject.attachments && subject.attachments.length > 0 && (
                <div className='border border-t-0 border-base-content/20 rounded-b-lg bg-base-200/40'>
                    <div
                        className='flex justify-between items-center p-2 cursor-pointer hover:bg-base-300/50 transition-colors'
                        onClick={toggleAttachments}
                    >
                        <span className='text-xs font-semibold text-base-content/60 ml-2'>Anexos ({subject.attachments.length})</span>
                        <div className="text-base-content/50 mr-2">
                            {isAttachmentsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                    </div>

                    <AnimatePresence>
                        {isAttachmentsExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className='overflow-hidden'
                            >
                                <div className='p-2 pt-0 flex flex-col gap-2'>
                                    {subject.attachments.map(file => (
                                        <Link
                                            key={file.public_id}
                                            to={`/view-pdf/${subject._id}/${encodeURIComponent(file.public_id)}`}
                                            className='hover:underline hover:text-primary truncate font-normal'
                                            title={file.name}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <div className='btn btn-sm btn-soft flex justify-between items-center gap-2 hover:text-primary min-w-0 bg-base-100'>
                                                <div className='flex items-center gap-2 truncate'>
                                                    <FileText className={`min-w-[20px] ${matter.color === '#ff6467' ? 'text-red-400' : matter.color === '#05df72' ? 'text-green-400' : matter.color === '#50a2ff' ? 'text-blue-400' : matter.color === '#ff8904' ? 'text-orange-400' : 'text-purple-400'}`} size={15} />
                                                    {file.name}
                                                </div>
                                                <button disabled={deletingFileId !== null} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteFile(subject._id, file.public_id); }} className='text-base-content  p-1'>
                                                    {deletingFileId === file.public_id ? <Loader size={15} className="animate-spin" /> : <Trash className='hover:text-red-400' size={15} />}
                                                </button>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default SubjectItem;