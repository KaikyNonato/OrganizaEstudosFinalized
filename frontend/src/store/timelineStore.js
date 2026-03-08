import { create } from 'zustand'
import axios from 'axios'
import { API_URL } from '../../API_URL'

export const useTimelineStore = create((set, get) => ({
    schedule: [],
    hasFetchedSchedule: false,

    fetchSchedule: async (force = false) => {
        // Se não for forçado e já tivermos os dados, usa o cache
        if (!force && get().hasFetchedSchedule) return;

        try {
            const response = await axios.get(`${API_URL}/timeline/get-timeline`, { withCredentials: true })
            if (response.data.success) {
                set({ schedule: response.data.timeline, hasFetchedSchedule: true })
            }
        } catch (error) {
            console.error("Erro ao buscar cronograma:", error)
        }
    },

    clearTimelineStore: () => set({ schedule: [], hasFetchedSchedule: false })
}))