// Arquivo: src/pages/calendarPages/Calender.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useMatterStore } from '../../store/matterStore';
import { useTimelineStore } from '../../store/timelineStore';
import { useAuthStore } from '../../store/authStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, RotateCcw, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const FULL_DAYS_OF_WEEK = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const Calander = () => {
    const { isAuthenticated } = useAuthStore();
    const { allSubjects, fetchAllSubjects } = useMatterStore();
    const { schedule, fetchSchedule } = useTimelineStore();
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [dayEvents, setDayEvents] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllSubjects(false);
            fetchSchedule(false);
        }
    }, [isAuthenticated, fetchAllSubjects, fetchSchedule]);

    const eventMap = useMemo(() => {
        const map = {};

        const addEvent = (dateObj, event) => {
            if (!dateObj) return;
            const key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            if (!map[key]) map[key] = [];
            map[key].push(event);
        };

        if (allSubjects && allSubjects.length > 0) {
            allSubjects.forEach(sub => {
                const color = sub.matter_id?.color || '#ff8904';

                if (sub.review1 && !sub.review1_concluded) {
                    addEvent(new Date(sub.review1), { type: 'review', title: `24h: ${sub.title}`, color, icon: <RotateCcw size={12} /> });
                }
                if (sub.review2 && !sub.review2_concluded) {
                    addEvent(new Date(sub.review2), { type: 'review', title: `7 Dias: ${sub.title}`, color, icon: <RotateCcw size={12} /> });
                }
                if (sub.review3 && !sub.review3_concluded) {
                    addEvent(new Date(sub.review3), { type: 'review', title: `30 Dias: ${sub.title}`, color, icon: <RotateCcw size={12} /> });
                }
            });
        }

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        if (schedule && schedule.length > 0) {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateInMonth = new Date(year, month, day);
                const dayName = FULL_DAYS_OF_WEEK[dateInMonth.getDay()];

                const dailySchedules = schedule.filter(s => s.day === dayName);

                dailySchedules.forEach(item => {
                    addEvent(dateInMonth, {
                        type: 'schedule',
                        title: `${item.startTime} - ${item.matter_id?.title || 'Estudo'}`,
                        color: item.matter_id?.color || '#58a9e1',
                        icon: <Clock size={12} />
                    });
                });
            }
        }

        return map;
    }, [allSubjects, schedule, currentDate]);

    const calendarCells = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            cells.push({ empty: true, key: `empty-${i}` });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toDateString() === dateObj.toDateString();

            cells.push({
                empty: false,
                day,
                dateObj,
                key,
                isToday,
                events: eventMap[key] || []
            });
        }

        return cells;
    }, [currentDate, eventMap]);

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const handleDayClick = (cell) => {
        if (cell.empty || cell.events.length === 0) return;
        setSelectedDay(cell.dateObj);
        setDayEvents(cell.events);
        document.getElementById('day_events_modal').showModal();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 sm:gap-6 min-h-[85vh]">

            {/* Header e Controles (Otimizado para Mobile) */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 bg-base-100 p-3 sm:p-4 rounded-lg border border-base-content/20 shadow-sm">

                {/* Mês e Ano centralizados no mobile */}
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
                    <div className="hidden sm:flex w-10 h-10 bg-primary/10 text-primary rounded-lg items-center justify-center">
                        <CalendarDays size={24} />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-lg sm:text-xl font-bold capitalize">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                        <p className="text-[10px] sm:text-xs text-base-content/50 hidden sm:block">Visão Geral de Estudos</p>
                    </div>
                </div>

                {/* Botões espaçados e fáceis de tocar no mobile */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <button onClick={goToToday} className="btn btn-sm btn-soft flex-1 sm:flex-none">Hoje</button>
                    <div className="join w-full sm:w-auto flex justify-end">
                        <button onClick={prevMonth} className="btn btn-sm join-item flex-1 sm:flex-none"><ChevronLeft size={18} /></button>
                        <button onClick={nextMonth} className="btn btn-sm join-item flex-1 sm:flex-none"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            {/* Grid do Calendário */}
            <div className="flex-1 bg-base-100 border border-base-content/20 rounded-lg shadow-md overflow-hidden flex flex-col">

                {/* Dias da Semana */}
                <div className="grid grid-cols-7 bg-base-200/50 border-b border-base-content/20">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-sm font-semibold text-base-content/70">
                            {/* Mostra só a primeira letra no mobile (D, S, T...) e o nome todo no PC */}
                            <span className="sm:hidden">{day.charAt(0)}</span>
                            <span className="hidden sm:inline">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Células dos Dias */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {calendarCells.map((cell) => (
                        <div
                            key={cell.key}
                            onClick={() => handleDayClick(cell)}
                            className={`min-h-[60px] sm:min-h-[120px] p-1 sm:p-2 border-b border-r border-base-content/10 transition-colors
                                ${cell.empty ? 'bg-base-200/30' : 'hover:bg-base-200/50 cursor-pointer'} 
                                ${cell.isToday ? 'bg-primary/5 border-primary border' : ''}
                            `}
                        >
                            {!cell.empty && (
                                <>
                                    {/* Número do Dia (Centralizado no Mobile) */}
                                    <div className="flex justify-center sm:justify-between items-center mb-1 sm:mb-2">
                                        <span className={`text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${cell.isToday ? 'bg-primary text-white shadow-md' : 'text-base-content/70'}`}>
                                            {cell.day}
                                        </span>
                                    </div>

                                    {/* VISÃO MOBILE: Apenas bolinhas coloridas (dots) */}
                                    <div className="flex sm:hidden flex-wrap justify-center gap-1">
                                        {cell.events.slice(0, 4).map((ev, idx) => (
                                            <div key={idx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color }}></div>
                                        ))}
                                        {cell.events.length > 4 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-base-content/40"></div>
                                        )}
                                    </div>

                                    {/* VISÃO PC: Lista de Eventos Completa */}
                                    <div className="hidden sm:flex flex-col gap-1 overflow-hidden">
                                        {cell.events.slice(0, 3).map((ev, idx) => (
                                            <div
                                                key={idx}
                                                className="text-xs truncate px-1.5 py-0.5 rounded flex items-center gap-1 opacity-90 hover:opacity-100"
                                                style={{ backgroundColor: `${ev.color}20`, color: ev.color, borderLeft: `2px solid ${ev.color}` }}
                                                title={ev.title}
                                            >
                                                <span className="shrink-0">{ev.icon}</span>
                                                <span className="truncate">{ev.title}</span>
                                            </div>
                                        ))}
                                        {cell.events.length > 3 && (
                                            <div className="text-[10px] text-center text-base-content/50 font-medium mt-1">
                                                + {cell.events.length - 3} mais
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de Detalhes do Dia (Igual nas duas versões, pois o DaisyUI já ajusta pra celular) */}
            <dialog id="day_events_modal" className="modal">
                <div className="modal-box p-4 sm:p-6">
                    <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2 border-b border-base-content/10 pb-2">
                        <CalendarIcon className="text-primary" size={20} />
                        Agenda: {selectedDay?.toLocaleDateString('pt-BR')}
                    </h3>

                    <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
                        {dayEvents.map((ev, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-2 sm:p-3 bg-base-200/50 rounded-lg border border-base-content/10"
                            >
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${ev.color}20`, color: ev.color }}>
                                    {ev.icon}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: ev.color }}>
                                        {ev.type === 'review' ? 'Revisão' : 'Aula / Estudo'}
                                    </span>
                                    <span className="font-medium truncate text-xs sm:text-sm">{ev.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="modal-action mt-4">
                        <form method="dialog" className="flex gap-2 w-full">
                            <button className="btn btn-sm sm:btn-md flex-1" onClick={() => navigate('/cronograma')}>Ver Cronograma</button>
                            <button className="btn btn-sm sm:btn-md btn-primary flex-1">Fechar</button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

        </motion.div>
    );
};

export default Calander;
