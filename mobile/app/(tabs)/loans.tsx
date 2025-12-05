import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Search, Filter, Trash2, Edit2, CheckCircle, X, Wallet } from 'lucide-react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { formatCurrency } from '../../utils/currency';

export default function Loans() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'list' | 'analysis'>('list');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paid'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLoan, setEditingLoan] = useState<any>(null);
    const [formData, setFormData] = useState({
        personName: '',
        amount: '',
        dateGiven: new Date(),
        expectedReturnDate: new Date(),
        interestAmount: '',
        status: 'active'
    });
    const [showDatePicker, setShowDatePicker] = useState<'given' | 'return' | null>(null);

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const { data } = await api.get('/loans');
            setLoans(data);
        } catch (error) {
            console.error('Error fetching loans:', error);
            showToast('Failed to fetch loans', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.personName || !formData.amount) {
            showToast('Please fill required fields', 'error');
            return;
        }

        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                interestAmount: formData.interestAmount ? parseFloat(formData.interestAmount) : 0,
                dateGiven: formData.dateGiven.toISOString(),
                expectedReturnDate: formData.expectedReturnDate.toISOString(),
            };

            if (editingLoan) {
                await api.put(`/loans/${editingLoan._id}`, payload);
                showToast('Loan updated', 'success');
            } else {
                await api.post('/loans', payload);
                showToast('Loan added', 'success');
            }
            setModalVisible(false);
            fetchLoans();
        } catch (error) {
            console.error('Error saving loan:', error);
            showToast('Failed to save loan', 'error');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Loan', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/loans/${id}`);
                        showToast('Loan deleted', 'success');
                        fetchLoans();
                    } catch (error) {
                        showToast('Failed to delete', 'error');
                    }
                }
            }
        ]);
    };

    const handleMarkPaid = async (id: string) => {
        try {
            await api.put(`/loans/${id}`, { status: 'paid' });
            showToast('Marked as paid', 'success');
            fetchLoans();
        } catch (error) {
            showToast('Failed to update', 'error');
        }
    };

    const openModal = (loan?: any) => {
        if (loan) {
            setEditingLoan(loan);
            setFormData({
                personName: loan.personName,
                amount: loan.amount.toString(),
                dateGiven: new Date(loan.dateGiven),
                expectedReturnDate: new Date(loan.expectedReturnDate),
                interestAmount: loan.interestAmount?.toString() || '',
                status: loan.status
            });
        } else {
            setEditingLoan(null);
            setFormData({
                personName: '',
                amount: '',
                dateGiven: new Date(),
                expectedReturnDate: new Date(),
                interestAmount: '',
                status: 'active'
            });
        }
        setModalVisible(true);
    };

    // Analysis Data
    const totalActive = loans.filter((l: any) => l.status === 'active').reduce((acc, l: any) => acc + l.amount, 0);
    const totalInterest = loans.reduce((acc, l: any) => acc + (l.interestAmount || 0), 0);
    const totalPaid = loans.filter((l: any) => l.status === 'paid').reduce((acc, l: any) => acc + l.amount, 0);

    const pieData = [
        { value: totalActive, color: '#F59E0B', text: 'Active' },
        { value: totalPaid, color: '#10B981', text: 'Paid' }
    ];

    const filteredLoans = loans.filter((l: any) => {
        const matchesSearch = l.personName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-900">Loans</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => setActiveTab(activeTab === 'list' ? 'analysis' : 'list')}
                        className="p-2 bg-gray-100 rounded-full"
                    >
                        {activeTab === 'list' ? <Wallet size={20} color="#374151" /> : <Filter size={20} color="#374151" />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => openModal()}
                        className="p-2 bg-blue-600 rounded-full"
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {activeTab === 'list' ? (
                <ScrollView className="flex-1 p-4">
                    {/* Summary Cards */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <Text className="text-gray-500 text-xs mb-1">Active Loans</Text>
                            <Text className="text-xl font-bold text-yellow-600">{formatCurrency(totalActive, user?.currency)}</Text>
                        </View>
                        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <Text className="text-gray-500 text-xs mb-1">Interest</Text>
                            <Text className="text-xl font-bold text-green-600">{formatCurrency(totalInterest, user?.currency)}</Text>
                        </View>
                    </View>

                    {/* Filters */}
                    <View className="flex-row gap-2 mb-4">
                        <View className="flex-1 relative">
                            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
                            <TextInput
                                placeholder="Search name..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm"
                            />
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-none">
                            {['all', 'active', 'paid'].map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    onPress={() => setFilterStatus(status as any)}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg mr-2 border",
                                        filterStatus === status ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
                                    )}
                                >
                                    <Text className={clsx("capitalize text-xs font-medium", filterStatus === status ? "text-white" : "text-gray-600")}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* List */}
                    {filteredLoans.map((loan: any) => (
                        <View key={loan._id} className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
                            <View className="flex-row justify-between items-start mb-2">
                                <View>
                                    <Text className="text-lg font-bold text-gray-900">{loan.personName}</Text>
                                    <Text className="text-gray-500 text-xs">Given: {format(new Date(loan.dateGiven), 'MMM dd, yyyy')}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-lg font-bold text-gray-900">{formatCurrency(loan.amount, user?.currency)}</Text>
                                    <Text className="text-green-600 text-xs">+{loan.interestAmount || 0} Interest</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-50">
                                <View className={clsx("px-2 py-1 rounded-full", loan.status === 'active' ? "bg-yellow-100" : "bg-green-100")}>
                                    <Text className={clsx("text-xs font-medium capitalize", loan.status === 'active' ? "text-yellow-800" : "text-green-800")}>
                                        {loan.status}
                                    </Text>
                                </View>
                                <View className="flex-row gap-3">
                                    {loan.status === 'active' && (
                                        <TouchableOpacity onPress={() => handleMarkPaid(loan._id)}>
                                            <CheckCircle size={18} color="#10B981" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity onPress={() => openModal(loan)}>
                                        <Edit2 size={18} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(loan._id)}>
                                        <Trash2 size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}
                    <View className="h-20" />
                </ScrollView>
            ) : (
                <ScrollView className="flex-1 p-4">
                    <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 items-center mb-6">
                        <Text className="text-lg font-bold mb-4">Loan Distribution</Text>
                        <PieChart
                            data={pieData}
                            donut
                            showText
                            textColor="black"
                            radius={100}
                            textSize={12}
                            showValuesAsLabels
                        />
                    </View>
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                        <Text className="text-gray-500 text-sm">Total Lent (All Time)</Text>
                        <Text className="text-2xl font-bold text-gray-900">{formatCurrency(totalActive + totalPaid, user?.currency)}</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-sm">Total Returned</Text>
                        <Text className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid, user?.currency)}</Text>
                    </View>
                </ScrollView>
            )}

            {/* Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold">{editingLoan ? 'Edit Loan' : 'Add Loan'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Input label="Person Name" value={formData.personName} onChangeText={(t) => setFormData({ ...formData, personName: t })} placeholder="Name" />
                            <Input label="Amount" value={formData.amount} onChangeText={(t) => setFormData({ ...formData, amount: t })} keyboardType="numeric" placeholder="0.00" />

                            <Text className="mb-1 text-gray-700 font-medium">Date Given</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker('given')} className="border border-gray-300 rounded-lg px-4 py-3 bg-white mb-4">
                                <Text>{format(formData.dateGiven, 'MMM dd, yyyy')}</Text>
                            </TouchableOpacity>

                            <Text className="mb-1 text-gray-700 font-medium">Return Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker('return')} className="border border-gray-300 rounded-lg px-4 py-3 bg-white mb-4">
                                <Text>{format(formData.expectedReturnDate, 'MMM dd, yyyy')}</Text>
                            </TouchableOpacity>

                            <Input label="Expected Interest" value={formData.interestAmount} onChangeText={(t) => setFormData({ ...formData, interestAmount: t })} keyboardType="numeric" placeholder="0.00" />

                            {editingLoan && (
                                <View className="mb-4">
                                    <Text className="mb-1 text-gray-700 font-medium">Status</Text>
                                    <View className="flex-row gap-2">
                                        {['active', 'paid'].map((s) => (
                                            <TouchableOpacity key={s} onPress={() => setFormData({ ...formData, status: s })} className={clsx("px-4 py-2 rounded-lg border", formData.status === s ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300")}>
                                                <Text className={clsx("capitalize", formData.status === s ? "text-white" : "text-gray-700")}>{s}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            <Button title="Save Loan" onPress={handleSave} />
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={showDatePicker === 'given' ? formData.dateGiven : formData.expectedReturnDate}
                        mode="date"
                        onChange={(e, date) => {
                            setShowDatePicker(null);
                            if (date) {
                                if (showDatePicker === 'given') setFormData({ ...formData, dateGiven: date });
                                else setFormData({ ...formData, expectedReturnDate: date });
                            }
                        }}
                    />
                )}
            </Modal>
        </SafeAreaView>
    );
}
