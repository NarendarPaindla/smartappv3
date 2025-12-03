import { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        // Stop any current animation
        fadeAnim.stopAnimation();
        fadeAnim.setValue(0);

        setToast({ message, type });

        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setToast(null);
        });
    }, [fadeAnim]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        { opacity: fadeAnim },
                        toast.type === 'error' ? styles.error : toast.type === 'success' ? styles.success : styles.info,
                    ]}
                >
                    <Text style={styles.toastText}>{toast.message}</Text>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        bottom: 50,
        left: 20,
        right: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    success: {
        backgroundColor: '#4CAF50',
    },
    error: {
        backgroundColor: '#F44336',
    },
    info: {
        backgroundColor: '#2196F3',
    },
    toastText: {
        color: '#fff',
        fontSize: 16,
    },
});

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
