import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const signup = async (userData) => {
        const { data } = await api.post('/auth/signup', userData);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const loginWithToken = async (token) => {
        localStorage.setItem('token', token); // Ensure api.js can pick it up
        try {
            const { data } = await api.get('/auth/me');
            const userData = { ...data, token };
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('token'); // Cleanup
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Failed to fetch user with token:", error);
            localStorage.removeItem('token');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUserProfile = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, loginWithToken, logout, updateUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
