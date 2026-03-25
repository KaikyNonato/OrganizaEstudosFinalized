import React from 'react';
import { CircleX, CircleCheck, LinkIcon, Paperclip, FileText, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const MatterModals = ({
    matter, colors, viewingSubject, editingSubject,
    editTitle, setEditTitle, editLink, setEditLink,
    editReviewDate, setEditReviewDate, isSavingSubject, handleUpdateSubject,
    editTitleMatter, setEditTitleMatter, editColorMatter, setEditColorMatter,
    isUpdatingSubject, handleUpdateMatter
}) => {
    return (
        <>
            {/* MODAL: DETALHES DO ASSUNTO */}
            <dialog id={`details_subject_modal_${matter._id}`} className="modal">
                <div className="modal-box">
                    {viewingSubject && (
                        <>
                            <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                                {viewingSubject.title}
                            </h3>

                            <div className='flex items-center gap-2'>
                                <span className='font-semibold text-sm'>Matéria:</span>
                                <div className="flex items-center gap-2 bg-base-200 px-2 py-1 rounded-full text-xs">
                                    <div className={`w-2 h-2 rounded-full ${matter?.color === '#ff6467' ? 'bg-red-400' : matter?.color === '#05df72' ? 'bg-green-400' : matter?.color === '#50a2ff' ? 'bg-blue-400' : matter?.color === '#ff8904' ? 'bg-orange-400' : 'bg-purple-400'}`}></div>
                                    <span>{matter.title}</span>
                                </div>
                            </div>

                            <div className="py-4 flex flex-col gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">Status:</span>
                                    {viewingSubject.status === 'PENDENTE' ? (
                                        <div className="badge badge-sm badge-error  text-white">
                                            <CircleX size={12} /> PENDENTE
                                        </div>
                                    ) : (
                                        <div className="badge badge-sm badge-success gap-1 text-white">
                                            <CircleCheck size={12} /> CONCLUÍDO
                                        </div>
                                    )}
                                </div>

                                {viewingSubject.status === 'CONCLUIDO' && (
                                    <div className="bg-base-200/50 p-3 rounded-lg border border-base-content/10">
                                        <p className="font-semibold text-sm mb-2 opacity-70">Cronograma de Revisões:</p>
                                        <div className="flex flex-col gap-1 ">
                                            <div className="flex justify-between">
                                                <span className='text-xs font-bold'>1ª Revisão (24h):</span>
                                                <span className="font-mono ">{viewingSubject.review1 ? new Date(viewingSubject.review1).toLocaleDateString() : '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className='text-xs font-bold'>2ª Revisão (7 dias):</span>
                                                <span className="font-mono ">{viewingSubject.review2 ? new Date(viewingSubject.review2).toLocaleDateString() : '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className='text-xs font-bold'>3ª Revisão (30 dias):</span>
                                                <span className="font-mono ">{viewingSubject.review3 ? new Date(viewingSubject.review3).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {viewingSubject.link && (
                                    <div className="flex items-center gap-2 text-sm mb-3">
                                        <span className="font-semibold flex items-center gap-1"><LinkIcon size={16} /> Link:</span>
                                        <a href={viewingSubject.link} target="_blank" rel="noopener noreferrer" className="link link-primary truncate max-w-[200px] sm:max-w-[300px]">
                                            {viewingSubject.link}
                                        </a>
                                    </div>
                                )}

                                <div>
                                    <p className="font-semibold mb-2 flex items-center gap-2 text-sm">
                                        <Paperclip size={16} />
                                        Anexos ({viewingSubject.attachments?.length || 0})
                                    </p>
                                    {viewingSubject.attachments && viewingSubject.attachments.length > 0 ? (
                                        <div className="flex flex-col gap-2">
                                            {viewingSubject.attachments.map(file => (
                                                <Link
                                                    key={file.public_id}
                                                    to={`/view-pdf/${viewingSubject._id}/${encodeURIComponent(file.public_id)}`}
                                                    className='flex items-center gap-2 p-2 border border-base-content/20 rounded hover:bg-base-200 transition-colors text-sm'
                                                    title={file.name}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <div className="bg-base-100  rounded text-primary">
                                                        <FileText size={16} className={` min-w-[20px]  ${matter?.color === '#ff6467' ? 'text-red-400' : matter?.color === '#05df72' ? 'text-green-400' : matter?.color === '#50a2ff' ? 'text-blue-400' : matter?.color === '#ff8904' ? 'text-orange-400' : 'text-purple-400'}`} />
                                                    </div>
                                                    <span className="text-sm truncate flex-1 group-hover:text-primary transition-colors">{file.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-base-content/50 italic bg-base-200/30 p-2 rounded text-center">
                                            Nenhum arquivo anexado.
                                        </div>
                                    )}
                                </div>
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

            {/* MODAL: EDITAR ASSUNTO */}
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

                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium">Link Associado (Opcional)</span></label>
                            <input
                                type="url"
                                placeholder="Ex: https://notebooklm.google.com"
                                className="input input-bordered w-full"
                                value={editLink}
                                onChange={(e) => setEditLink(e.target.value)}
                            />
                        </div>

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
                        <button disabled={isSavingSubject} className="btn btn-primary" onClick={handleUpdateSubject}>
                            {isSavingSubject ? <Loader size={20} className="animate-spin" /> : 'Salvar'}
                        </button>
                    </div>
                </div>
            </dialog>

            {/* MODAL: EDITAR MATÉRIA */}
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
                            <button disabled={isUpdatingSubject} type="submit" className="btn btn-primary " title='Salvar Matéria'>{isUpdatingSubject ? <Loader size={15} className="animate-spin" /> : 'Salvar'}</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </>
    );
};

export default MatterModals;