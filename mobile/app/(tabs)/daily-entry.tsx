import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export default function DailyEntry() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (!amount || !category) {
            showToast('Please fill in amount and category', 'error');
            return;
        }

        setLoading(true);
        try {
            await api.post('/transactions', {
                amount: parseFloat(amount),
                description,
                category,
                type,
                date: date.toISOString(),
            });
            showToast('Transaction added successfully!', 'success');
            setAmount('');
            setDescription('');
            setCategory('');
            setDate(new Date());
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to add transaction', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <Text className="text-2xl font-bold text-gray-900 mb-6">Add Transaction</Text>

                <View className="flex-row mb-6 bg-gray-200 p-1 rounded-lg">
                    <TouchableOpacity
                        className={clsx(
                            "flex-1 py-2 rounded-md items-center",
                            type === 'expense' ? "bg-white shadow-sm" : "bg-transparent"
                        )}
                        onPress={() => setType('expense')}
                    >
                        <Text className={clsx("font-semibold", type === 'expense' ? "text-red-600" : "text-gray-600")}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={clsx(
                            "flex-1 py-2 rounded-md items-center",
                            type === 'income' ? "bg-white shadow-sm" : "bg-transparent"
                        )}
                        onPress={() => setType('income')}
                    >
                        <Text className={clsx("font-semibold", type === 'income' ? "text-green-600" : "text-gray-600")}>Income</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <Input
                        label="Amount"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                    />
                    <Input
                        label="Category"
                        placeholder="e.g., Food, Rent, Salary"
                        value={category}
                        onChangeText={setCategory}
                    />
                    <Input
                        label="Description (Optional)"
                        placeholder="Add a note"
                        value={description}
                        onChangeText={setDescription}
                    />

                    <View className="mb-4">
                        <Text className="mb-1 text-gray-700 font-medium">Date</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                        >
                            <Text className="text-gray-900">{format(date, 'MMM dd, yyyy')}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setDate(selectedDate);
                                }}
                            />
                        )}
                    </View>

                    <Button title="Add Transaction" onPress={handleSubmit} loading={loading} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
