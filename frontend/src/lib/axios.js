
import axios from 'axios';
import { API_URL } from '../../API_URL';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Obriga o navegador a enviar os cookies sempre!
});