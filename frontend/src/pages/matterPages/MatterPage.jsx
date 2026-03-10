// Arquivo: MatterPage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Plus, Loader } from 'lucide-react'

// Adapte os caminhos abaixo conforme a estrutura real das suas pastas
import { API_URL } from '../../../API_URL'
import { useAuthStore } from '../../store/authStore'
import { useMatterStore } from '../../store/matterStore'

// Importando o novo componente
import MatterItem from '../../components/MatterItem'

const MatterPage = () => {
    // --- 1. Stores e Hooks ---
    const { isAuthenticated } = useAuthStore()
    const { matters, fetchMatters } = useMatterStore()

    // --- 2. Constantes ---
    const colors = [
        { hex: '#ff6467', className: 'bg-red-400' },
        { hex: '#05df72', className: 'bg-green-400' },
        { hex: '#50a2ff', className: 'bg-blue-400' },
        { hex: '#ff8904', className: 'bg-orange-400' },
        { hex: '#c27aff', className: 'bg-purple-400' }
    ]

    // --- 3. Estados ---
    const [title, setTitle] = useState('')
    const [selectedColor, setSelectedColor] = useState('#ff6467')
    const [isCreatingMatter, setIsCreatingMatter] = useState(false)

    // --- 4. Efeitos ---
    useEffect(() => {
        if (isAuthenticated) {
            fetchMatters(false)
        }
    }, [isAuthenticated, fetchMatters])

    // --- 5. Handlers ---
    const handleCreateMatter = async (e) => {
        e.preventDefault()
        setIsCreatingMatter(true)
        try {
            const response = await axios.post(API_URL + "/matter/create-matter", { title, color: selectedColor }, { withCredentials: true })
            if (response.data.success) {
                toast.success("Matéria criada com sucesso!")
                setTitle('')
                setSelectedColor('#ff6467')
                document.getElementById('create_matter_modal').close()
                fetchMatters(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Erro ao criar matéria")
        } finally {
            setIsCreatingMatter(false)
        }
    }

    // --- 6. Retorno do JSX ---
    return (
        <div className='flex flex-col gap-6'>
            {/* CABEÇALHO */}
            <div className='flex items-center gap-3 justify-between'>
                <p className='font-medium'>◉ Gerencie suas matérias e assuntos</p>
                {isAuthenticated ? (
                    <button className='btn' title='Adicionar nova Matéria' onClick={() => document.getElementById('create_matter_modal').showModal()}>
                        <Plus /> Nova Materia
                    </button>
                ) : (
                    <Link to="/login" className="btn btn-soft btn-sm">Faça login para adicionar</Link>
                )}
            </div>

            {/* MODAL: CRIAR MATÉRIA */}
            <dialog id="create_matter_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Nova Matéria</h3>
                    <form onSubmit={handleCreateMatter}>
                        <div className="py-4">
                            <input type="text" placeholder="Nome da matéria" className="input input-bordered w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className='flex gap-5 items-center justify-center'>
                            {colors.map((c) => (
                                <button
                                    key={c.hex}
                                    type="button"
                                    className={`btn w-10 h-10 rounded-full ${c.className} ${selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                    onClick={() => setSelectedColor(c.hex)}
                                ></button>
                            ))}
                        </div>
                        <div className="modal-action">
                            <button type="button" className="btn" title='Cancelar adição da Matéria' onClick={() => document.getElementById('create_matter_modal').close()}>Cancelar</button>
                            <button disabled={isCreatingMatter} type="submit" className="btn  btn-primary" title='Salvar Matéria'>
                                {isCreatingMatter ? <Loader size={20} className="animate-spin" /> : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>

            {/* LISTA DE MATÉRIAS */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pb-4'>
                {matters.length > 0 ? matters.map((matter) => (
                    // Aqui estamos chamando o componente importado!
                    <MatterItem key={matter._id} matter={matter} />
                )) : (
                    <div className="col-span-full text-center text-base-content/50 py-10 border border-dashed border-base-content/20 rounded-lg">
                        Nenhuma matéria cadastrada no momento.
                    </div>
                )}
            </div>
        </div>
    )
}

export default MatterPage
