import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { BookOpenText, CircleCheck, Clock, ListTodo, TrendingUp } from 'lucide-react'
import axios from 'axios'
import { API_URL } from '../../API_URL'


const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const HomePage = () => {
    const { isAuthenticated } = useAuthStore()
    const { user } = useAuthStore()
    const [mattersCount, setMattersCount] = useState(0)
    const [pendingCount, setPendingCount] = useState(0)
    const [completedCount, setCompletedCount] = useState(0)
    const [todaysSchedule, setTodaysSchedule] = useState([])
    const [studiedTime, setStudiedTime] = useState(0) // Em minutos

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            try {
                // Executa as duas chamadas em paralelo para mais eficiência
                const [mattersResponse, subjectsResponse, timelineResponse, studyTimeResponse] = await Promise.all([
                    axios.get(API_URL + "/matter/get-matters"),
                    axios.get(API_URL + "/subject/get-subjects"),
                    axios.get(API_URL + "/timeline/get-timeline"),
                    axios.get(API_URL + "/user/get-study-time")
                ]);

                // Processa a resposta das matérias
                if (mattersResponse.data.success) {
                    setMattersCount(mattersResponse.data.matters.length);
                }

                // Processa a resposta dos assuntos
                if (subjectsResponse.data.success) {
                    const subjects = subjectsResponse.data.subjects;
                    let pending = 0;
                    let completed = 0;

                    subjects.forEach(sub => {
                        if (sub.status === 'CONCLUIDO') {
                            completed++;
                        } else {
                            pending++;
                        }
                    });

                    setPendingCount(pending);
                    setCompletedCount(completed);
                }

                // Processa a resposta do cronograma
                if (timelineResponse.data.success) {
                    const todayIndex = new Date().getDay();
                    const todayString = daysOfWeek[todayIndex];
                    const todayItems = timelineResponse.data.timeline
                        .filter(item => item.day === todayString)
                        .sort((a, b) => a.startTime.localeCompare(b.startTime));
                    setTodaysSchedule(todayItems);
                }

                if (studyTimeResponse.data.success) {
                    setStudiedTime(studyTimeResponse.data.totalStudyTime);
                }
            } catch (error) {
                console.error("Erro ao buscar dados:", error)
            }
        }

        fetchData()


    }, [isAuthenticated])


    const formatStudyTime = (totalMinutes) => {
        if (!totalMinutes || totalMinutes === 0) return "0h";
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        if (h === 0) return `${m}m`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    };

    return (
        <div className='flex flex-col gap-6'>
            <h3 className='font-medium'>◉ Visão geral dos seus estudos</h3>
            <div className='flex flex-col gap-3'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 '>
                    <div className='flex flex-col gap-3  border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Matérias</span>
                            <BookOpenText size={15} ></BookOpenText>
                        </div>
                        <span className='text-4xl'>{mattersCount}</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Assuntos pendentes</span>
                            <ListTodo size={15} ></ListTodo>
                        </div>
                        <span className='text-4xl'>{pendingCount}</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Assuntos concluídos</span>
                            <CircleCheck size={15} ></CircleCheck>
                        </div>
                        <span className='text-4xl'>{completedCount}</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Horas estudadas</span>
                            <Clock size={15} />
                        </div>
                        {/* Agora puxa o tempo real do usuário! */}
                        <span className='text-4xl'>{formatStudyTime(studiedTime)}</span>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold text-2xl'>Progresso Geral</span>
                            <TrendingUp size={20} ></TrendingUp>
                        </div>
                        <progress className="progress w-full h-3.5" value={(pendingCount + completedCount) > 0 ? (completedCount / (pendingCount + completedCount) * 100) : 0} max="100"></progress>
                        <span>{(pendingCount + completedCount) > 0 ? (completedCount / (pendingCount + completedCount) * 100).toFixed(1) : 0}% dos assuntos foram concluídos</span>
                    </div>
                    <div className='flex flex-col gap-3 border border-base-content/20 p-6 rounded-lg shadow-md'>
                        <div className='flex items-center justify-between'>
                            <span className='font-bold'>Estudar Hoje</span>
                            <span className='text-xs badge badge-ghost'>{daysOfWeek[new Date().getDay()]}</span>
                        </div>
                        <div className='flex flex-col gap-2 overflow-y-auto max-h-[200px]'>
                            {todaysSchedule.length > 0 ? (
                                todaysSchedule.map((item) => (
                                    <div key={item._id} className='flex items-center justify-between bg-base-200/50 p-2 rounded-lg border border-base-content/5'>
                                        <div className='flex items-center gap-2'>
                                            <div className={`w-2 h-2 rounded-full ${item.matter_id?.color === '#ff6467' ? 'bg-red-400' :
                                                item.matter_id?.color === '#05df72' ? 'bg-green-400' :
                                                    item.matter_id?.color === '#50a2ff' ? 'bg-blue-400' :
                                                        item.matter_id?.color === '#ff8904' ? 'bg-orange-400' :
                                                            'bg-purple-400'
                                                }`}></div>
                                            <span className='font-medium text-sm truncate max-w-[120px]'>{item.matter_id?.title}</span>
                                        </div>
                                        <span className='text-xs font-mono opacity-70'>{item.startTime} - {item.endTime}</span>
                                    </div>
                                ))
                            ) : (
                                <span className='text-sm text-base-content/60 italic'>Nenhum horário agendado.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
