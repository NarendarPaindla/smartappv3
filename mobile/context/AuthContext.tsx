import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../utils/api';
import { setItem, getItem, removeItem } from '../utils/storage';
import { router } from 'expo-router';

interface User {
    token: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    signup: (userData: any) => Promise<any>;
    logout: () => Promise<void>;
    updateUserProfile: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        console.log('[AuthContext] Attempting login for:', email);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            console.log('[AuthContext] Login successful, data received');
            await setItem('user', JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            console.error('[AuthContext] Login error:', error);
            throw error;
        }
    };

    const signup = async (userData: any) => {
        const { data } = await api.post('/auth/signup', userData);
        await setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = async () => {
        await removeItem('user');
        setUser(null);
        router.replace('/(auth)/login');
    };

    const updateUserProfile = async (userData: any) => {
        await setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUserProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
