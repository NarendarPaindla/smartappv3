import axios from 'axios';
import { getItem, removeItem } from './storage';
import { router } from 'expo-router';
import Constants from 'expo-constants';

// Dynamically get the host URI (IP address) of the machine running the Expo server
const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (!localhost) {
        // Fallback for simulators or if hostUri is not available
        return 'https://smartspendb.onrender.com/api';
    }

    return `https://smartspendb.onrender.com/api`;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use(
    async (config) => {
        console.log(`[API] Request: ${config.method?.toUpperCase()} ${config.url}`);
        const userStr = await getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        } else {
            const token = await getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        console.error('[API] Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`[API] Response: ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        console.error('[API] Response Error:', error.response?.status, error.response?.data || error.message);
        if (error.response && error.response.status === 401) {
            await removeItem('user');
            await removeItem('token');
            router.replace('/(auth)/login');
        }
        return Promise.reject(error);
    }
);

export default api;
