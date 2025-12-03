import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';

export default function Reports() {
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch category-wise expense data
            // Adapting from web: /transactions/analysis or similar
            // Fetch overall summary which contains category breakdown
            const { data } = await api.get('/summary/overall');

            // Transform data for PieChart
            // Backend returns { categoryBreakdown: [{ name: 'Food', value: 500 }, ...] }

            const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];

            const formattedData = (data.categoryBreakdown || []).map((item: any, index: number) => ({
                value: item.value,
                color: colors[index % colors.length],
                text: `${data.totalExpense ? Math.round((item.value / data.totalExpense) * 100) : 0}%`,
                label: item.name,
            }));

            setChartData(formattedData);
        } catch (error) {
            console.error('Error fetching reports:', error);
            // showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text className="text-2xl font-bold text-gray-900 mb-6">Expense Analysis</Text>

                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
                    {chartData.length > 0 ? (
                        <PieChart
                            data={chartData}
                            donut
                            showText
                            textColor="black"
                            radius={120}
                            textSize={12}
                            focusOnPress
                            showValuesAsLabels
                            showTextBackground
                            textBackgroundRadius={20}
                        />
                    ) : (
                        <Text className="text-gray-500 py-8">No data available</Text>
                    )}
                </View>

                <View className="mt-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</Text>
                    {chartData.map((item, index) => (
                        <View key={index} className="flex-row items-center justify-between bg-white p-4 rounded-lg mb-2 border border-gray-100">
                            <View className="flex-row items-center">
                                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: 8 }} />
                                <Text className="text-gray-700 font-medium">{item.label}</Text>
                            </View>
                            <Text className="text-gray-900 font-bold">₹{item.value.toLocaleString()}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
