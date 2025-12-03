import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react-native';
import { PieChart } from 'react-native-gifted-charts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Stack } from 'expo-router';

export default function DailyAnalysis() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netResult: 0,
        transactions: []
    });
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);

    useEffect(() => {
        fetchDailyData();
    }, [selectedDate]);

    const fetchDailyData = async () => {
        setLoading(true);
        try {
            const start = startOfDay(selectedDate);
            const end = endOfDay(selectedDate);

            const queryParams = new URLSearchParams({
                startDate: start.toISOString(),
                endDate: end.toISOString()
            }).toString();

            const { data } = await api.get(`/reports/summary?${queryParams}`);
            setSummary(data);

            // Calculate breakdown
            const expenses = data.transactions.filter((t: any) => t.type === 'expense');
            const breakdown: any = {};
            expenses.forEach((t: any) => {
                breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
            });

            const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];
            const breakdownData = Object.keys(breakdown).map((cat, index) => ({
                value: breakdown[cat],
                color: colors[index % colors.length],
                text: `${Math.round((breakdown[cat] / data.totalExpense) * 100)}%`,
                label: cat
            }));
            setCategoryBreakdown(breakdownData as any);

        } catch (error) {
            console.error('Error fetching daily data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ title: 'Daily Analysis', headerShadowVisible: false, headerStyle: { backgroundColor: '#F9FAFB' } }} />

            <View className="px-4 py-2">
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center bg-white p-3 rounded-xl border border-gray-200 self-start"
                >
                    <Calendar size={20} color="#6B7280" />
                    <Text className="ml-2 font-medium text-gray-700">{format(selectedDate, 'MMMM dd, yyyy')}</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    onChange={(e, date) => {
                        setShowDatePicker(false);
                        if (date) setSelectedDate(date);
                    }}
                />
            )}

            <ScrollView className="flex-1 p-4">
                {/* Summary Cards */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-xs mb-1">Spent</Text>
                        <Text className="text-lg font-bold text-red-600">₹{summary.totalExpense.toLocaleString()}</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-xs mb-1">Income</Text>
                        <Text className="text-lg font-bold text-green-600">₹{summary.totalIncome.toLocaleString()}</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-xs mb-1">Net</Text>
                        <Text className={`text-lg font-bold ${summary.netResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ₹{summary.netResult.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Chart */}
                {categoryBreakdown.length > 0 ? (
                    <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 items-center">
                        <Text className="text-lg font-bold mb-4 self-start">Expense Breakdown</Text>
                        <PieChart
                            data={categoryBreakdown}
                            donut
                            showText
                            textColor="black"
                            radius={100}
                            textSize={10}
                            showValuesAsLabels={false}
                            labelsPosition="outward"
                        />
                        <View className="flex-row flex-wrap gap-2 mt-4 justify-center">
                            {categoryBreakdown.map((item: any, index) => (
                                <View key={index} className="flex-row items-center mr-2">
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 4 }} />
                                    <Text className="text-xs text-gray-600">{item.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6 items-center">
                        <Text className="text-gray-400">No expenses recorded for this day</Text>
                    </View>
                )}

                {/* Transactions */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Transactions</Text>
                {summary.transactions.length > 0 ? (
                    summary.transactions.map((t: any) => (
                        <View key={t._id} className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm border border-gray-100">
                            <View className="flex-row items-center flex-1">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {t.type === 'income' ? (
                                        <ArrowDownRight color={t.type === 'income' ? '#16A34A' : '#DC2626'} size={20} />
                                    ) : (
                                        <ArrowUpRight color={t.type === 'income' ? '#16A34A' : '#DC2626'} size={20} />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-900">{t.category}</Text>
                                    <Text className="text-gray-500 text-xs">
                                        {format(new Date(t.date), 'hh:mm a')} • {t.description || t.paymentMethod}
                                    </Text>
                                </View>
                            </View>
                            <Text className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text className="text-center text-gray-500 py-4">No transactions found</Text>
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
