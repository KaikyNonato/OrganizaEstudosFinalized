import { create } from 'zustand'
import axios from 'axios'
import toast from 'react-hot-toast'
import { API_URL } from '../../API_URL'
// const API_URL = "http://localhost:5000/api/user"

export const useUserStore = create((set) => ({
    user: null,
    isLoading: false,
    error: null,

    updateUser: async (name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.put(API_URL + "/user/update-user", name);
            set({ user: response.data.user, isLoading: false });
            toast.success("User updated successfully");
            return response.data;
        } catch (error) {
            set({ isLoading: false, error: error.response.data.message || "Error updating user" });
            toast.error(error.response.data.message || "Error updating user");
            throw error;
        }
    }
}));