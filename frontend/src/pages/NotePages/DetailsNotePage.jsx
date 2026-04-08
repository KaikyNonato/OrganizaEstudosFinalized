import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { API_URL } from '../../../API_URL'
import { Link, useParams } from 'react-router-dom'
import { Plus, Pencil, Trash, Search, Pin, Bold, Italic, Underline, List, ListOrdered, Palette, Undo2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const RichTextEditor = ({ value, onChange }) => {
    const editorRef = React.useRef(null);

    React.useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const handleInput = (e) => {
        onChange(e.currentTarget.innerHTML);
    };

    const execCmd = (e, command, arg = null) => {
        if (e && e.type !== 'input') e.preventDefault(); // Previne que o editor perca o foco, exceto no input de cor
        document.execCommand(command, false, arg);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        if (html) {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Remove atributos que forçam cores específicas, mantendo a estrutura do texto
            const elements = temp.querySelectorAll('*');
            elements.forEach(el => {
                el.removeAttribute('color');
                el.removeAttribute('bgcolor');

                // Remove apenas as cores de dentro do atributo "style", mantendo o resto (tamanhos, fontes, etc.)
                if (el.style) {
                    el.style.color = '';
                    el.style.backgroundColor = '';
                }
            });

            document.execCommand('insertHTML', false, temp.innerHTML);
        } else {
            document.execCommand('insertText', false, text);
        }
    };

    return (
        <div className="border border-base-content/20 rounded-lg overflow-hidden flex flex-col focus-within:border-primary/50 transition-colors bg-base-100">
            {/* Barra de Ferramentas */}
            <div className="flex flex-wrap gap-1 p-2 bg-base-200/50 border-b border-base-content/10 items-center">
                <button type="button" onMouseDown={(e) => execCmd(e, 'bold')} className="btn btn-sm btn-ghost px-2" title="Negrito"><Bold size={16} /></button>
                <button type="button" onMouseDown={(e) => execCmd(e, 'italic')} className="btn btn-sm btn-ghost px-2" title="Itálico"><Italic size={16} /></button>
                <button type="button" onMouseDown={(e) => execCmd(e, 'underline')} className="btn btn-sm btn-ghost px-2" title="Sublinhado"><Underline size={16} /></button>

                <div className="relative flex items-center justify-center btn btn-sm btn-ghost px-2 overflow-hidden" title="Cor do Texto">
                    <Palette size={16} />
                    <input
                        type="color"
                        className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
                        onInput={(e) => execCmd(e, 'foreColor', e.target.value)}
                    />
                </div>

                <div className="divider divider-horizontal mx-0"></div>
                <button type="button" onMouseDown={(e) => execCmd(e, 'justifyLeft')} className="btn btn-sm btn-ghost px-2" title="Alinhar à Esquerda"><AlignLeft size={16} /></button>
                <button type="button" onMouseDown={(e) => execCmd(e, 'justifyCenter')} className="btn btn-sm btn-ghost px-2" title="Centralizar"><AlignCenter size={16} /></button>
                <button type="button" onMouseDown={(e) => execCmd(e, 'justifyRight')} className="btn btn-sm btn-ghost px-2" title="Alinhar à Direita"><AlignRight size={16} /></button>

                <div className="divider divider-horizontal mx-0"></div>
                <button type="button" onMouseDown={(e) => execCmd(e, 'insertUnorderedList')} className="btn btn-sm btn-ghost px-2" title="Lista"><List size={16} /></button>
                <button type="button" onMouseDown={(e) => execCmd(e, 'insertOrderedList')} className="btn btn-sm btn-ghost px-2" title="Lista Numerada"><ListOrdered size={16} /></button>
            </div>
            {/* Área de digitação */}
            <div
                ref={editorRef}
                className="p-4 min-h-[12rem] max-h-[20rem] overflow-y-auto outline-none text-base-content/90 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:my-2 [&_ol]:my-2"
                contentEditable
                onInput={handleInput}
                onBlur={handleInput}
                onPaste={handlePaste}
            ></div>
        </div>
    );
}

const DetailsNotePage = () => {
    const [notes, setNotes] = React.useState([])
    const { matterId } = useParams()

    const [fetchNotesLoading, setFetchNotesLoading] = React.useState(false)

    const [title, setTitle] = React.useState('')
    const [content, setContent] = React.useState('')
    const [isCreatingNote, setIsCreatingNote] = React.useState(false)

    const [editingNoteId, setEditingNoteId] = React.useState(null)
    const [editTitle, setEditTitle] = React.useState('')
    const [editContent, setEditContent] = React.useState('')
    const [isEditingNote, setIsEditingNote] = React.useState(false)

    const [searchTerm, setSearchTerm] = React.useState('')

    const fetchNotes = async () => {
        try {
            const response = await axios.get(API_URL + `/note/get-notes/${matterId}`, { withCredentials: true })
            if (response.data.success) {
                setNotes(response.data.notes)
            }

        } catch (error) {
            console.log(error)
            toast.error("Erro ao buscar notas", { id: "fetch-notes-error" })
        }
    }

    const handleCreateNote = async (e) => {
        e.preventDefault()

        const plainText = content.replace(/<[^>]*>?/gm, '').trim();
        if (!plainText) {
            toast.error("O conteúdo da nota não pode estar vazio!");
            return;
        }

        setIsCreatingNote(true)
        const toastId = toast.loading("Criando nota...")

        try {
            const response = await axios.post(API_URL + '/note/create-note', {
                title,
                content,
                matter_id: matterId
            }, { withCredentials: true })

            if (response.data.success) {
                toast.success("Nota criada com sucesso!", { id: toastId })
                setTitle('')
                setContent('')
                document.getElementById('add_note_modal').close()
                fetchNotes() // Recarrega a lista de notas
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || "Erro ao criar nota", { id: toastId })
        } finally {
            setIsCreatingNote(false)
        }
    }

    const openEditModal = (note) => {
        setEditingNoteId(note._id)
        setEditTitle(note.title)
        setEditContent(note.content)
        document.getElementById('edit_note_modal').showModal()
    }

    const handleUpdateNote = async (e) => {
        e.preventDefault()

        const plainText = editContent.replace(/<[^>]*>?/gm, '').trim();
        if (!plainText) {
            toast.error("O conteúdo da nota não pode estar vazio!");
            return;
        }

        setIsEditingNote(true)
        const toastId = toast.loading("Atualizando nota...")

        try {
            const response = await axios.put(API_URL + `/note/update-note/${editingNoteId}`, {
                title: editTitle,
                content: editContent,
                matter_id: matterId
            }, { withCredentials: true })

            if (response.data.success) {
                toast.success("Nota atualizada com sucesso!", { id: toastId })
                document.getElementById('edit_note_modal').close()
                fetchNotes() // Recarrega a lista de notas com a edição aplicada
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || "Erro ao atualizar nota", { id: toastId })
        } finally {
            setIsEditingNote(false)
        }
    }

    const handleDeleteNote = async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir esta nota?")) return;

        const toastId = toast.loading("Excluindo nota...");
        try {
            const response = await axios.delete(API_URL + `/note/delete-note/${id}`, { withCredentials: true })
            if (response.data.success) {
                toast.success("Nota excluída com sucesso!", { id: toastId })
                fetchNotes() // Recarrega a lista de notas após a exclusão
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || "Erro ao excluir nota", { id: toastId })
        }
    }

    const handleTogglePin = async (note) => {
        const toastId = toast.loading(note.isPinned ? "Desfixando..." : "Fixando...");
        try {
            const response = await axios.put(API_URL + `/note/update-note/${note._id}`, {
                title: note.title,
                content: note.content,
                matter_id: note.matter_id?._id || note.matter_id,
                isPinned: !note.isPinned
            }, { withCredentials: true })

            if (response.data.success) {
                toast.success(note.isPinned ? "Nota desfixada!" : "Nota fixada no topo!", { id: toastId })
                fetchNotes()
            }
        } catch (error) {
            console.log(error)
            toast.error("Erro ao fixar nota", { id: toastId })
        }
    }

    useEffect(() => {
        fetchNotes()
    }, [])


    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return new Date(b.createdAt) - new Date(a.createdAt); // Ordena as mais recentes primeiro
        }
        return a.isPinned ? -1 : 1; // Coloca as fixadas no topo
    });

    return (
        <div className=''>
            <div className='flex justify-center items-center'>
                <Link className='  flex justify-center items-center gap-1 ' to={'/notas'}> <Undo2 size={15} /> Voltar</Link>
            </div>
            {notes && notes.length > 0 ? (
                <div className=" flex flex-col gap-6">
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                        <h2 className='font-medium'>◉ Suas Notas - {notes[0]?.matter_id?.title}</h2>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
                                <input
                                    type="text"
                                    placeholder="Pesquisar nota..."
                                    className="input input-bordered w-full pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className='btn shrink-0' onClick={() => document.getElementById('add_note_modal').showModal()}> <Plus size={18} /> Adicionar Nota</button>
                        </div>
                    </div>

                    {filteredNotes.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6 '>
                            {filteredNotes.map((note) => {
                                return (
                                    <div key={note._id} className="border p-3 rounded-lg border-base-content/20 shadow-sm group relative">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className='font-medium flex-1'>{note.title}</h3>
                                            <button
                                                onClick={() => handleTogglePin(note)}
                                                className={`btn btn-ghost btn-xs px-1 hover:text-primary ${note.isPinned ? 'text-primary' : 'text-base-content/50'}`}
                                                title={note.isPinned ? "Desfixar" : "Fixar no topo"}
                                            >
                                                <Pin size={14} fill={note.isPinned ? "currentColor" : "none"} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(note)}
                                                className="btn btn-ghost btn-xs px-1 text-base-content/50 hover:text-primary"
                                                title="Editar Nota"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNote(note._id)}
                                                className="btn btn-ghost btn-xs px-1 text-base-content/50 hover:text-error"
                                                title="Excluir Nota"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                        <div className='divider p-0 m-0 text-xs text-base-content/60'></div>
                                        <div
                                            className="text-base-content text-sm [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-5 [&_ol]:ml-5 [&_ul]:my-2 [&_ol]:my-2 break-words max-h-[60vh] overflow-y-auto pr-1"
                                            dangerouslySetInnerHTML={{ __html: note.content }}>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-base-content/60 bg-base-200/30 rounded-lg border border-dashed border-base-content/20">
                            Nenhuma nota encontrada com o título "{searchTerm}".
                        </div>
                    )}
                </div>
            ) : (
                <div className='flex justify-between items-center gap-2'>
                    <p className='font-medium'>◉ Esta materia não possui notas cadastradas!</p>
                    <button className='btn btn-primary' onClick={() => document.getElementById('add_note_modal').showModal()}> <Plus></Plus> Adicionar Nota</button>
                </div>
            )}

            {/* Modal de Adicionar Nota */}
            <dialog id="add_note_modal" className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <h3 className="font-bold text-lg">Nova Nota</h3>
                    <form onSubmit={handleCreateNote}>
                        <div className="py-4 flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Título da nota"
                                className="input input-bordered w-full"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <RichTextEditor value={content} onChange={setContent} />
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => document.getElementById('add_note_modal').close()}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={isCreatingNote}>
                                {isCreatingNote ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Modal de Editar Nota */}
            <dialog id="edit_note_modal" className="modal">
                <div className="modal-box w-11/12 max-w-3xl">
                    <h3 className="font-bold text-lg">Editar Nota</h3>
                    <form onSubmit={handleUpdateNote}>
                        <div className="py-4 flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Título da nota"
                                className="input input-bordered w-full"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                            />
                            <RichTextEditor value={editContent} onChange={setEditContent} />
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => document.getElementById('edit_note_modal').close()}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={isEditingNote}>
                                {isEditingNote ? "Salvando..." : "Salvar Alterações"}
                            </button>
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

export default DetailsNotePage
