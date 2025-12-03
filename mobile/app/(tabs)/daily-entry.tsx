import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Plus, Trash2, Edit2, ChevronLeft, ChevronRight, X, Calendar, Clock, DollarSign, CreditCard, TrendingUp, TrendingDown } from 'lucide-react-native';

export default function DailyEntry() {
    const { showToast } = useToast();
    const insets = useSafeAreaInsets();

    // Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState(new Date());
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [editingId, setEditingId] = useState<string | null>(null);

    // UI State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Data State
    const [categories, setCategories] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchCategories();
        fetchTransactions(page);
    }, [page]);

    // Clear category when type changes
    useEffect(() => {
        setCategory('');
    }, [type]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    const fetchTransactions = async (pageNum = 1) => {
        try {
            const { data } = await api.get(`/transactions?page=${pageNum}&limit=5`);
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
            setPage(data.page);
        } catch (error) {
            console.error('Error fetching transactions', error);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const { data } = await api.post('/categories', { name: newCategoryName, type });
            setCategories([...categories, data]);
            setCategory(data.name);
            setNewCategoryName('');
            showToast('Category added', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to add category', 'error');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        Alert.alert('Delete Category', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/categories/${id}`);
                        setCategories(categories.filter(c => c._id !== id));
                        if (category === categories.find(c => c._id === id)?.name) {
                            setCategory('');
                        }
                    } catch (error) {
                        console.error('Error deleting category', error);
                    }
                }
            }
        ]);
    };

    const handleSubmit = async () => {
        if (!amount || !category) {
            showToast('Please fill in amount and category', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseFloat(amount),
                description,
                category,
                type,
                date: date.toISOString(),
                paymentMethod
            };

            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload);
                showToast('Transaction updated!', 'success');
                setEditingId(null);
            } else {
                await api.post('/transactions', payload);
                showToast('Transaction added!', 'success');
            }

            // Reset form
            setAmount('');
            setDescription('');
            setCategory('');
            setPaymentMethod('Cash');
            setDate(new Date());
            fetchTransactions(page);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to save transaction', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (t: any) => {
        setAmount(t.amount.toString());
        setDescription(t.description || '');
        setCategory(t.category);
        setType(t.type);
        setDate(new Date(t.date));
        setPaymentMethod(t.paymentMethod || 'Cash');
        setEditingId(t._id);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Transaction', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/transactions/${id}`);
                        showToast('Transaction deleted', 'success');
                        fetchTransactions(page);
                    } catch (error) {
                        showToast('Failed to delete', 'error');
                    }
                }
            }
        ]);
    };

    const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Bank Transfer'];

    // Filter categories based on selected type
    const filteredCategories = categories.filter(c => c.type === type || !c.type);

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <Text className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Transaction' : 'Add Transaction'}</Text>

                {/* Type Selector */}
                <View className="flex-row mb-6 bg-gray-200 p-1 rounded-xl">
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                            backgroundColor: type === 'expense' ? '#FFFFFF' : 'transparent',
                            shadowOpacity: type === 'expense' ? 0.1 : 0,
                            shadowRadius: 2,
                            elevation: type === 'expense' ? 2 : 0,
                        }}
                        onPress={() => setType('expense')}
                    >
                        <TrendingDown size={18} color={type === 'expense' ? "#DC2626" : "#4B5563"} />
                        <Text style={{ fontWeight: 'bold', color: type === 'expense' ? "#DC2626" : "#4B5563" }}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                            backgroundColor: type === 'income' ? '#FFFFFF' : 'transparent',
                            shadowOpacity: type === 'income' ? 0.1 : 0,
                            shadowRadius: 2,
                            elevation: type === 'income' ? 2 : 0,
                        }}
                        onPress={() => setType('income')}
                    >
                        <TrendingUp size={18} color={type === 'income' ? "#16A34A" : "#4B5563"} />
                        <Text style={{ fontWeight: 'bold', color: type === 'income' ? "#16A34A" : "#4B5563" }}>Income</Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 mb-8">
                    <Input
                        label="Amount"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                        icon={<DollarSign size={20} color="#9CA3AF" />}
                    />

                    {/* Category Selector */}
                    <View>
                        <Text className="mb-1 text-gray-700 font-medium">Category</Text>
                        <TouchableOpacity
                            onPress={() => setShowCategoryModal(true)}
                            className="border border-gray-300 rounded-xl px-4 py-3 bg-white flex-row justify-between items-center"
                        >
                            <Text className={category ? "text-gray-900" : "text-gray-400"}>
                                {category || "Select Category"}
                            </Text>
                            <ChevronRight size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Date & Time */}
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="mb-1 text-gray-700 font-medium">Date</Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="border border-gray-300 rounded-xl px-4 py-3 bg-white flex-row items-center gap-2"
                            >
                                <Calendar size={18} color="#6B7280" />
                                <Text className="text-gray-900">{format(date, 'MMM dd, yyyy')}</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-1">
                            <Text className="mb-1 text-gray-700 font-medium">Time</Text>
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(true)}
                                className="border border-gray-300 rounded-xl px-4 py-3 bg-white flex-row items-center gap-2"
                            >
                                <Clock size={18} color="#6B7280" />
                                <Text className="text-gray-900">{format(date, 'hh:mm a')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View>
                        <Text className="mb-1 text-gray-700 font-medium">Payment Method</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            {PAYMENT_METHODS.map(method => (
                                <TouchableOpacity
                                    key={method}
                                    onPress={() => setPaymentMethod(method)}
                                    className={clsx(
                                        "px-4 py-2 rounded-full border",
                                        paymentMethod === method ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200"
                                    )}
                                >
                                    <Text className={clsx("text-sm font-medium", paymentMethod === method ? "text-blue-600" : "text-gray-600")}>
                                        {method}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <Input
                        label="Description (Optional)"
                        placeholder="Add a note"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <Button
                        title={editingId ? "Update Transaction" : "Add Transaction"}
                        onPress={handleSubmit}
                        loading={loading}
                        variant={editingId ? "secondary" : "primary"}
                    />
                    {editingId && (
                        <TouchableOpacity onPress={() => { setEditingId(null); setAmount(''); setDescription(''); setCategory(''); }} className="items-center">
                            <Text className="text-red-500 font-medium">Cancel Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Recent Transactions */}
                <View className="bg-gray-100/50 p-4 rounded-3xl -mx-4 px-8 pt-6 pb-20">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Recent Transactions</Text>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50"
                            >
                                <ChevronLeft size={20} color="#374151" />
                            </TouchableOpacity>
                            <View className="justify-center px-2">
                                <Text className="text-gray-600 font-medium">{page} / {totalPages}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50"
                            >
                                <ChevronRight size={20} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="space-y-3">
                        {transactions.map((t) => (
                            <View key={t._id} className="bg-white p-4 rounded-xl flex-row justify-between items-center shadow-sm border border-gray-100">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {t.type === 'income' ? <TrendingUp size={24} color="#16A34A" /> : <TrendingDown size={24} color="#DC2626" />}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900 text-base">{t.category}</Text>
                                        <Text className="text-gray-500 text-xs mt-1">
                                            {format(new Date(t.date), 'MMM dd, hh:mm a')} • {t.paymentMethod}
                                        </Text>
                                        {t.description ? <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{t.description}</Text> : null}
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className={`font-bold text-lg mb-1 ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                    </Text>
                                    <View className="flex-row gap-4 mt-1">
                                        <TouchableOpacity onPress={() => handleEdit(t)} className="bg-gray-50 p-1.5 rounded-lg">
                                            <Edit2 size={14} color="#6B7280" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(t._id)} className="bg-red-50 p-1.5 rounded-lg">
                                            <Trash2 size={14} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                        {transactions.length === 0 && (
                            <View className="items-center justify-center py-10">
                                <Text className="text-gray-400">No transactions found</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Category Modal */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Select {type === 'income' ? 'Income' : 'Expense'} Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-2 mb-4">
                            <TextInput
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                                placeholder="New Category Name"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                            />
                            <TouchableOpacity
                                onPress={handleAddCategory}
                                className="bg-blue-600 px-4 rounded-xl justify-center"
                            >
                                <Plus size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="flex-row flex-wrap gap-3">
                                {filteredCategories.map(c => (
                                    <View key={c._id} className="relative">
                                        <TouchableOpacity
                                            onPress={() => {
                                                setCategory(c.name);
                                                setShowCategoryModal(false);
                                            }}
                                            className={clsx(
                                                "px-4 py-3 rounded-xl border",
                                                category === c.name ? "bg-blue-50 border-blue-500" : "bg-white border-gray-200"
                                            )}
                                        >
                                            <Text className={clsx("font-medium", category === c.name ? "text-blue-600" : "text-gray-700")}>
                                                {c.name}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteCategory(c._id)}
                                            className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1"
                                        >
                                            <X size={12} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <Text className="text-gray-400 w-full text-center py-4">No categories found for {type}</Text>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Date Pickers */}
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            const newDate = new Date(date);
                            newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                            setDate(newDate);
                        }
                    }}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowTimePicker(false);
                        if (selectedDate) {
                            const newDate = new Date(date);
                            newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
                            setDate(newDate);
                        }
                    }}
                />
            )}
        </View>
    );
}
