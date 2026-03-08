import React, { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import { Loader, ArrowLeft, Mail, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    
    const { forgotPassword, isLoading } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await forgotPassword(email)
            setIsSubmitted(true)
            toast.success("Link de redefinição enviado para o seu e-mail")
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao enviar e-mail")
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

                    {!isSubmitted ? (
                        <>
                            {/* Header */}
                            <div className='text-center mb-6'>
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <KeyRound size={32} />
                                </div>
                                <h2 className='text-2xl font-bold tracking-tight'>Esqueceu a senha?</h2>
                                <p className='text-sm text-base-content/60 mt-1'>
                                    Digite seu e-mail e enviaremos um link de recuperação
                                </p>
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

                                {/* Botão Submit */}
                                <button 
                                    className="btn btn-primary w-full mt-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader className='animate-spin mx-auto' size={20} /> : 'Enviar link de recuperação'}
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Tela de Sucesso */
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            className='text-center py-4'
                        >
                            <div className='w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6'>
                                <Mail className='w-10 h-10' />
                            </div>
                            <h3 className="text-xl font-bold mb-2 tracking-tight">Verifique sua caixa de entrada</h3>
                            <p className='text-sm text-base-content/60 mb-6'>
                                Se existir uma conta com o e-mail <br/><strong className="text-base-content font-semibold">{email}</strong>, você receberá um link para redefinir a senha em breve.
                            </p>
                        </motion.div>
                    )}

                    {/* Footer - Voltar */}
                    <div className='mt-6 flex justify-center'>
                        <Link to="/login" className='flex items-center gap-2 text-sm link link-hover text-primary font-bold transition-colors'>
                            <ArrowLeft className='w-4 h-4' /> Voltar para o Login
                        </Link>
                    </div>

                </div>
            </motion.div>
        </div>
    )
}

export default ForgotPasswordPage