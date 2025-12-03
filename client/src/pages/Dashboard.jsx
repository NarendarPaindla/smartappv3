import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
    AlertTriangle
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const Dashboard = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'overall'
    const [currentDate] = useState(new Date());
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                let url = '';
                if (viewMode === 'monthly') {
                    const month = currentDate.getMonth() + 1;
                    const year = currentDate.getFullYear();
                    url = `/summary/monthly?month=${month}&year=${year}`;
                } else {
                    url = '/summary/overall';
                }

                const { data } = await api.get(url);
                setSummary(data);
            } catch (error) {
                console.error('Error fetching summary:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [currentDate, viewMode]);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setViewMode('monthly')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'monthly' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setViewMode('overall')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'overall' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Overall
                        </button>
                    </div>
                    {viewMode === 'monthly' && (
                        <span className="text-sm text-gray-500">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Income</p>
                            <p className="text-2xl font-bold text-secondary mt-1">
                                {user.defaultCurrency} {summary?.totalIncome.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-full">
                            <TrendingUp className="w-6 h-6 text-secondary" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-danger mt-1">
                                {user.defaultCurrency} {summary?.totalExpense.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-full">
                            <TrendingDown className="w-6 h-6 text-danger" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Net Savings</p>
                            <p className={`text-2xl font-bold mt-1 ${summary?.netSavings >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                {user.defaultCurrency} {summary?.netSavings.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-full">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Spending Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{viewMode === 'monthly' ? 'Daily Spending' : 'Monthly Trend'}</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summary?.dailySpending}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h3>
                    <div className="h-64">
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
            </div>

            {/* Top Spending Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-yellow-50 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Highest Spending Category</p>
                        <p className="text-gray-600">
                            You spent most on <span className="font-bold">{summary?.highestCategory?.name}</span> ({user.defaultCurrency} {summary?.highestCategory?.value}) this month.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
