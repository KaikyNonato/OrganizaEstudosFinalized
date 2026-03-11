import { create } from 'zustand';

export const usePomodoroStore = create((set, get) => {
    // Tenta recuperar as configs salvas no cache do navegador
    const savedSettings = localStorage.getItem('pomodoroSettings');
    const initialSettings = savedSettings ? JSON.parse(savedSettings) : {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };

    return {
        settings: initialSettings,
        mode: 'pomodoro',
        timeLeft: initialSettings.pomodoro * 60,
        isActive: false,
        endTime: null, // Guarda a hora exata que o alarme deve tocar

        // Ações simples
        setSettings: (newSettings) => {
            localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
            set({ settings: newSettings });
        },
        setTimeLeft: (time) => set({ timeLeft: time }),
        setIsActive: (status) => set({ isActive: status }),
        setEndTime: (time) => set({ endTime: time }),

        // Ações Complexas (Regras de Negócio)
        switchMode: (newMode) => {
            const { settings } = get();
            let newTime = settings.pomodoro * 60;
            if (newMode === 'shortBreak') newTime = settings.shortBreak * 60;
            if (newMode === 'longBreak') newTime = settings.longBreak * 60;

            set({ mode: newMode, timeLeft: newTime, isActive: false, endTime: null });
        },

        toggleTimer: () => {
            const { isActive, timeLeft } = get();
            if (!isActive) {
                // Ao dar play, calcula matematicamente a hora futura do fim
                set({ isActive: true, endTime: Date.now() + timeLeft * 1000 });
            } else {
                set({ isActive: false, endTime: null });
            }
        },

        resetTimer: () => {
            const { mode, settings } = get();
            let newTime = settings.pomodoro * 60;
            if (mode === 'shortBreak') newTime = settings.shortBreak * 60;
            if (mode === 'longBreak') newTime = settings.longBreak * 60;

            set({ isActive: false, endTime: null, timeLeft: newTime });
        }
    };
});