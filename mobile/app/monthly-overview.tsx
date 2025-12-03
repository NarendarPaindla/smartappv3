import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LineChart, PieChart, BarChart } from 'react-native-gifted-charts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format, addMonths, subMonths } from 'date-fns';
import { Stack } from 'expo-router';

export default function MonthlyOverview() {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        fetchSummary();
    }, [selectedDate]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            const { data } = await api.get(`/summary/monthly?month=${month}&year=${year}`);
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
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

    const barData = summary?.paymentMethodBreakdown?.map((item: any) => ({
        value: item.value,
        label: item.name,
        frontColor: '#10B981'
    })) || [];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ title: 'Monthly Overview', headerShadowVisible: false, headerStyle: { backgroundColor: '#F9FAFB' } }} />

            <View className="px-4 py-2 flex-row justify-between items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => setSelectedDate(subMonths(selectedDate, 1))}>
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">{format(selectedDate, 'MMMM yyyy')}</Text>
                <TouchableOpacity onPress={() => setSelectedDate(addMonths(selectedDate, 1))}>
                    <ChevronRight size={24} color="#374151" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <ScrollView className="flex-1 p-4">
                    {/* Stats Grid */}
                    <View className="flex-row gap-3 mb-6">
                        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                            <Text className="text-gray-500 text-xs mb-1">Income</Text>
                            <Text className="text-lg font-bold text-green-600">₹{summary?.totalIncome?.toLocaleString()}</Text>
                        </View>
                        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                            <Text className="text-gray-500 text-xs mb-1">Expense</Text>
                            <Text className="text-lg font-bold text-red-600">₹{summary?.totalExpense?.toLocaleString()}</Text>
                        </View>
                        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                            <Text className="text-gray-500 text-xs mb-1">Savings</Text>
                            <Text className={`text-lg font-bold ${summary?.netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                ₹{summary?.netSavings?.toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    {/* Daily Trend */}
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Daily Expense Trend</Text>
                        {lineData.length > 0 ? (
                            <LineChart
                                data={lineData}
                                height={200}
                                width={300}
                                spacing={40}
                                initialSpacing={20}
                                color="#4F46E5"
                                thickness={2}
                                startFillColor="rgba(79, 70, 229, 0.3)"
                                endFillColor="rgba(79, 70, 229, 0.01)"
                                startOpacity={0.9}
                                endOpacity={0.2}
                                areaChart
                                hideDataPoints={false}
                                dataPointsColor="#4F46E5"
                                xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
                                yAxisTextStyle={{ color: '#6B7280', fontSize: 10 }}
                            />
                        ) : (
                            <Text className="text-center text-gray-400 py-8">No data available</Text>
                        )}
                    </View>

                    {/* Category Breakdown */}
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Expenses by Category</Text>
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

                    {/* Payment Methods */}
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Payment Methods</Text>
                        {barData.length > 0 ? (
                            <BarChart
                                data={barData}
                                width={300}
                                height={200}
                                barWidth={30}
                                spacing={20}
                                roundedTop
                                xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
                                yAxisTextStyle={{ color: '#6B7280', fontSize: 10 }}
                                frontColor="#10B981"
                            />
                        ) : (
                            <Text className="text-center text-gray-400 py-8">No data available</Text>
                        )}
                    </View>
                    <View className="h-10" />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
