import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Filter, Calendar, ChevronDown, X, Search, ArrowUp, ArrowDown, CreditCard } from 'lucide-react-native';
import { clsx } from 'clsx';

export default function Reports() {
    const insets = useSafeAreaInsets();
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Data State
    const [summaryData, setSummaryData] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Filter State
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)); // Start of current month
    const [endDate, setEndDate] = useState(new Date());
    const [type, setType] = useState('');
    const [category, setCategory] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // UI State
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate, type, category]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            console.log('[Reports] Fetching report with filters:', { startDate, endDate, type, category });
            const queryParams = new URLSearchParams({
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                type,
                category,
                limit: '50' // Fetch more for the list
            }).toString();

            // Fetch Summary Data
            const { data: summary } = await api.get(`/reports/summary?${queryParams}`);
            setSummaryData(summary);

            // Fetch Transactions
            console.log('[Reports] Fetching transactions...');
            const { data: txData } = await api.get(`/transactions?${queryParams}`);
            console.log('[Reports] Transactions received:', txData.transactions?.length);
            setTransactions(txData.transactions);

            // Prepare Chart Data
            const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];
            const formattedChartData = (summary.categoryBreakdown || []).map((item: any, index: number) => ({
                value: item.value,
                color: colors[index % colors.length],
                text: `${summary.totalExpense ? Math.round((item.value / summary.totalExpense) * 100) : 0}%`,
                label: item.name,
            }));
            setChartData(formattedChartData);

        } catch (error) {
            console.error('Error fetching report:', error);
            showToast('Failed to load report data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setStartDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setEndDate(new Date());
        setType('');
        setCategory('');
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-gray-900">Reports</Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                    >
                        <Filter size={20} color={showFilters ? "#2563EB" : "#374151"} />
                    </TouchableOpacity>
                </View>

                {/* Filters Section */}
                {showFilters && (
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-500 mb-1">Start Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowStartDatePicker(true)}
                                    className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                                >
                                    <Calendar size={16} color="#6B7280" className="mr-2" />
                                    <Text className="text-sm text-gray-900">{format(startDate, 'MMM dd, yyyy')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-500 mb-1">End Date</Text>
                                <TouchableOpacity
                                    onPress={() => setShowEndDatePicker(true)}
                                    className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                                >
                                    <Calendar size={16} color="#6B7280" className="mr-2" />
                                    <Text className="text-sm text-gray-900">{format(endDate, 'MMM dd, yyyy')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-500 mb-1">Type</Text>
                                <View className="flex-row bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <TouchableOpacity
                                        onPress={() => setType('')}
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            paddingVertical: 6,
                                            borderRadius: 6,
                                            backgroundColor: !type ? '#FFFFFF' : 'transparent',
                                            shadowOpacity: !type ? 0.1 : 0,
                                            shadowRadius: 2,
                                            elevation: !type ? 1 : 0,
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: '500', color: !type ? '#111827' : '#6B7280' }}>All</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setType('income')}
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            paddingVertical: 6,
                                            borderRadius: 6,
                                            backgroundColor: type === 'income' ? '#FFFFFF' : 'transparent',
                                            shadowOpacity: type === 'income' ? 0.1 : 0,
                                            shadowRadius: 2,
                                            elevation: type === 'income' ? 1 : 0,
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: '500', color: type === 'income' ? '#16A34A' : '#6B7280' }}>Inc</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setType('expense')}
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            paddingVertical: 6,
                                            borderRadius: 6,
                                            backgroundColor: type === 'expense' ? '#FFFFFF' : 'transparent',
                                            shadowOpacity: type === 'expense' ? 0.1 : 0,
                                            shadowRadius: 2,
                                            elevation: type === 'expense' ? 1 : 0,
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, fontWeight: '500', color: type === 'expense' ? '#DC2626' : '#6B7280' }}>Exp</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-medium text-gray-500 mb-1">Category</Text>
                                <TouchableOpacity
                                    onPress={() => setShowCategoryModal(true)}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2.5"
                                >
                                    <Text className="text-sm text-gray-900" numberOfLines={1}>
                                        {category || 'All Categories'}
                                    </Text>
                                    <ChevronDown size={16} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity onPress={resetFilters} className="items-center pt-2">
                            <Text className="text-blue-600 text-sm font-medium">Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" className="py-10" />
                ) : (
                    <>
                        {/* Summary Cards */}
                        {summaryData && (
                            <View className="flex-row gap-3 mb-6">
                                <View className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                    <Text className="text-xs text-gray-500 mb-1">Income</Text>
                                    <Text className="text-lg font-bold text-green-600">₹{summaryData.totalIncome.toLocaleString()}</Text>
                                </View>
                                <View className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                    <Text className="text-xs text-gray-500 mb-1">Expense</Text>
                                    <Text className="text-lg font-bold text-red-600">₹{summaryData.totalExpense.toLocaleString()}</Text>
                                </View>
                                <View className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                    <Text className="text-xs text-gray-500 mb-1">Net</Text>
                                    <Text className={`text-lg font-bold ${summaryData.netResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        ₹{summaryData.netResult.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Chart */}
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center mb-6">
                            {chartData.length > 0 ? (
                                <PieChart
                                    data={chartData}
                                    donut
                                    showText
                                    textColor="black"
                                    radius={100}
                                    textSize={10}
                                    focusOnPress
                                    showValuesAsLabels
                                    showTextBackground
                                    textBackgroundRadius={16}
                                />
                            ) : (
                                <Text className="text-gray-500 py-8">No data for selected period</Text>
                            )}
                        </View>

                        {/* Transaction List */}
                        <View>
                            <Text className="text-lg font-bold text-gray-900 mb-4">Transactions</Text>
                            <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {transactions.length > 0 ? (
                                    transactions.map((t, index) => (
                                        <View key={t._id} className={`p-4 ${index !== transactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                            <View className="flex-row justify-between items-start mb-2">
                                                <View className="flex-row items-center gap-2">
                                                    <View className={`px-2 py-1 rounded-md ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                        <Text className={`text-xs font-bold ${t.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                                            {t.type.toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <Text className="text-xs text-gray-500">{format(new Date(t.date), 'MMM dd, yyyy')}</Text>
                                                </View>
                                                <Text className={`font-bold text-base ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                                </Text>
                                            </View>

                                            <View className="flex-row justify-between items-center">
                                                <View className="flex-1 mr-4">
                                                    <Text className="font-bold text-gray-900 text-sm">{t.category}</Text>
                                                    {t.description ? (
                                                        <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={2}>{t.description}</Text>
                                                    ) : (
                                                        <Text className="text-gray-400 text-xs mt-0.5 italic">No description</Text>
                                                    )}
                                                </View>
                                                <View className="items-end">
                                                    <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                        <CreditCard size={10} color="#6B7280" />
                                                        <Text className="text-xs text-gray-600">{t.paymentMethod}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View className="p-8 items-center">
                                        <Text className="text-gray-500">No transactions found</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Category Modal */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 h-[60%]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-900">Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                                onPress={() => { setCategory(''); setShowCategoryModal(false); }}
                                className={`p-4 border-b border-gray-100 ${category === '' ? 'bg-blue-50' : ''}`}
                            >
                                <Text className={`font-medium ${category === '' ? 'text-blue-600' : 'text-gray-700'}`}>All Categories</Text>
                            </TouchableOpacity>
                            {categories.map(c => (
                                <TouchableOpacity
                                    key={c._id}
                                    onPress={() => { setCategory(c.name); setShowCategoryModal(false); }}
                                    className={`p-4 border-b border-gray-100 ${category === c.name ? 'bg-blue-50' : ''}`}
                                >
                                    <Text className={`font-medium ${category === c.name ? 'text-blue-600' : 'text-gray-700'}`}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Date Pickers */}
            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) setStartDate(selectedDate);
                    }}
                />
            )}
            {showEndDatePicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) setEndDate(selectedDate);
                    }}
                />
            )}
        </View>
    );
}
