import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, DollarSign, Calendar, User, Trash2, CheckCircle, X, Edit2, PieChart as PieIcon, List, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useToast } from '../context/ToastContext';

const Loans = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loans, setLoans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [editingLoan, setEditingLoan] = useState(null);
    const [formData, setFormData] = useState({
        personName: '',
        amount: '',
        dateGiven: new Date().toISOString().split('T')[0],
        expectedReturnDate: '',
        interestAmount: '',
        status: 'active'
    });

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const { data } = await api.get('/loans');
            setLoans(data);
        } catch (error) {
            console.error('Error fetching loans:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLoan) {
                await api.put(`/loans/${editingLoan._id}`, formData);
                addToast('Loan updated successfully', 'success');
            } else {
                await api.post('/loans', formData);
                addToast('Loan added successfully', 'success');
            }
            setShowModal(false);
            fetchLoans();
        } catch (error) {
            console.error('Error saving loan:', error);
            addToast('Failed to save loan', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this loan?')) {
            try {
                await api.delete(`/loans/${id}`);
                addToast('Loan deleted successfully', 'success');
                fetchLoans();
            } catch (error) {
                console.error('Error deleting loan:', error);
                addToast('Failed to delete loan', 'error');
            }
        }
    };

    const handleMarkAsPaid = async (id) => {
        try {
            await api.put(`/loans/${id}`, { status: 'paid' });
            addToast('Loan marked as paid', 'success');
            fetchLoans();
        } catch (error) {
            console.error('Error updating loan:', error);
            addToast('Failed to update loan', 'error');
        }
    };

    const handleAddClick = () => {
        setEditingLoan(null);
        setFormData({
            personName: '',
            amount: '',
            dateGiven: new Date().toISOString().split('T')[0],
            expectedReturnDate: '',
            interestAmount: '',
            status: 'active'
        });
        setShowModal(true);
    };

    const handleEditClick = (loan) => {
        setEditingLoan(loan);
        setFormData({
            personName: loan.personName,
            amount: loan.amount,
            dateGiven: new Date(loan.dateGiven).toISOString().split('T')[0],
            expectedReturnDate: new Date(loan.expectedReturnDate).toISOString().split('T')[0],
            interestAmount: loan.interestAmount || '',
            status: loan.status
        });
        setShowModal(true);
    };

    // Analysis Data Preparation
    const totalLent = loans.reduce((acc, l) => acc + l.amount, 0);
    const totalActive = loans.filter(l => l.status === 'active').reduce((acc, l) => acc + l.amount, 0);
    const totalPaid = loans.filter(l => l.status === 'paid').reduce((acc, l) => acc + l.amount, 0);
    const totalInterest = loans.reduce((acc, l) => acc + (l.interestAmount || 0), 0);

    const statusData = [
        { name: 'Active Loans', value: totalActive },
        { name: 'Paid Loans', value: totalPaid }
    ];

    const COLORS = ['#FFBB28', '#00C49F'];

    // Top Borrowers Logic
    const borrowerData = Object.values(loans.reduce((acc, loan) => {
        if (!acc[loan.personName]) {
            acc[loan.personName] = { name: loan.personName, amount: 0 };
        }
        acc[loan.personName].amount += loan.amount;
        return acc;
    }, {})).sort((a, b) => b.amount - a.amount).slice(0, 5);

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const itemsPerPage = 6;

    // Filter Logic
    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.personName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLoans = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Loans Management</h2>
                <div className="flex gap-2">
                    <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center gap-2">
                                <List className="w-4 h-4" />
                                List
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('analysis')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analysis' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center gap-2">
                                <PieIcon className="w-4 h-4" />
                                Analysis
                            </div>
                        </button>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Loan
                    </button>
                </div>
            </div>

            {activeTab === 'list' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Active Loans</p>
                            <p className="text-3xl font-bold text-red-600">{user.defaultCurrency} {totalActive.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Expected Interest</p>
                            <p className="text-3xl font-bold text-green-600">{user.defaultCurrency} {totalInterest.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Filters Toolbar */}
                        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Status:</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                                >
                                    <option value="all">All Loans</option>
                                    <option value="active">Active Only</option>
                                    <option value="paid">Paid Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Person</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Given</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentLoans.length > 0 ? (
                                        currentLoans.map((loan) => (
                                            <tr key={loan._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{loan.personName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.defaultCurrency} {loan.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(loan.dateGiven).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(loan.expectedReturnDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-green-600">+{user.defaultCurrency} {loan.interestAmount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${loan.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {loan.status === 'active' && (
                                                            <button
                                                                onClick={() => handleMarkAsPaid(loan._id)}
                                                                title="Mark as Paid"
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleEditClick(loan)}
                                                            title="Edit"
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(loan._id)}
                                                            title="Delete"
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No loans found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                                <span className="text-sm text-gray-500">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLoans.length)} of {filteredLoans.length} loans
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Previous Page"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => handlePageChange(i + 1)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Next Page"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Lent (All Time)</p>
                            <p className="text-2xl font-bold text-gray-900">{user.defaultCurrency} {totalLent.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Returned</p>
                            <p className="text-2xl font-bold text-green-600">{user.defaultCurrency} {totalPaid.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Total Interest Expected</p>
                            <p className="text-2xl font-bold text-blue-600">{user.defaultCurrency} {totalInterest.toFixed(2)}</p>
                        </div>
                    </div>

                    {loans.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Loan Status Distribution</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${user.defaultCurrency} ${value.toFixed(2)}`} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Top Borrowers</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={borrowerData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `${user.defaultCurrency} ${value}`} />
                                            <Bar dataKey="amount" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                            <p className="text-gray-500">No loan data available. Add your first loan to see analytics.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Loan Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">{editingLoan ? 'Edit Loan' : 'Add New Loan'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Person Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.personName}
                                        onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Who are you lending to?"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Given</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.dateGiven}
                                        onChange={(e) => setFormData({ ...formData, dateGiven: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.expectedReturnDate}
                                        onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Interest</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={formData.interestAmount}
                                        onChange={(e) => setFormData({ ...formData, interestAmount: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            {editingLoan && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    >
                                        <option value="active">Active</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                {editingLoan ? 'Update Loan' : 'Add Loan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loans;
