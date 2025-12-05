import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function SettingsLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#ffffff',
                },
                headerShadowVisible: false,
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: '#111827',
                },
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="security" options={{ title: 'Security' }} />
            <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
        </Stack>
    );
}
