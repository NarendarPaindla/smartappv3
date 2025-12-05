import "../global.css";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Configure Reanimated Logger to be less strict
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false, // Disable strict mode
});

// Ignore specific warnings
LogBox.ignoreLogs([
    'SafeAreaView has been deprecated',
    '[Reanimated] Reading from `value` during component render',
    '[Reanimated] Writing to `value` during component render',
]);

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ToastProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </ToastProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
