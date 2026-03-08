import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader, Mail, Lock, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    
    const navigate = useNavigate()
    const { login, isLoading } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await login(email, password);
            toast.success(response?.data?.message || response?.message || "Login realizado com sucesso");
            navigate('/');
        } catch (error) {
            console.error("Login failed:", error);
            toast.error(error.response?.data?.message || error.message || "Erro ao fazer login");
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
                            <LogIn size={32} />
                        </div>
                        <h2 className='text-2xl font-bold tracking-tight'>Bem-vindo de volta!</h2>
                        <p className='text-sm text-base-content/60 mt-1'>Faça login para acessar seus estudos</p>
                    </div>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                        
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
                                    placeholder="••••••••"
                                    minLength="8"
                                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
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
                            {isLoading ? <Loader className='animate-spin' size={20} /> : 'Entrar na plataforma'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className='mt-6 text-center text-sm text-base-content/70'>
                        Não possui uma conta?{' '}
                        <Link to="/signup" className='link link-hover text-primary font-bold transition-colors'>
                            Cadastre-se agora
                        </Link>
                    </div>
                    
                </div>
            </motion.div>
        </div>
    )
}

export default LoginPage