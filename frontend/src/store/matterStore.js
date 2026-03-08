import { create } from 'zustand'
import axios from 'axios'
import { API_URL } from '../../API_URL'

export const useMatterStore = create((set, get) => ({
    matters: [],
    subjectsByMatter: {}, // Guarda os assuntos separados por ID da matéria { 'id_materia': [assuntos] }
    hasFetchedMatters: false,

    // O parâmetro force=true obriga a ir buscar à API. Se for false, usa o cache.
    fetchMatters: async (force = false) => {
        if (!force && get().hasFetchedMatters) return; 

        try {
            const response = await axios.get(`${API_URL}/matter/get-matters`, { withCredentials: true })
            if (response.data.success) {
                set({ matters: response.data.matters, hasFetchedMatters: true })
            }
        } catch (error) {
            console.error("Erro ao buscar matérias:", error)
        }
    },

    fetchSubjects: async (matterId, force = false) => {
        const currentSubjects = get().subjectsByMatter[matterId];
        if (!force && currentSubjects) return; // Se já temos os assuntos em cache, não busca de novo

        try {
            const response = await axios.get(`${API_URL}/subject/get-subjects/${matterId}`, { withCredentials: true })
            if (response.data.success) {
                set((state) => ({
                    subjectsByMatter: {
                        ...state.subjectsByMatter,
                        [matterId]: response.data.subjects.sort((a, b) => (a.order || 0) - (b.order || 0))
                    }
                }))
            }
        } catch (error) {
            console.error("Erro ao buscar assuntos:", error)
        }
    },

    clearMatterStore: () => set({ matters: [], subjectsByMatter: {}, hasFetchedMatters: false })
}))