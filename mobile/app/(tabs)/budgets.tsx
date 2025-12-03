import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save, Trash2, ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react-native';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { format, addMonths, subMonths } from 'date-fns';
import { clsx } from 'clsx';

export default function Budgets() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    interface BudgetState {
        overallBudgetAmount: number;
        perCategoryBudgets: { category: string; amount: number }[];
    }

    const [budget, setBudget] = useState<BudgetState>({
        overallBudgetAmount: 0,
        perCategoryBudgets: [],
    });
    const [actualSpending, setActualSpending] = useState<{ total: number; categories: Record<string, number> }>({ total: 0, categories: {} });

    const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Salary', 'Others'];
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();

            // Fetch Budget
            const { data: budgetData } = await api.get(`/budgets?month=${month}&year=${year}`);
            let currentBudget = { overallBudgetAmount: 0, perCategoryBudgets: [] };

            if (budgetData) {
                const totalBudget = budgetData.perCategoryBudgets.reduce((acc: number, curr: any) => acc + curr.amount, 0);
                currentBudget = { ...budgetData, overallBudgetAmount: totalBudget };
                setBudget(currentBudget);
            } else {
                setBudget(currentBudget);
            }

            // Merge categories
            const budgetCategories = currentBudget.perCategoryBudgets.map((b: any) => b.category);
            const uniqueCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...budgetCategories]));
            setCategories(uniqueCategories);

            // Fetch Spending
            const { data: summaryData } = await api.get(`/summary/monthly?month=${month}&year=${year}`);
            const categoryMap: any = {};
            summaryData.categoryBreakdown.forEach((item: any) => {
                categoryMap[item.name] = item.value;
            });

            setActualSpending({
                total: summaryData.totalExpense,
                categories: categoryMap,
            });

        } catch (error) {
            console.error('Error fetching budget data:', error);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            await api.post('/budgets', {
                month,
                year,
                overallBudgetAmount: budget.overallBudgetAmount,
                perCategoryBudgets: budget.perCategoryBudgets,
            });
            showToast('Budget saved!', 'success');
            fetchData();
        } catch (error) {
            showToast('Failed to save budget', 'error');
        }
    };

    const updateCategoryBudget = (category: string, amount: string) => {
        const numAmount = parseFloat(amount) || 0;
        const existing = budget.perCategoryBudgets.find((b: any) => b.category === category);
        let newBudgets: any[] = [...budget.perCategoryBudgets];

        if (existing) {
            newBudgets = newBudgets.map((b: any) => b.category === category ? { ...b, amount: numAmount } : b);
        } else {
            newBudgets.push({ category, amount: numAmount });
        }

        const totalBudget = newBudgets.reduce((acc, curr) => acc + curr.amount, 0);

        setBudget({
            ...budget,
            perCategoryBudgets: newBudgets,
            overallBudgetAmount: totalBudget
        });
    };

    const deleteCategoryBudget = (category: string) => {
        Alert.alert('Delete Budget', `Remove budget for ${category}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const newBudgets = budget.perCategoryBudgets.filter((b: any) => b.category !== category);
                    if (!DEFAULT_CATEGORIES.includes(category)) {
                        setCategories(categories.filter(c => c !== category));
                    }
                    const totalBudget = newBudgets.reduce((acc, curr) => acc + curr.amount, 0);

                    const updatedBudget = { ...budget, perCategoryBudgets: newBudgets, overallBudgetAmount: totalBudget };
                    setBudget(updatedBudget);

                    // Auto-save
                    try {
                        const month = selectedDate.getMonth() + 1;
                        const year = selectedDate.getFullYear();
                        await api.post('/budgets', {
                            month,
                            year,
                            overallBudgetAmount: updatedBudget.overallBudgetAmount,
                            perCategoryBudgets: updatedBudget.perCategoryBudgets,
                        });
                        showToast('Budget deleted', 'success');
                    } catch (error) {
                        showToast('Failed to save changes', 'error');
                    }
                }
            }
        ]);
    };

    const addCustomCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
        }
    };

    const getCategoryBudgetAmount = (category: string) => {
        return budget.perCategoryBudgets.find((b: any) => b.category === category)?.amount || 0;
    };

    const getProgressColor = (spent: number, limit: number) => {
        if (limit === 0) return 'bg-gray-200';
        const percentage = (spent / limit) * 100;
        if (percentage > 100) return 'bg-red-500';
        if (percentage > 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-900">Budgets</Text>
                <View className="flex-row items-center gap-4">
                    <TouchableOpacity onPress={() => setSelectedDate(subMonths(selectedDate, 1))}>
                        <ChevronLeft size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-lg font-medium text-gray-700">{format(selectedDate, 'MMMM yyyy')}</Text>
                    <TouchableOpacity onPress={() => setSelectedDate(addMonths(selectedDate, 1))}>
                        <ChevronRight size={24} color="#374151" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Overall Budget Card */}
                <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">Overall Budget</Text>
                        <Text className="text-gray-500 font-medium">Limit: ₹{budget.overallBudgetAmount.toLocaleString()}</Text>
                    </View>

                    <View className="flex-row justify-between mb-2">
                        <Text className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">PROGRESS</Text>
                        <Text className="text-xs font-bold text-blue-600">₹{actualSpending.total.toLocaleString()} / {budget.overallBudgetAmount.toLocaleString()}</Text>
                    </View>

                    <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <View
                            className={`h-full rounded-full ${getProgressColor(actualSpending.total, budget.overallBudgetAmount)}`}
                            style={{ width: `${Math.min((actualSpending.total / (budget.overallBudgetAmount || 1)) * 100, 100)}%` }}
                        />
                    </View>

                    {actualSpending.total > budget.overallBudgetAmount && budget.overallBudgetAmount > 0 && (
                        <View className="flex-row items-center gap-1">
                            <AlertCircle size={14} color="#EF4444" />
                            <Text className="text-xs text-red-500 font-medium">Over budget!</Text>
                        </View>
                    )}
                </View>

                {/* Add Category */}
                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex-row gap-2">
                    <TextInput
                        placeholder="New Category Name"
                        value={newCategory}
                        onChangeText={setNewCategory}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2"
                    />
                    <TouchableOpacity onPress={addCustomCategory} className="bg-gray-800 px-4 py-2 rounded-lg justify-center">
                        <Text className="text-white font-medium">Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Categories Grid */}
                <View className="gap-4 pb-24">
                    {categories.map((category) => {
                        const limit = getCategoryBudgetAmount(category);
                        const spent = actualSpending.categories[category] || 0;
                        const percentage = Math.round((spent / (limit || 1)) * 100);

                        return (
                            <View key={category} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="font-bold text-gray-800 text-lg">{category}</Text>
                                    <View className="flex-row items-center gap-2">
                                        <TextInput
                                            placeholder="0"
                                            value={limit ? limit.toString() : ''}
                                            onChangeText={(t) => updateCategoryBudget(category, t)}
                                            keyboardType="numeric"
                                            className="w-20 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-right"
                                        />
                                        <TouchableOpacity onPress={() => deleteCategoryBudget(category)} className="p-2 bg-red-50 rounded-lg">
                                            <Trash2 size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-xs text-gray-500 font-medium">₹{spent.toLocaleString()} spent</Text>
                                    <Text className="text-xs text-gray-500 font-medium">{percentage}%</Text>
                                </View>

                                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <View
                                        className={`h-full rounded-full ${getProgressColor(spent, limit)}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <View className="absolute bottom-6 right-6">
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-600 flex-row items-center gap-2 px-6 py-3 rounded-full shadow-lg shadow-blue-600/30"
                >
                    <Save size={20} color="white" />
                    <Text className="text-white font-bold">Save Budgets</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
