import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Wallet, Calendar, PieChart as PieIcon, Calculator, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LineChart, PieChart } from 'react-native-gifted-charts';
import { formatCurrency } from '../../utils/currency';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [overallExpense, setOverallExpense] = useState(0);
    const router = useRouter();

    const fetchData = async () => {
        try {
            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            // Monthly Summary
            const { data: overviewData } = await api.get(`/summary/monthly?month=${month}&year=${year}`);
            setSummary(overviewData);

            // Recent Transactions
            const { data: txData } = await api.get('/transactions?limit=5');
            setRecentTransactions(txData.transactions || []);

            // Overall Expense (All Time)
            const { data: overallData } = await api.get('/summary/overall');
            setOverallExpense(overallData.totalExpense || 0);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const lineData = summary?.dailySpending?.map((item: any) => ({
        value: item.amount,
        label: item.day.toString(),
        dataPointText: item.amount.toString(),
    })) || [];

    const pieData = summary?.categoryBreakdown?.map((item: any, index: number) => ({
        value: item.value,
        text: `${Math.round((item.value / summary.totalExpense) * 100)}%`,
        color: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'][index % 5],
        label: item.name
    })) || [];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-gray-500 text-sm">Welcome back,</Text>
                        <Text className="text-2xl font-bold text-gray-900">{user?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                            <Text className="text-blue-600 font-bold text-lg">{user?.name?.[0]}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View className="bg-blue-600 p-5 rounded-2xl mb-6 shadow-lg shadow-blue-600/30">
                    <View className="flex-row items-center mb-2 opacity-80">
                        <Wallet color="white" size={20} />
                        <Text className="text-white ml-2 font-medium">Total Balance</Text>
                    </View>
                    <Text className="text-white text-3xl font-bold mb-4">{formatCurrency(summary?.netSavings || 0, user?.currency)}</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-row items-center bg-blue-500/30 px-3 py-1.5 rounded-lg">
                            <ArrowDownRight color="#4ADE80" size={16} />
                            <Text className="text-white ml-1 text-sm">Inc: {formatCurrency(summary?.totalIncome || 0, user?.currency)}</Text>
                        </View>
                        <View className="flex-row items-center bg-blue-500/30 px-3 py-1.5 rounded-lg">
                            <ArrowUpRight color="#F87171" size={16} />
                            <Text className="text-white ml-1 text-sm">Exp: {formatCurrency(summary?.totalExpense || 0, user?.currency)}</Text>
                        </View>
                    </View>
                </View>

                {/* Feature Grid */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Features</Text>
                <View className="flex-row flex-wrap justify-between mb-6">
                    <FeatureButton icon={Calendar} label="Monthly" onPress={() => router.push('/monthly-overview')} color="bg-purple-100" iconColor="#9333EA" />
                    <FeatureButton icon={BarChart3} label="Reports" onPress={() => router.push('/(tabs)/reports')} color="bg-orange-100" iconColor="#EA580C" />
                    <FeatureButton icon={PieIcon} label="Daily" onPress={() => router.push('/daily-analysis')} color="bg-green-100" iconColor="#16A34A" />
                    <FeatureButton icon={Calculator} label="Tools" onPress={() => router.push('/calculators')} color="bg-blue-100" iconColor="#2563EB" />
                </View>

                {/* Trends Chart */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">Spending Trend</Text>
                        <TrendingUp size={20} color="#4F46E5" />
                    </View>
                    {lineData.length > 0 ? (
                        <LineChart
                            data={lineData}
                            height={180}
                            width={300}
                            spacing={40}
                            initialSpacing={10}
                            color="#4F46E5"
                            thickness={2}
                            hideDataPoints={false}
                            dataPointsColor="#4F46E5"
                            startFillColor="rgba(79, 70, 229, 0.3)"
                            endFillColor="rgba(79, 70, 229, 0.01)"
                            startOpacity={0.9}
                            endOpacity={0.2}
                            areaChart
                            yAxisTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                            xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
                        />
                    ) : (
                        <Text className="text-center text-gray-400 py-8">No data available</Text>
                    )}
                </View>

                {/* Expense by Category */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Expense by Category</Text>
                    {pieData.length > 0 ? (
                        <View className="items-center">
                            <PieChart
                                data={pieData}
                                donut
                                showText
                                textColor="black"
                                radius={100}
                                textSize={10}
                                showValuesAsLabels={false}
                            />
                            <View className="flex-row flex-wrap gap-2 mt-4 justify-center">
                                {pieData.map((item: any, index: number) => (
                                    <View key={index} className="flex-row items-center mr-2">
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 4 }} />
                                        <Text className="text-xs text-gray-600">{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <Text className="text-center text-gray-400 py-8">No data available</Text>
                    )}
                </View>

                {/* Insights */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Insights</Text>
                    <View className="flex-row items-start gap-3">
                        <View className="bg-yellow-100 p-2 rounded-full">
                            <AlertTriangle size={20} color="#CA8A04" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-medium text-gray-900">Highest Spending</Text>
                            <Text className="text-gray-600 mt-1">
                                You spent most on <Text className="font-bold text-gray-900">{summary?.highestCategory?.name || 'N/A'}</Text> ({formatCurrency(summary?.highestCategory?.value || 0, user?.currency)}) this month.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Overall Stats */}
                <View className="bg-gray-900 p-5 rounded-2xl shadow-sm mb-6">
                    <Text className="text-gray-400 text-sm mb-1">Total Expense (All Time)</Text>
                    <Text className="text-white text-2xl font-bold">{formatCurrency(overallExpense, user?.currency)}</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function FeatureButton({ icon: Icon, label, onPress, color, iconColor }: any) {
    return (
        <TouchableOpacity onPress={onPress} className="w-[23%] items-center mb-2">
            <View className={`w-14 h-14 ${color} rounded-2xl items-center justify-center mb-2 shadow-sm`}>
                <Icon size={24} color={iconColor} />
            </View>
            <Text className="text-xs font-medium text-gray-700 text-center" numberOfLines={1}>{label}</Text>
        </TouchableOpacity>
    );
}
