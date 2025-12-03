import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Download, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Reports = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
        type: '',
        paymentMethod: '',
        search: '',
    });
    const [reportData, setReportData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState([]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...filters,
                page,
                limit: 8
            }).toString();

            // Fetch Summary Data (Totals)
            const { data: summaryData } = await api.get(`/reports/summary?${queryParams}`);
            setReportData(summaryData);

            // Fetch Paginated Transactions
            const { data: txData } = await api.get(`/transactions?${queryParams}`);
            setTransactions(txData.transactions);
            setTotalPages(txData.totalPages);

        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchReport();
    }, [page]); // Re-fetch when page changes

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        fetchReport();
    };

    const handleExport = async () => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await api.get(`/reports/export/csv?${queryParams}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium">
                    <Filter className="w-4 h-4" /> Filters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="lg:col-span-2 relative">
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search transactions..."
                            className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    </div>
                    <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="p-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSearch}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {reportData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total Income</p>
                        <p className="text-xl font-bold text-green-600">{user.defaultCurrency} {reportData.totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total Expenses</p>
                        <p className="text-xl font-bold text-red-600">{user.defaultCurrency} {reportData.totalExpense.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Net Result</p>
                        <p className={`text-xl font-bold ${reportData.netResult >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {user.defaultCurrency} {reportData.netResult.toFixed(2)}
                        </p>
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Payment</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((t) => (
                                    <tr key={t._id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{t.category}</td>
                                        <td className="px-6 py-4">{t.description || '-'}</td>
                                        <td className="px-6 py-4">{t.paymentMethod}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {t.type === 'income' ? '+' : '-'}{t.amount}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="text-center py-8">No transactions found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <span className="text-sm text-gray-700">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
