import React from 'react'
import { API_URL } from '../../../API_URL';
import axios from 'axios'
import toast from 'react-hot-toast'
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotePage = () => {
    const [matters, setMatters] = React.useState([])

    const fetchMatters = async () => {
        try {
            const response = await axios.get(API_URL + '/matter/get-matters', { withCredentials: true })
            if (response.data.success) {
                setMatters(response.data.matters)
            }
        } catch (error) {
            console.log(error)
            toast.error("Erro ao buscar matérias", { id: "fetch-matters-error" })
        }
    }


    useEffect(() => {
        fetchMatters()
    }, [])




    return (
        <div className="">
            {matters && matters.length > 0 ? (
                <div className="flex flex-col gap-6">
                    <h2 className=" font-medium ">◉ Escolha uma matéria para adicionar notas</h2>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-4'>
                        {matters.map((matter) => (
                            <Link to={`${matter._id}`} key={matter._id} className="group flex items-center gap-3 p-4 rounded-xl border border-base-content/10 bg-base-100 shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer">
                                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: matter.color || '#ccc' }}></div>
                                <span className="font-medium truncate group-hover:text-primary transition-colors text-sm sm:text-base">
                                    {matter.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 bg-base-200/50 rounded-xl border border-dashed border-base-content/20">
                    <p className="text-base-content/60">Nenhuma matéria cadastrada.</p>
                </div>
            )}

            

        </div>
    )
}

export default NotePage
