import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Upload, Plus, Trash2, Edit2, DollarSign, ChevronLeft, ChevronRight, X, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const DailyEntry = () => {
    const { addToast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        category: '',
        paymentMethod: 'Cash',
        description: '',
        receiptImageUrl: '',
    });
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingId, setEditingId] = useState(null);

    const fetchTransactions = async (pageNum = 1) => {
        try {
            const { data } = await api.get(`/transactions?page=${pageNum}&limit=8`);
            setTransactions(data.transactions);
            setTotalPages(data.totalPages);
            setPage(data.page);
        } catch (error) {
            console.error('Error fetching transactions', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            if (data.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories', error);
        }
    };

    useEffect(() => {
        fetchTransactions(page);
        fetchCategories();
    }, [page]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            const { data } = await api.post('/receipts/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setFormData(prev => ({
                ...prev,
                receiptImageUrl: data.receiptImageUrl,
                amount: data.extractedAmount || prev.amount,
                date: data.extractedDate ? new Date(data.extractedDate).toISOString().split('T')[0] : prev.date,
                description: data.extractedRawText ? `Receipt from ${data.extractedRawText.substring(0, 20)}...` : prev.description
            }));
        } catch (error) {
            console.error('Upload failed', error);
            addToast('Receipt upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            const { data } = await api.post('/categories', { name: newCategory, type: formData.type });
            setCategories([...categories, data]);
            setFormData({ ...formData, category: data.name });
            setNewCategory('');
            setShowCategoryInput(false);
            addToast('Category added successfully', 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Failed to add category', 'error');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c._id !== id));
            if (categories.length > 0) {
                setFormData(prev => ({ ...prev, category: categories[0].name }));
            }
        } catch (error) {
            console.error('Error deleting category', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);
            const payload = { ...formData, date: dateTime };

            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload);
                addToast('Transaction updated!', 'success');
                setEditingId(null);
            } else {
                await api.post('/transactions', payload);
                addToast('Transaction added!', 'success');
            }

            fetchTransactions(page);
            setFormData({
                type: 'expense',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                category: categories.length > 0 ? categories[0].name : '',
                paymentMethod: 'Cash',
                description: '',
                receiptImageUrl: '',
            });
        } catch (error) {
            console.error('Error saving transaction', error);
            addToast('Failed to save transaction', 'error');
        }
    };

    const handleEdit = (transaction) => {
        const date = new Date(transaction.date);
        setFormData({
            type: transaction.type,
            amount: transaction.amount,
            date: date.toISOString().split('T')[0],
            time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            category: transaction.category,
            paymentMethod: transaction.paymentMethod,
            description: transaction.description || '',
            receiptImageUrl: transaction.receiptImageUrl || '',
        });
        setEditingId(transaction._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/transactions/${id}`);
                addToast('Transaction deleted', 'success');
                fetchTransactions(page);
            } catch (error) {
                console.error('Error deleting transaction', error);
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Entry Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    type: 'expense',
                                    amount: '',
                                    date: new Date().toISOString().split('T')[0],
                                    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                                    category: categories.length > 0 ? categories[0].name : '',
                                    paymentMethod: 'Cash',
                                    description: '',
                                    receiptImageUrl: '',
                                });
                            }}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                            className={`p-2 text-center rounded-lg border ${formData.type === 'expense'
                                ? 'bg-red-50 border-red-200 text-red-600 font-medium'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: 'income' })}
                            className={`p-2 text-center rounded-lg border ${formData.type === 'income'
                                ? 'bg-green-50 border-green-200 text-green-600 font-medium'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            required
                            value={formData.amount}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <input
                                type="time"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <button
                                type="button"
                                onClick={() => setShowCategoryInput(!showCategoryInput)}
                                className="text-xs text-primary hover:text-indigo-700"
                            >
                                {showCategoryInput ? 'Cancel' : '+ New Category'}
                            </button>
                        </div>

                        {showCategoryInput ? (
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Category Name"
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="bg-green-500 text-white px-3 rounded-lg hover:bg-green-600"
                                >
                                    Add
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Manage Categories List (Small) */}
                        {showCategoryInput && (
                            <div className="mt-2 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
                                {categories.map(c => (
                                    <div key={c._id} className="flex justify-between items-center text-sm py-1">
                                        <span>{c.name}</span>
                                        <button onClick={() => handleDeleteCategory(c._id)} className="text-red-400 hover:text-red-600">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        >
                            <option>Cash</option>
                            <option>Credit Card</option>
                            <option>Debit Card</option>
                            <option>UPI</option>
                            <option>Bank Transfer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="Optional description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                                <Upload className="w-4 h-4" />
                                {uploading ? 'Uploading...' : 'Upload Image'}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                            {formData.receiptImageUrl && <span className="text-xs text-green-600">Attached</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingId ? 'Update Transaction' : 'Add Transaction'}
                    </button>
                </form>
            </div>

            {/* Recent Transactions List */}
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="divide-y divide-gray-200">
                        {transactions.map((t) => (
                            <div key={t._id} className={`p-4 flex items-center justify-between hover:bg-gray-50 ${editingId === t._id ? 'bg-indigo-50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {t.type === 'income' ? <Plus className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{t.category}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(t.date).toLocaleDateString()} at {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.paymentMethod}
                                        </p>
                                        {t.description && <p className="text-xs text-gray-400">{t.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-blue-500">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(t._id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="p-8 text-center text-gray-500">No recent transactions</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyEntry;
