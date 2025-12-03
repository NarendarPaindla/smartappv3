import { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { format } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const router = useRouter();

    const fetchData = async () => {
        try {
            // Fetch summary for current month
            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            // Assuming backend has endpoints for these, adapting from web logic
            // If specific dashboard endpoint exists, use it. Otherwise calculate.
            // Web uses /transactions/all or similar.
            // Let's assume we need to fetch transactions and calculate or use a summary endpoint if available.
            // Based on web analysis, there might be a dashboard stats endpoint or we filter transactions.
            // Let's try fetching monthly overview data which usually has totals.

            const { data: overviewData } = await api.get(`/summary/monthly?month=${month}&year=${year}`);
            setSummary({
                totalIncome: overviewData.totalIncome || 0,
                totalExpense: overviewData.totalExpense || 0,
                balance: (overviewData.totalIncome || 0) - (overviewData.totalExpense || 0),
            });

            const { data } = await api.get('/transactions?limit=5');
            setRecentTransactions(data.transactions || []);
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

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
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

                {/* Summary Cards */}
                <View className="flex-row justify-between mb-6">
                    <View className="bg-blue-600 p-4 rounded-xl flex-1 mr-2">
                        <View className="flex-row items-center mb-2">
                            <Wallet color="white" size={20} />
                            <Text className="text-blue-100 ml-2">Balance</Text>
                        </View>
                        <Text className="text-white text-xl font-bold">₹{summary.balance.toLocaleString()}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between mb-8">
                    <View className="bg-white p-4 rounded-xl flex-1 mr-2 shadow-sm border border-gray-100">
                        <View className="flex-row items-center mb-2">
                            <View className="bg-green-100 p-1.5 rounded-full mr-2">
                                <ArrowDownRight color="#16A34A" size={16} />
                            </View>
                            <Text className="text-gray-500">Income</Text>
                        </View>
                        <Text className="text-gray-900 text-lg font-bold">₹{summary.totalIncome.toLocaleString()}</Text>
                    </View>

                    <View className="bg-white p-4 rounded-xl flex-1 ml-2 shadow-sm border border-gray-100">
                        <View className="flex-row items-center mb-2">
                            <View className="bg-red-100 p-1.5 rounded-full mr-2">
                                <ArrowUpRight color="#DC2626" size={16} />
                            </View>
                            <Text className="text-gray-500">Expense</Text>
                        </View>
                        <Text className="text-gray-900 text-lg font-bold">₹{summary.totalExpense.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</Text>
                    {recentTransactions.length === 0 ? (
                        <Text className="text-gray-500 text-center py-8">No recent transactions</Text>
                    ) : (
                        recentTransactions.map((tx: any) => (
                            <View key={tx._id} className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm border border-gray-100">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {tx.type === 'income' ? (
                                            <ArrowDownRight color={tx.type === 'income' ? '#16A34A' : '#DC2626'} size={20} />
                                        ) : (
                                            <ArrowUpRight color={tx.type === 'income' ? '#16A34A' : '#DC2626'} size={20} />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-gray-900">{tx.description || tx.category}</Text>
                                        <Text className="text-gray-500 text-xs">{format(new Date(tx.date), 'MMM dd, yyyy')}</Text>
                                    </View>
                                </View>
                                <Text className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
