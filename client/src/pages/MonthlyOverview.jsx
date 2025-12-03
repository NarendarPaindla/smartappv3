import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const MonthlyOverview = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(i);
        return d.toLocaleString('default', { month: 'long' });
    });

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
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

        fetchSummary();
    }, [selectedDate]);

    const handleMonthChange = (e) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(months.indexOf(e.target.value));
        setSelectedDate(newDate);
    };

    const handleYearChange = (e) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(Number(e.target.value));
        setSelectedDate(newDate);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    if (loading) return <div className="p-8 text-center">Loading overview...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Monthly Overview</h2>
                <div className="flex gap-2">
                    <select
                        value={months[selectedDate.getMonth()]}
                        onChange={handleMonthChange}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select
                        value={selectedDate.getFullYear()}
                        onChange={handleYearChange}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-sm text-gray-500">Income</p>
                    <p className="text-2xl font-bold text-green-600">{user.defaultCurrency} {summary?.totalIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-sm text-gray-500">Expenses</p>
                    <p className="text-2xl font-bold text-red-600">{user.defaultCurrency} {summary?.totalExpense.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-sm text-gray-500">Savings</p>
                    <p className={`text-2xl font-bold ${summary?.netSavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {user.defaultCurrency} {summary?.netSavings.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Daily Expense Trend</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summary?.dailySpending}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={summary?.categoryBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {summary?.categoryBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary?.paymentMethodBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d">
                                    {summary?.paymentMethodBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyOverview;
