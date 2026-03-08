import React from 'react'
import { useAuthStore } from '../../store/authStore.js'
import { User, Mail, Calendar, CheckCircle, XCircle, Shield, CircleUser, Bolt} from 'lucide-react'
import { Link } from 'react-router-dom';

const PerfilPage = () => {
    const { user } = useAuthStore();

    const formatDate = (dateString) => {
        if (!dateString) return 'Data não disponível';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className=' skeleton min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto '>
                <div className="card bg-base-100 shadow-xl overflow-hidden ">
                    {/* Header/Cover */}
                    <div className="h-48 bg-gradient-to-r from-primary to-secondary"></div>
                    
                    <div className="card-body relative pt-0">
                        {/* Avatar Section */}
                        <div className="absolute -top-16 left-6 sm:left-10">
                            <div className="avatar online">
                                <div className="w-32 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 bg-base-100 flex items-center justify-center">
                                    {user?.image || user?.avatar ? (
                                        <img 
                                            src={user?.image || user?.avatar} 
                                            alt="Avatar do usuário " 
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <CircleUser className="w-50 h-50 opacity-50" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Header Info */}
                        <div className="mt-16 sm:ml-4 mb-6">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">{user?.name || 'Usuário'}</h1>
                                {user?.isVerified && (
                                    <div className="tooltip" data-tip="Conta Verificada">
                                        <CheckCircle className="w-6 h-6 text-success" />
                                    </div>
                                )}
                            </div>
                            <p className="text-base-content/70 flex items-center gap-1">
                                {user?.email}
                            </p>
                        </div>

                        <div className="divider"></div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label"><span className="label-text flex items-center gap-2 font-medium"><User size={18} /> Nome Completo</span></label>
                                <p className="input input-bordered w-full bg-base-200/50">{user?.name || ''}</p>
                                
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text flex items-center gap-2 font-medium"><Mail size={18} /> Email</span></label>
                                <p className="input input-bordered w-full bg-base-200/50">{user?.email || ''}</p>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text flex items-center gap-2 font-medium"><Shield size={18} /> Status</span></label>
                                <div className={`input input-bordered flex items-center gap-2 w-full ${user?.isVerified ? 'text-success bg-success/10 border-success/20' : 'text-warning bg-warning/10 border-warning/20'}`}>
                                    {user?.isVerified ? <><CheckCircle size={18} /><span className="font-medium">Verificado</span></> : <><XCircle size={18} /><span className="font-medium">Não Verificado</span></>}
                                </div>
                                
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text flex items-center gap-2 font-medium"><Calendar size={18} /> Membro Desde</span></label>
                                <p className="input input-bordered w-full bg-base-200/50">{formatDate(user?.createdAt)}</p>
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-8">
                            <Link className="btn btn-primary" to={"/update-user"}> <Bolt/> Editar Perfil</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PerfilPage
