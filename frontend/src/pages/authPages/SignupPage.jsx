import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader, Mail, Lock, User, UserPlus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const SignupPage = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const navigate = useNavigate()
    const { signup, isLoading } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await signup(email, password, name);
            toast.success(response?.data?.message || response?.message || "Cadastro realizado com sucesso!");
            
            // Redireciona direto para a Home já que removemos a verificação de e-mail
            navigate('/'); 
        } catch (error) {
            console.error("Signup failed:", error);
            toast.error(error.response?.data?.message || error.message || "Erro ao cadastrar");
        }
    }

    return (
        <div className='min-h-screen bg-base-200 flex justify-center items-center p-4'>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className='card bg-base-100 w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border border-base-content/5'
            >
                <div className='card-body p-8 sm:p-10'>
                    
                    {/* Header */}
                    <div className='text-center mb-6'>
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus size={32} />
                        </div>
                        <h2 className='text-2xl font-bold tracking-tight'>Crie sua conta</h2>
                        <p className='text-sm text-base-content/60 mt-1'>Comece a organizar seus estudos hoje mesmo</p>
                    </div>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                        
                        {/* Input Nome */}
                        <div className='flex flex-col gap-1'>
                            <label className="input validator w-full flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 transition-colors">
                                <User className="w-5 h-5 text-base-content/50" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Seu nome completo"
                                    pattern="[A-Za-zÀ-ÿ0-9\s\-]+"
                                    minLength="3"
                                    maxLength="40"
                                    title="Letras, números e espaços"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="grow"
                                />
                            </label>
                            <p className="validator-hint hidden text-xs text-error mt-1">
                                Deve ter entre 3 e 40 caracteres
                                <br />Pode conter letras, números e espaços
                            </p>
                        </div>

                        {/* Input E-mail */}
                        <div className='flex flex-col gap-1'>
                            <label className="input validator w-full flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 transition-colors">
                                <Mail className="w-5 h-5 text-base-content/50" />
                                <input
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="grow"
                                />
                            </label>
                            <div className="validator-hint hidden text-xs text-error">Insira um endereço de e-mail válido</div>
                        </div>

                        {/* Input Senha */}
                        <div className='flex flex-col gap-1'>
                            <label className="input validator w-full flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 transition-colors">
                                <Lock className="w-5 h-5 text-base-content/50" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Crie uma senha forte"
                                    minLength="8"
                                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                    title="Deve ter mais de 8 caracteres, incluindo número, letra maiúscula e minúscula"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="grow"
                                />
                            </label>
                            <p className="validator-hint hidden text-xs text-error mt-1">
                                A senha deve ter mais de 8 caracteres, incluindo:
                                <br />• Pelo menos um número 
                                <br />• Pelo menos uma letra minúscula 
                                <br />• Pelo menos uma letra maiúscula
                            </p>
                        </div>

                        {/* Botão Submit */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn btn-primary w-full mt-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                        >
                            {isLoading ? <Loader className='animate-spin' size={20} /> : 'Criar minha conta'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className='mt-6 text-center text-sm text-base-content/70'>
                        Já possui uma conta?{' '}
                        <Link to="/login" className='link link-hover text-primary font-bold transition-colors'>
                            Faça login
                        </Link>
                    </div>
                    
                </div>
            </motion.div>
        </div>
    )
}

export default SignupPage