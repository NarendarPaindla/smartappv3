import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            showToast('Login successful!', 'success');
            router.replace('/(tabs)/dashboard');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
                <View className="items-center mb-8">
                    <Text className="text-3xl font-bold text-blue-600">SmartSpend</Text>
                    <Text className="text-gray-500 mt-2">Welcome back!</Text>
                </View>

                <View className="space-y-4">
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity className="items-end mb-4">
                        <Text className="text-blue-600">Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button title="Login" onPress={handleLogin} loading={loading} />

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-gray-600">Don't have an account? </Text>
                        <Link href="/(auth)/signup" asChild>
                            <TouchableOpacity>
                                <Text className="text-blue-600 font-semibold">Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
