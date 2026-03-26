import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShieldAlert, Users, Calendar, Mail, CheckCircle, XCircle, Pencil, Save, FileText, Book, ChevronDown, ChevronUp, ChevronsUpDown, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../../API_URL';



const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estado para guardar o utilizador que está a ser editado no momento
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [expandedMatters, setExpandedMatters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/user/admin/users`);
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            toast.error("Erro ao procurar utilizadores ou acesso negado.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatStudyTime = (minutes) => {
        if (!minutes) return '0m';
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hrs > 0) return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
        return `${mins}m`;
    };

    // Abre o modal e carrega os dados do utilizador selecionado
    const openEditModal = (user) => {
        setEditingUser({ ...user });
        document.getElementById('edit_user_modal').showModal();
    };

    // Abre o modal de detalhes (assuntos e anexos)
    const openDetailsModal = (user) => {
        setViewingUser(user);
        setSearchTerm(''); // Reseta a busca ao abrir
        document.getElementById('details_modal').showModal();
    };

    // Abre o modal de matérias
    const openMattersModal = (user) => {
        setViewingUser(user);
        document.getElementById('matters_modal').showModal();
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Tem certeza que deseja apagar este utilizador? Esta ação é irreversível e apagará todos os seus dados.")) {
            return;
        }

        const toast_id = toast.loading("Apagando utilizador...");
        try {
            const response = await axios.delete(`${API_URL}/user/admin/delete-user/${id}`);
            if (response.data.success) {
                toast.success("Usuario apagado com sucesso!", { id: toast_id });
                setUsers(users.filter(u => u._id !== id));
            }
        } catch (error) {
            console.error("Erro ao apagar utilizador:", error);
            toast.error(error.response?.data?.message || "Erro ao apagar usuario!", { id: toast_id });
        }
    }

    // Função para enviar as alterações para a API
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        const toast_id = toast.loading("Atualizando usuario...");


        try {
            const response = await axios.put(`${API_URL}/user/admin/users/${editingUser._id}`, {
                name: editingUser.name,
                email: editingUser.email,
                isAdmin: editingUser.isAdmin,
                isVerified: editingUser.isVerified
            });

            if (response.data.success) {
                toast.success("Usuario atualizado com sucesso!", { id: toast_id });
                // Atualiza a lista na tela sem precisar recarregar a página
                setUsers(users.map(u => u._id === editingUser._id ? response.data.user : u));
                document.getElementById('edit_user_modal').close();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao atualizar usuario! ", { id: toast_id });
        }
    };

    // Agrupa os assuntos por matéria (Memorizado para evitar recálculos desnecessários)
    const groupedSubjects = React.useMemo(() => {
        if (!viewingUser?.subjects) return {};

        // Filtra os assuntos com base no termo de pesquisa
        const filteredSubjects = viewingUser.subjects.filter(sub =>
            sub.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filteredSubjects.reduce((acc, sub) => {
            const matterId = sub.matter_id?._id || 'unknown';
            if (!acc[matterId]) {
                acc[matterId] = {
                    matter: sub.matter_id || { title: 'Sem Matéria', color: '#ccc', _id: 'unknown' },
                    subjects: []
                };
            }
            acc[matterId].subjects.push(sub);
            return acc;
        }, {});
    }, [viewingUser, searchTerm]);

    // Inicializa todos os grupos como expandidos quando o usuário visualizado muda
    useEffect(() => {
        if (viewingUser) {
            const allKeys = Object.keys(groupedSubjects);
            const initialState = allKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {});
            setExpandedMatters(initialState);
        }
    }, [viewingUser, groupedSubjects]);

    const toggleAllMatters = () => {
        const allOpen = Object.values(expandedMatters).every(v => v);
        const newState = Object.keys(groupedSubjects).reduce((acc, key) => ({ ...acc, [key]: !allOpen }), {});
        setExpandedMatters(newState);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
        <div className='flex flex-col gap-6 min-h-[80vh] p-2'>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
            >
                <div>
                    <h2 className='text-3xl font-extrabold flex items-center gap-3'>
                        <ShieldAlert className="text-primary" size={32} />
                        Painel Administrativo
                    </h2>
                    <p className='text-base-content/60 mt-1'>Gerencie os utilizadores registados na plataforma.</p>
                </div>

                <div className='bg-base-200/60 px-6 py-3 rounded-lg flex items-center gap-4 border border-base-content/20 shadow-sm'>
                    <div className='bg-primary/10 p-3 rounded-full text-primary'>
                        <Users size={24} />
                    </div>
                    <div>
                        <p className='text-sm text-base-content/60 font-medium'>Total de Utilizadores</p>
                        <p className='text-2xl font-bold'>{users.length}</p>
                    </div>
                </div>
            </motion.div>

            {/* Barra de Pesquisa de Usuários */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50 z-10" size={20} />
                <input
                    type="text"
                    placeholder="Pesquisar por nome ou email..."
                    className="input input-bordered w-full pl-10 bg-base-100 shadow-sm"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                />
            </motion.div>

            {/* Tabela de Utilizadores */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className='bg-base-100 rounded-lg shadow-md border border-base-content/20 overflow-hidden'
            >
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead className="bg-base-200/50 text-base-content/70 text-sm">
                            <tr>
                                <th>Utilizador</th>
                                <th>Contato</th>
                                <th>Status</th>
                                <th>Horas Estudadas</th>
                                <th>Matérias</th>
                                <th>Assuntos / Anexos</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-base-content/50">
                                        <span className="loading loading-spinner loading-md"></span>
                                        <p className="mt-2">A procurar utilizadores...</p>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-base-content/50">
                                        Nenhum utilizador encontrado.
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-base-content/50">
                                        Nenhum usuário encontrado para "{userSearchTerm}".
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id} className="hover:bg-base-200/30 transition-colors">
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="flex justify-center items-center bg-info text-neutral-content rounded-full w-10">
                                                        <span className="uppercase">{u.name.charAt(0)}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{u.name}</div>
                                                    {u.isAdmin && <span className="badge badge-error badge-xs">Admin</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-sm text-base-content/70">
                                                <Mail size={14} /> {u.email}
                                            </div>
                                        </td>
                                        <td>
                                            {u.isVerified ? (
                                                <div className="badge badge-success badge-sm gap-1 text-white">
                                                    <CheckCircle size={12} /> Ativo
                                                </div>
                                            ) : (
                                                <div className="badge badge-error badge-sm gap-1 text-white">
                                                    <XCircle size={12} /> Pendente
                                                </div>
                                            )}
                                        </td>
                                        <td className="font-mono font-medium">
                                            {formatStudyTime(u.totalStudyTime)}
                                        </td>
                                        <td className="text-center font-medium p-1">
                                            <button
                                                onClick={() => openMattersModal(u)}
                                                className="btn btn-ghost btn-sm w-full hover:bg-base-200"
                                            >
                                                {u.mattersCount || 0}
                                            </button>
                                        </td>
                                        <td className='p-1'>
                                            <button
                                                onClick={() => openDetailsModal(u)}
                                                className="flex flex-col items-start justify-center w-full h-full text-xs hover:bg-base-200 p-2 rounded-lg transition-colors text-left"
                                            >
                                                <span className="font-bold">{u.subjectsCount || 0} Assuntos</span>
                                                <span className="text-base-content/60">{u.attachmentsCount || 0} Anexos</span>
                                            </button>
                                        </td>
                                        <td>
                                            {/* Botão de Editar */}
                                            <button
                                                onClick={() => openEditModal(u)}
                                                className="btn btn-ghost btn-sm text-base-content/60 "
                                                title="Editar Utilizador"
                                            >
                                                <Pencil size={16} /> Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="btn btn-ghost btn-sm text-error"
                                                title="Apagar Utilizador"
                                            >
                                                <Trash2 size={16} /> Apagar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal de Edição do Utilizador */}
            <dialog id="edit_user_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Pencil size={20} className="text-primary" /> Editar Utilizador
                    </h3>

                    {editingUser && (
                        <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium">Nome</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full "
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium">E-mail</span>
                                </label>
                                <input
                                    type="email"
                                    className="input input-bordered w-full "
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex gap-4 mt-2">
                                {/* Toggle de Verificado */}
                                <div className="form-control">
                                    <label className="label cursor-pointer gap-3 justify-start">
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-success"
                                            checked={editingUser.isVerified}
                                            onChange={(e) => setEditingUser({ ...editingUser, isVerified: e.target.checked })}
                                        />
                                        <span className="label-text font-medium">Conta Verificada</span>
                                    </label>
                                </div>

                                {/* Toggle de Admin */}
                                <div className="form-control">
                                    <label className="label cursor-pointer gap-3 justify-start">
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-primary"
                                            checked={editingUser.isAdmin}
                                            onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                                        />
                                        <span className="label-text font-medium text-primary">Acesso Admin</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-action mt-6">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => document.getElementById('edit_user_modal').close()}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary gap-2">
                                    <Save size={18} /> Salvar Alterações
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>fechar</button>
                </form>
            </dialog>

            {/* Modal de Detalhes (Assuntos e Anexos) */}
            <dialog id="details_modal" className="modal">
                <div className="modal-box w-11/12 max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <FileText size={20} className="text-primary" /> Detalhes de Estudos: {viewingUser?.name}
                        </h3>
                        <button
                            onClick={toggleAllMatters}
                            className="btn btn-sm btn-ghost gap-2 text-xs uppercase tracking-wider"
                        >
                            <ChevronsUpDown size={16} />
                            {Object.values(expandedMatters).every(v => v) ? 'Recolher Tudo' : 'Expandir Tudo'}
                        </button>
                    </div>

                    {/* Barra de Pesquisa */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
                        <input
                            type="text"
                            placeholder="Pesquisar assunto..."
                            className="input input-bordered w-full pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-6 max-h-[60vh] overflow-y-auto p-1">
                        {viewingUser?.subjects?.length > 0 ? (
                            Object.entries(groupedSubjects).map(([matterId, { matter, subjects }]) => (
                                <div key={matterId} className="flex flex-col gap-3">
                                    <button
                                        onClick={() => setExpandedMatters(prev => ({ ...prev, [matterId]: !prev[matterId] }))}
                                        className="flex items-center gap-2 border-b border-base-content/10 pb-2 sticky top-0 bg-base-100 z-10 pt-2 hover:bg-base-200/50 transition-colors rounded-t-lg px-2 cursor-pointer w-full text-left"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: matter.color || '#ccc' }}
                                        ></div>
                                        <h4 className="font-bold text-md flex-1">{matter.title || 'Sem Matéria'}</h4>
                                        <span className="badge badge-sm badge-ghost">{subjects.length}</span>
                                        {expandedMatters[matterId] ? <ChevronUp size={16} className="opacity-50" /> : <ChevronDown size={16} className="opacity-50" />}
                                    </button>

                                    {expandedMatters[matterId] && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2"
                                        >
                                            {subjects.map((sub) => (
                                                <div key={sub._id} className="card bg-base-200/50 border border-base-content/10 shadow-sm compact">
                                                    <div className="card-body p-4">
                                                        <h4 className="font-bold text-sm mb-2 truncate" title={sub.title}>{sub.title}</h4>

                                                        {sub.attachments?.length > 0 ? (
                                                            <div className="flex flex-col gap-1 mt-2">
                                                                {sub.attachments.map((att) => (
                                                                    <a
                                                                        key={att.public_id}
                                                                        href={att.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 text-xs p-2 bg-base-100 rounded hover:bg-primary/10 hover:text-primary transition-colors border border-base-content/5"
                                                                    >
                                                                        <FileText size={12} />
                                                                        <span className="truncate">{att.name}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-base-content/40 italic">Sem anexos</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-base-content/50">
                                Este usuário não possui assuntos cadastrados.
                            </div>
                        )}
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Fechar</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Modal de Matérias */}
            <dialog id="matters_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Book size={20} className="text-primary" /> Matérias de {viewingUser?.name}
                    </h3>

                    <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
                        {viewingUser?.matters?.length > 0 ? (
                            viewingUser.matters.map((matter) => (
                                <div key={matter._id} className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg border border-base-content/10">
                                    <div
                                        className="w-4 h-4 rounded-full shrink-0"
                                        style={{ backgroundColor: matter.color || '#ccc' }}
                                    ></div>
                                    <span className="font-medium">{matter.title}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-base-content/50">
                                Nenhuma matéria cadastrada.
                            </div>
                        )}
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Fechar</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </div>
    );
};

export default AdminPage;
