import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Brain, Coffee, Armchair, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { usePomodoroStore } from '../../store/pomodoroStore'; // <-- Nova Store
import { API_URL } from '../../../API_URL';

const PomodoroPage = () => {
    const { isAuthenticated } = useAuthStore();
    
    // Conectando com a Store Global
    const { 
        settings, mode, timeLeft, isActive, endTime,
        setSettings, setTimeLeft, setIsActive, setEndTime,
        toggleTimer, resetTimer, switchMode 
    } = usePomodoroStore();

    // Estado temporário apenas para os inputs do modal
    const [tempSettings, setTempSettings] = useState(settings);

    // Efeito Mágico: Lida com a contagem baseada na hora real do computador
    useEffect(() => {
        let interval = null;

        const tick = () => {
            const now = Date.now();
            const remaining = Math.round((endTime - now) / 1000);

            if (remaining <= 0) {
                // O tempo acabou!
                setTimeLeft(0);
                setIsActive(false);
                setEndTime(null);
                clearInterval(interval);

                if (mode === 'pomodoro') {
                    toast.success("Pomodoro concluído! Hora de uma pausa.", { duration: 5000, icon: '🎉' });
                    if (isAuthenticated) {
                        axios.post(API_URL + '/user/add-study-time', {
                            minutes: settings.pomodoro
                        }).catch(err => console.error("Erro ao salvar tempo", err));
                    }
                } else {
                    toast.success("Pausa terminada! Vamos voltar ao foco.", { duration: 5000, icon: '💪' });
                }
            } else {
                setTimeLeft(remaining);
            }
        };

        if (isActive && endTime) {
            tick(); // Checa imediatamente ao montar o componente
            interval = setInterval(tick, 500); // Roda a cada meio segundo
        }

        return () => clearInterval(interval);
    }, [isActive, endTime, mode, isAuthenticated, settings.pomodoro, setTimeLeft, setIsActive, setEndTime]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const getTotalTime = () => {
        if (mode === 'pomodoro') return settings.pomodoro * 60;
        if (mode === 'shortBreak') return settings.shortBreak * 60;
        return settings.longBreak * 60;
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();

        if (tempSettings.pomodoro < 1 || tempSettings.shortBreak < 1 || tempSettings.longBreak < 1) {
            toast.error("O tempo deve ser de pelo menos 1 minuto.");
            return;
        }

        setSettings(tempSettings);
        setIsActive(false);
        setEndTime(null);
        
        if (mode === 'pomodoro') setTimeLeft(tempSettings.pomodoro * 60);
        if (mode === 'shortBreak') setTimeLeft(tempSettings.shortBreak * 60);
        if (mode === 'longBreak') setTimeLeft(tempSettings.longBreak * 60);

        document.getElementById('pomodoro_settings_modal').close();
        toast.success("Configurações salvas!");
    };

    const getThemeColors = () => {
        switch (mode) {
            case 'pomodoro': return { bg: 'bg-primary', text: 'text-primary', stroke: 'stroke-primary', lightBg: 'bg-primary/10' };
            case 'shortBreak': return { bg: 'bg-success', text: 'text-success', stroke: 'stroke-success', lightBg: 'bg-success/10' };
            case 'longBreak': return { bg: 'bg-info', text: 'text-info', stroke: 'stroke-info', lightBg: 'bg-info/10' };
            default: return { bg: 'bg-primary', text: 'text-primary', stroke: 'stroke-primary', lightBg: 'bg-primary/10' };
        }
    };

    const theme = getThemeColors();
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / getTotalTime()) * circumference;

    return (
        <div className=''>
            <div className=''>
                <p className='font-medium '>◉ Gerencie suas sessões de estudo com a técnica Pomodoro</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col gap-8 items-center  justify-center min-h-[85vh] relative'
            >
                <div className='bg-base-100 shadow-md border border-base-content/20 rounded-lg p-8 md:p-12 w-full max-w-md flex flex-col items-center gap-10 relative overflow-hidden'>

                    <button
                        onClick={() => document.getElementById('pomodoro_settings_modal').showModal()}
                        className="absolute top-6 right-6 btn btn-circle btn-ghost btn-sm text-base-content/50 hover:text-base-content z-20 max-md:top-3 max-md:right-3"
                        title="Configurações de Tempo"
                    >
                        <Settings size={20} />
                    </button>

                    <div className="bg-base-200/60 p-1.5 rounded-full flex gap-1 z-10 w-full mt-4 border border-base-content/20">
                        {[
                            { id: 'pomodoro', icon: Brain, label: 'Foco' },
                            { id: 'shortBreak', icon: Coffee, label: 'Curta' },
                            { id: 'longBreak', icon: Armchair, label: 'Longa' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => switchMode(item.id)}
                                className={`flex-1 flex justify-center items-center gap-2 py-2.5 px-3 rounded-full font-semibold text-sm transition-all duration-300 ${mode === item.id
                                    ? `${theme.bg} text-white shadow-md`
                                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
                                    }`}
                            >
                                <item.icon size={16} />
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative flex items-center justify-center z-10">
                        <svg className="w-[280px] h-[280px] -rotate-90 transform" viewBox="0 0 280 280">
                            <circle cx="140" cy="140" r={radius} fill="transparent" strokeWidth="12" className="stroke-base-200" />
                            <motion.circle
                                cx="140" cy="140" r={radius}
                                fill="transparent"
                                strokeWidth="12"
                                strokeLinecap="round"
                                className={`${theme.stroke} transition-colors duration-500`}
                                style={{ strokeDasharray: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 0.5, ease: "linear" }}
                            />
                        </svg>

                        <div className="absolute flex flex-col items-center">
                            <span className={` select-none font-mono text-6xl md:text-7xl font-black tracking-tighter ${theme.text} transition-colors duration-500`}>
                                {formatTime(timeLeft)}
                            </span>
                            <span className="text-base-content/50 font-medium text-sm mt-1 uppercase tracking-widest select-none">
                                {mode === 'pomodoro' ? 'Sessão de Foco' : 'Hora da Pausa'}
                            </span>
                        </div>
                    </div>

                    <div className='flex items-center gap-6 z-10'>
                        <button
                            onClick={toggleTimer}
                            className={`btn btn-circle w-20 h-20 shadow-xl border-none text-white hover:scale-105 transition-all duration-300 ${isActive ? 'bg-error hover:bg-error/90' : `${theme.bg} hover:brightness-110`}`}
                            title={isActive ? 'Pausar' : 'Iniciar'}
                        >
                            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                        </button>

                        <button
                            onClick={resetTimer}
                            className="btn btn-circle w-14 h-14 bg-base-200 text-base-content/70 border-none hover:bg-base-300 hover:text-base-content transition-all duration-300 hover:-rotate-180"
                            title='Reiniciar'
                        >
                            <RotateCcw size={24} />
                        </button>
                    </div>

                </div>

                <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center text-sm font-medium px-6 py-3 rounded-2xl max-w-md ${theme.lightBg} ${theme.text}`}
                >
                    <p>
                        {mode === 'pomodoro' && "Dica: Mantenha o celular longe e foque em apenas uma tarefa."}
                        {mode === 'shortBreak' && "Dica: Levante-se, beba água e alongue o corpo."}
                        {mode === 'longBreak' && "Dica: Descanse a mente, faça um lanche ou caminhe um pouco."}
                    </p>
                </motion.div>

                <dialog id="pomodoro_settings_modal" className="modal">
                    <div className="modal-box max-w-sm">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Settings size={20} /> Configurar Tempos
                        </h3>

                        <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium flex items-center gap-2"><Brain size={16} /> Tempo de Foco (min)</span>
                                </label>
                                <input
                                    type="number" min="1" max="120"
                                    className="input input-bordered w-full focus:border-primary"
                                    value={tempSettings.pomodoro}
                                    onChange={(e) => setTempSettings({ ...tempSettings, pomodoro: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium flex items-center gap-2"><Coffee size={16} /> Pausa Curta (min)</span>
                                </label>
                                <input
                                    type="number" min="1" max="60"
                                    className="input input-bordered w-full focus:border-success"
                                    value={tempSettings.shortBreak}
                                    onChange={(e) => setTempSettings({ ...tempSettings, shortBreak: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text font-medium flex items-center gap-2"><Armchair size={16} /> Pausa Longa (min)</span>
                                </label>
                                <input
                                    type="number" min="1" max="60"
                                    className="input input-bordered w-full focus:border-info"
                                    value={tempSettings.longBreak}
                                    onChange={(e) => setTempSettings({ ...tempSettings, longBreak: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="modal-action mt-6">
                                <button type="button" className="btn btn-ghost" onClick={() => {
                                    setTempSettings(settings);
                                    document.getElementById('pomodoro_settings_modal').close();
                                }}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Salvar</button>
                            </div>
                        </form>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={() => setTempSettings(settings)}>close</button>
                    </form>
                </dialog>
            </motion.div>
        </div>
    );
};

export default PomodoroPage;
