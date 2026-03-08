import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL } from '../../API_URL'


// const API_URL = "http://localhost:5000/api/auth"

axios.defaults.withCredentials = true

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(API_URL + "/auth/signup", { email, password, name })
            set({ user: response.data.user, isAuthenticated: true, isLoading: false })
        } catch (error) {
            set({ error: error.response.data.message || "Error signing up", isLoading: false })
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(API_URL + "/auth/verify-email", { code })
            set({ user: response.data.user, isAuthenticated: true, isLoading: false })
            return response.data
        } catch (error) {
            set({ error: error.response.data.message || "Error verifying email", isLoading: false })
            throw error;
        }

    },

    login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(API_URL + "/auth/login", { email, password })
            set({ user: response.data.user, isAuthenticated: true, isLoading: false })
            return response.data

        } catch (error) {
            set({ error: error.response.data.message || "Error logging in", isLoading: false })
            throw error;
        }

    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null })
        try {
            const response = await axios.get(API_URL + "/auth/check-auth")
            set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false })
        } catch (error) {
            set({ isAuthenticated: false, isCheckingAuth: false, error: null })
            
        }
    },

    forgotPassword: async (email) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(API_URL + "/auth/forgot-password", { email })
            set({ isLoading: false })
            return response.data
        } catch (error) {
            set({ isLoading: false, error: error.response.data.message || "Error sending reset password email" })
            throw error
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password })
            set({ message: response.data.message, isLoading: false })
        } catch (error) {
            set({ isLoading: false, error: error.response.data.message || "Error resetting password" })
            throw error
        }
    },

    checkResetToken: async (token) => {
        set({ isLoading: true, error: null })
        try {
            const response = await axios.get(`${API_URL}/auth/reset-password/${token}`)
            set({ isLoading: false })
            return response.data
        } catch (error) {
            set({ isLoading: false, error: error.response.data.message || "Error verifying reset token" })
            throw error
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null })
        try {
            await axios.post(API_URL + "/auth/logout")
            set({ user: null, isAuthenticated: false, isLoading: false })
            toast.success("Logged out successfully")
            window.location.reload()
        } catch (error) {
            set({ error: error.response.data.message || "Error logging out", isLoading: false })
            throw error;
            
        }
    }
}))