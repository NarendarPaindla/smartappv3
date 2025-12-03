import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, Shield, HelpCircle } from 'lucide-react-native';

export default function Settings() {
    const { user, logout } = useAuth();

    const menuItems = [
        { icon: User, label: 'Profile', action: () => { } },
        { icon: Bell, label: 'Notifications', action: () => { } },
        { icon: Shield, label: 'Security', action: () => { } },
        { icon: HelpCircle, label: 'Help & Support', action: () => { } },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text className="text-2xl font-bold text-gray-900 mb-6">Settings</Text>

                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex-row items-center">
                    <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mr-4">
                        <Text className="text-blue-600 font-bold text-2xl">{user?.name?.[0]}</Text>
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-gray-900">{user?.name}</Text>
                        <Text className="text-gray-500">{user?.email}</Text>
                    </View>
                </View>

                <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="flex-row items-center p-4 border-b border-gray-100 active:bg-gray-50"
                            onPress={item.action}
                        >
                            <item.icon size={20} color="#4B5563" />
                            <Text className="ml-3 text-gray-700 font-medium flex-1">{item.label}</Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        className="flex-row items-center p-4 active:bg-red-50"
                        onPress={logout}
                    >
                        <LogOut size={20} color="#DC2626" />
                        <Text className="ml-3 text-red-600 font-medium flex-1">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
