import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader, MailCheck, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const VerifyEmailPage = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const inputRefs = useRef([])
    const navigate = useNavigate()

    const { verifyEmail, isLoading } = useAuthStore();

    const handleChange = (index, value) => {
        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)

        // Focar no próximo input se digitar um número
        if (value && index < 5) {
            inputRefs.current[index + 1].focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Voltar para o input anterior ao apagar
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").slice(0, 6).split("")
        const newCode = [...code]
        for (let i = 0; i < 6; i++) {
            newCode[i] = pastedData[i] || newCode[i]
        }
        setCode(newCode)
        const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "")
        const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5
        inputRefs.current[focusIndex].focus()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const verificationCode = code.join("");
            const response = await verifyEmail(verificationCode)
            toast.success(response?.data?.message || response?.message || "E-mail verificado com sucesso!");
            navigate('/');
        } catch (error) {
            console.error("Email verification failed:", error);
            toast.error(error.response?.data?.message || error.message || "Erro ao verificar e-mail");
        }
    }

    // Auto-submit quando todos os números forem preenchidos
    useEffect(() => {
        if (code.every(digit => digit !== "")) {
            handleSubmit(new Event('submit'))
        }
    }, [code])

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
                            <MailCheck size={32} />
                        </div>
                        <h2 className='text-2xl font-bold tracking-tight'>Verifique seu e-mail</h2>
                        <p className='text-sm text-base-content/60 mt-1'>
                            Digite o código de 6 dígitos que enviamos para você.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
                        
                        {/* Inputs de Código (OTP) */}
                        <div className='flex justify-center gap-2 sm:gap-3 items-center'>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type='text'
                                    maxLength='1'
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className='w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-base-200/50 border border-base-content/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all'
                                />
                            ))}
                        </div>

                        {/* Botão Submit */}
                        <button 
                            type="submit" 
                            disabled={isLoading || code.some(digit => !digit)}
                            className="btn btn-primary w-full mt-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow disabled:shadow-none"
                        >
                            {isLoading ? <Loader className='animate-spin mx-auto' size={20} /> : 'Verificar E-mail'}
                        </button>
                    </form>

                    {/* Footer - Voltar */}
                    <div className='mt-6 flex justify-center'>
                        <Link to="/signup" className='flex items-center gap-2 text-sm link link-hover text-primary font-bold transition-colors'>
                            <ArrowLeft className='w-4 h-4' /> Voltar para o cadastro
                        </Link>
                    </div>

                </div>
            </motion.div>
        </div>
    )
}

export default VerifyEmailPage