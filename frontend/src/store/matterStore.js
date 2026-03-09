import { create } from 'zustand'
import axios from 'axios'
import { API_URL } from '../../API_URL'

export const useMatterStore = create((set, get) => ({
    matters: [],
    subjectsByMatter: {}, 
    allSubjects: [],
    hasFetchedMatters: false,
    hasFetchedAllSubjects: false,

    fetchMatters: async (force = false) => {
        if (!force && get().hasFetchedMatters) return; 

        try {
            const response = await axios.get(`${API_URL}/matter/get-matters`, { withCredentials: true })
            if (response.data.success) {
                set({ 
                    matters: response.data.matters, 
                    hasFetchedMatters: true,
                    // Se forçou a atualização das matérias (ex: apagou uma matéria), 
                    // invalida o cache global de assuntos também
                    ...(force ? { hasFetchedAllSubjects: false } : {})
                })
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
                        [matterId]: response.data.subjects.sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(a.createdAt) - new Date(b.createdAt))
                    },
                    // A MÁGICA ACONTECE AQUI: 
                    // Se forçamos a busca (force = true) porque mudamos o status para CONCLUÍDO,
                    // dizemos ao Zustand que a lista global 'allSubjects' está desatualizada.
                    ...(force ? { hasFetchedAllSubjects: false } : {})
                }))
            }
        } catch (error) {
            console.error("Erro ao buscar assuntos:", error)
        }
    },

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
