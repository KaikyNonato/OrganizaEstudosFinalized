import { create } from 'zustand'
import axios from 'axios'
import { API_URL } from '../../API_URL'

export const useMatterStore = create((set, get) => ({
    matters: [],
    subjectsByMatter: {}, 
    allSubjects: [], // <-- NOVO: Guarda todos os assuntos
    hasFetchedMatters: false,
    hasFetchedAllSubjects: false, // <-- NOVO: Controla o cache de todos os assuntos

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
        if (!force && currentSubjects) return;

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

    // <-- NOVA FUNÇÃO: Busca todos os assuntos para a página de Revisões e Dashboard
    fetchAllSubjects: async (force = false) => {
        if (!force && get().hasFetchedAllSubjects) return;

        try {
            const response = await axios.get(`${API_URL}/subject/get-subjects`, { withCredentials: true })
            if (response.data.success) {
                set({ allSubjects: response.data.subjects, hasFetchedAllSubjects: true })
            }
        } catch (error) {
            console.error("Erro ao buscar todos os assuntos:", error)
        }
    },

    clearMatterStore: () => set({ 
        matters: [], 
        subjectsByMatter: {}, 
        allSubjects: [], 
        hasFetchedMatters: false, 
        hasFetchedAllSubjects: false 
    })
}))