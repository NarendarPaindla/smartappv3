import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, DollarSign, TrendingDown, TrendingUp, PieChart, RefreshCw } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

const DailyAnalysis = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        netResult: 0,
        transactions: []
    });
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debugRange, setDebugRange] = useState('');

    const fetchDailyData = async () => {
        setLoading(true);
        try {
            // Parse the selected date string (YYYY-MM-DD) as a local date
            const date = parseISO(selectedDate);
            const start = startOfDay(date);
            const end = endOfDay(date);

            setDebugRange(`${start.toISOString()} - ${end.toISOString()}`);

            const queryParams = new URLSearchParams({
                startDate: start.toISOString(),
                endDate: end.toISOString()
            }).toString();

            const { data } = await api.get(`/reports/summary?${queryParams}`);
            setSummary(data);

            // Calculate category breakdown for expenses
            const expenses = data.transactions.filter(t => t.type === 'expense');
            const breakdown = expenses.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

            const breakdownData = Object.keys(breakdown).map(cat => ({
                name: cat,
                value: breakdown[cat]
            }));
            setCategoryBreakdown(breakdownData);

        } catch (error) {
            console.error('Error fetching daily data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyData();
    }, [selectedDate]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Daily Analysis</h2>
                <div className="flex items-center gap-2">
                    <button onClick={fetchDailyData} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50">
                        <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border-none focus:ring-0 text-gray-700 font-medium"
                        />
                    </div>
                </div>
            </div>
            {/* <div className="text-xs text-gray-400">Range: {debugRange}</div> */}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-red-600">{user.defaultCurrency} {summary.totalExpense.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full text-red-600">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">{user.defaultCurrency} {summary.totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Net Result</p>
                        <p className={`text-2xl font-bold ${summary.netResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {user.defaultCurrency} {summary.netResult.toFixed(2)}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-gray-500" />
                        Expense Breakdown
                    </h3>
                    <div className="h-64">
                        {categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${user.defaultCurrency} ${value.toFixed(2)}`} />
                                    <Legend />
                                </RePieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                No expenses for this day
                            </div>
                        )}
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Transactions</h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                        {summary.transactions.length > 0 ? (
                            summary.transactions.map((t) => (
                                <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{t.category}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.description || t.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">No transactions found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyAnalysis;
