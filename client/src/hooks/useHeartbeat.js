import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const useHeartbeat = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Initial ping
        const sendHeartbeat = async () => {
            try {
                await api.post('/auth/heartbeat');
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        };

        sendHeartbeat();

        // Ping every 60 seconds
        const interval = setInterval(sendHeartbeat, 60000);

        return () => clearInterval(interval);
    }, [user]);
};

export default useHeartbeat;
