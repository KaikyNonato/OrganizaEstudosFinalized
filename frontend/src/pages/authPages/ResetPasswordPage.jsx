import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock, Loader, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isChecking, setIsChecking] = useState(true)
    
    const { resetPassword, isLoading, checkResetToken } = useAuthStore()
    const { token } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const verifyToken = async () => {
            try {
                await checkResetToken(token)
                setIsChecking(false)
            } catch (error) {
                toast.error("Token inválido ou expirado", {id: "invalid-token"})
                navigate('/login')
            }
        }
        verifyToken()
    }, [checkResetToken, token, navigate])

    // Tela de carregamento inicial enquanto verifica o token
    if (isChecking) return (
        <div className='min-h-screen bg-base-200 flex justify-center items-center'>
            <Loader className='animate-spin w-10 h-10 text-primary' />
        </div>
    )

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem", {id: "password-mismatch"})
            return
        }

        try {
            await resetPassword(token, password)
            toast.success("Senha redefinida com sucesso! Redirecionando para o login...", {id: "password-reset-success"})
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao redefinir senha", {id: "password-reset-error"})
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
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className='text-2xl font-bold tracking-tight'>Redefinir Senha</h2>
                        <p className='text-sm text-base-content/60 mt-1'>Crie uma nova senha segura para sua conta</p>
                    </div>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
                        
                        {/* Input Nova Senha */}
                        <div className='flex flex-col gap-1'>
                            <label className="input validator w-full flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 transition-colors">
                                <Lock className="w-5 h-5 text-base-content/50" />
                                <input
                                    type="password"
                                    placeholder="Nova Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
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

                        {/* Input Confirmar Senha */}
                        <div className='flex flex-col gap-1'>
                            <label className="input validator w-full flex items-center gap-2 bg-base-200/50 focus-within:bg-base-100 transition-colors">
                                <Lock className="w-5 h-5 text-base-content/50" />
                                <input
                                    type="password"
                                    placeholder="Confirme a Nova Senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength="8"
                                    className="grow"
                                />
                            </label>
                        </div>

                        {/* Botão Submit */}
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="btn btn-primary w-full mt-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow disabled:shadow-none"
                        >
                            {isLoading ? <Loader className='animate-spin mx-auto' size={20} /> : 'Salvar nova senha'}
                        </button>
                    </form>

                </div>
            </motion.div>
        </div>
    )
}

export default ResetPasswordPage