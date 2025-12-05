import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Filter, Calendar, ChevronDown, X, Search, ArrowUp, ArrowDown, CreditCard, ShoppingBag, Utensils, Plane, Car, Home, Smartphone, HeartPulse, MoreHorizontal } from 'lucide-react-native';
import { formatCurrency } from '../../utils/currency';
import { useAuth } from '../../context/AuthContext';

const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('food') || lowerName.includes('dining') || lowerName.includes('eat')) return <Utensils size={20} color="#F59E0B" />;
    if (lowerName.includes('shop') || lowerName.includes('buy')) return <ShoppingBag size={20} color="#EC4899" />;
    if (lowerName.includes('travel') || lowerName.includes('trip') || lowerName.includes('flight')) return <Plane size={20} color="#3B82F6" />;
    if (lowerName.includes('car') || lowerName.includes('transport') || lowerName.includes('fuel')) return <Car size={20} color="#6366F1" />;
    if (lowerName.includes('home') || lowerName.includes('rent') || lowerName.includes('bill')) return <Home size={20} color="#10B981" />;
    if (lowerName.includes('phone') || lowerName.includes('internet')) return <Smartphone size={20} color="#8B5CF6" />;
    if (lowerName.includes('health') || lowerName.includes('doctor')) return <HeartPulse size={20} color="#EF4444" />;
    return <MoreHorizontal size={20} color="#6B7280" />;
};

export default function Reports() {
    const { user } = useAuth();
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
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 4;

    // Filter "All Time" flag
    const [isAllTime, setIsAllTime] = useState(true);

    // UI State
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    // Debounce search & filters
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1); // Reset to page 1 on filter change
            fetchReport();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [startDate, endDate, type, category, searchQuery, isAllTime]);

    // Fetch on page change (skip debounce for pagination)
    useEffect(() => {
        fetchReport();
    }, [currentPage]);

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
            console.log('[Reports] Fetching report with filters:', { startDate, endDate, type, category, searchQuery, isAllTime, currentPage });

            // Base Params
            const params: any = {
                type,
                category,
                search: searchQuery
            };

            if (!isAllTime) {
                params.startDate = startDate.toISOString().split('T')[0];
                params.endDate = endDate.toISOString().split('T')[0];
            }

            const queryParams = new URLSearchParams(params).toString();

            // Fetch Summary Data (Always aggregate over ALL matching data, ignoring pagination logic for totals)
            const { data: summary } = await api.get(`/reports/summary?${queryParams}`);
            setSummaryData(summary);

            // Fetch Transactions List (Paginated)
            params.page = currentPage.toString();
            params.limit = ITEMS_PER_PAGE.toString();
            const listQueryParams = new URLSearchParams(params).toString();

            console.log('[Reports] Fetching transactions list...');
            const { data: txData } = await api.get(`/transactions?${listQueryParams}`);

            setTransactions(txData.transactions);
            setTotalPages(txData.totalPages || 1);

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
        setSearchQuery('');
        setIsAllTime(true);
    };

    const toggleAllTime = () => {
        setIsAllTime(!isAllTime);
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-bold text-gray-900">Reports</Text>
                    <TouchableOpacity
                        onPress={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
                    >
                        <Filter size={20} color={showFilters ? "#2563EB" : "#374151"} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-gray-900 text-base"
                        placeholder="Search transactions..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filters Section */}
                {showFilters && (
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">

                        {/* Date Range or All Time */}
                        <View className="mb-4">
                            <TouchableOpacity
                                onPress={toggleAllTime}
                                className={`flex-row items-center justify-center p-3 rounded-lg border mb-4 ${isAllTime ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                            >
                                <Calendar size={18} color={isAllTime ? "white" : "#4B5563"} />
                                <Text className={`font-semibold ml-2 ${isAllTime ? 'text-white' : 'text-gray-700'}`}>Show All Time</Text>
                            </TouchableOpacity>

                            {!isAllTime && (
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
                            )}
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
                                    <Text className="text-lg font-bold text-green-600">{formatCurrency(summaryData.totalIncome || 0, user?.currency)}</Text>
                                </View>
                                <View className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                    <Text className="text-xs text-gray-500 mb-1">Expense</Text>
                                    <Text className="text-lg font-bold text-red-600">{formatCurrency(summaryData.totalExpense || 0, user?.currency)}</Text>
                                </View>
                                <View className="flex-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                    <Text className="text-xs text-gray-500 mb-1">Net</Text>
                                    <Text className={`text-lg font-bold ${summaryData.netResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatCurrency(summaryData.netResult || 0, user?.currency)}
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
                                    <>
                                        {transactions.map((t, index) => (
                                            <View key={t._id} className={`p-4 ${index !== transactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                <View className="flex-row justify-between items-start mb-2">
                                                    <View className="flex-row items-center gap-3">
                                                        <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
                                                            {getCategoryIcon(t.category)}
                                                        </View>
                                                        <View>
                                                            <View className="flex-row items-center">
                                                                <Text className="font-bold text-gray-900 text-sm mr-2">{t.category}</Text>
                                                                <View className={`px-2 py-0.5 rounded-full ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                                    <Text className={`text-[10px] font-bold ${t.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                                                                        {t.type === 'income' ? 'IN' : 'OUT'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <Text className="text-xs text-gray-500 mt-0.5">{format(new Date(t.date), 'MMM dd, yyyy')}</Text>
                                                        </View>
                                                    </View>
                                                    <Text className={`font-bold text-base ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount || 0, user?.currency)}
                                                    </Text>
                                                </View>

                                                <View className="flex-row justify-between items-center pl-14">
                                                    <Text className="text-gray-500 text-xs flex-1 mr-4" numberOfLines={1}>
                                                        {t.description || 'No description'}
                                                    </Text>
                                                    <View className="flex-row items-center gap-1">
                                                        <CreditCard size={10} color="#9CA3AF" />
                                                        <Text className="text-xs text-gray-400">{t.paymentMethod}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        ))}

                                        {/* Pagination Controls */}
                                        <View className="flex-row justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
                                            <TouchableOpacity
                                                onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={`px-4 py-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 bg-gray-100' : 'border-gray-300 bg-white'}`}
                                            >
                                                <Text className={`${currentPage === 1 ? 'text-gray-400' : 'text-gray-700'} font-medium`}>Previous</Text>
                                            </TouchableOpacity>

                                            <Text className="text-gray-600 font-medium">Page {currentPage} of {totalPages}</Text>

                                            <TouchableOpacity
                                                onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 bg-gray-100' : 'border-gray-300 bg-white'}`}
                                            >
                                                <Text className={`${currentPage === totalPages ? 'text-gray-400' : 'text-gray-700'} font-medium`}>Next</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
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
