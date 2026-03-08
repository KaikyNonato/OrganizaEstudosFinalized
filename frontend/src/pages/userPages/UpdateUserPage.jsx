import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useUserStore } from '../../store/userStore'
import { User, Mail, Save, ArrowLeft, Loader } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const UpdateUserPage = () => {
    const { user, checkAuth } = useAuthStore();
    const { updateUser, isLoading } = useUserStore();
    const [name, setName] = useState(user?.name || '');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser({ name });
            await checkAuth(); // Atualiza os dados no authStore para refletir na UI

            navigate('/perfil');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className='min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="card-title text-2xl font-bold">Editar Perfil</h2>
                            <Link to="/perfil" className="btn btn-ghost btn-circle" title="Voltar">
                                <ArrowLeft size={24} />
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text flex items-center gap-2 font-medium">
                                        <User size={18} /> Nome Completo
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input input-bordered w-full focus:input-primary"
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>



                            <div className="card-actions justify-end mt-8">
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader className="animate-spin mr-2" size={20} />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} className="mr-2" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UpdateUserPage
