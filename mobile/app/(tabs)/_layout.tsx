import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { LayoutDashboard, Plus, BarChart3, Settings, Wallet, PieChart } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarShowLabel: true,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 0,
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    marginTop: -4,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="loans"
                options={{
                    title: 'Loans',
                    tabBarIcon: ({ color, size }) => <Wallet color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="daily-entry"
                options={{
                    title: '',
                    tabBarIcon: ({ focused }) => (
                        <View className="bg-blue-600 w-14 h-14 rounded-full items-center justify-center -mt-8 shadow-lg shadow-blue-600/50 border-4 border-gray-50">
                            <Plus color="white" size={30} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="budgets"
                options={{
                    title: 'Budgets',
                    tabBarIcon: ({ color, size }) => <PieChart color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => <Settings color={color} size={24} />,
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}
