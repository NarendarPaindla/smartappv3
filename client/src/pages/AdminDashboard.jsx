import { useState, useEffect } from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../utils/api';
import {
    Shield, Check, X, Trash2, Clock, Users, Activity,
    Search, Download, FileText, ChevronLeft, ChevronRight,
    AlertCircle, DollarSign, Settings, Database, Edit2,
    Save, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users'); // users, admins, logs, system
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]); // New state for admins
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalHours: 0 });
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Edit Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', plan: '', resetUsage: false });

    useEffect(() => {
        fetchStats();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'admins') fetchAdmins();
        if (activeTab === 'logs') fetchAuditLogs();

        const interval = setInterval(() => {
            fetchStats();
            if (activeTab === 'users') fetchUsers(false);
            if (activeTab === 'admins') fetchAdmins(false);
            if (activeTab === 'logs') fetchAuditLogs();
        }, 30000);
        return () => clearInterval(interval);
    }, [page, search, statusFilter, activeTab]);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchUsers = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data } = await api.get(`/admin/users?page=${page}&limit=10&search=${search}&status=${statusFilter}`);
            setUsers(data.users || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchAdmins = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Explicitly fetch admins
            const { data } = await api.get(`/admin/users?role=admin&page=${page}&limit=10&search=${search}`);
            setAdmins(data.users || []);
            setTotalPages(data.pages || 1);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setAdmins([]);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const { data } = await api.get('/admin/audit-logs');
            setAuditLogs(data || []);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            setAuditLogs([]);
        }
    };

    const toggleUserStatus = async (userId) => {
        try {
            await api.put(`/admin/users/${userId}/status`);
            if (activeTab === 'users') fetchUsers(false);
            if (activeTab === 'admins') fetchAdmins(false);
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const confirmPayment = async (userId) => {
        const amount = prompt('Enter payment amount to confirm (e.g., 100):', '100');
        if (!amount) return;

        try {
            await api.post(`/admin/users/${userId}/confirm-payment`, { amount: Number(amount), plan: 'monthly' });
            alert('Payment confirmed successfully!');
            fetchUsers(false);
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Failed to confirm payment');
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                if (activeTab === 'users') fetchUsers();
                if (activeTab === 'admins') fetchAdmins();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan || 'free',
            resetUsage: false
        });
    };

    const saveUserChanges = async () => {
        if (!editingUser) return;
        try {
            await api.put(`/admin/users/${editingUser._id}`, editForm);
            alert('User updated successfully!');
            setEditingUser(null);
            if (activeTab === 'users') fetchUsers(false);
            if (activeTab === 'admins') fetchAdmins(false);
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const handleExport = async () => {
        try {
            const response = await api.get('/admin/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting data:', error);
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const isOnline = (lastActive) => {
        if (!lastActive) return false;
        const diff = new Date() - new Date(lastActive);
        return diff < 5 * 60 * 1000; // 5 minutes
    };

    const UserTable = ({ data, emptyMessage }) => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                        <th className="p-5 font-semibold text-slate-600 text-sm">User Profile</th>
                        <th className="p-5 font-semibold text-slate-600 text-sm">Status & Plan</th>
                        <th className="p-5 font-semibold text-slate-600 text-sm">Activity</th>
                        <th className="p-5 font-semibold text-slate-600 text-sm">Last Seen</th>
                        <th className="p-5 font-semibold text-slate-600 text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan="5" className="p-12 text-center text-slate-500">Loading...</td></tr>
                    ) : data && data.length > 0 ? (
                        data.map((u) => {
                            if (!u) return null;
                            const initial = u.name ? u.name.charAt(0).toUpperCase() : '?';
                            const displayName = u.name || 'Unknown User';
                            const displayEmail = u.email || 'No Email';

                            return (
                                <tr key={u._id || Math.random()} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-inner">
                                                    {initial}
                                                </div>
                                                {isOnline(u.lastActive) && (
                                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{displayName}</p>
                                                <p className="text-sm text-slate-500">{displayEmail}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border ${u.isActive
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-red-50 text-red-700 border-red-200'
                                                }`}>
                                                {u.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                                                {u.role === 'admin' ? 'Admin Access' : (u.isSubscribed ? `Plan: ${u.plan}` : 'Free Trial')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2 text-slate-700">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{formatDuration(u.totalUsageMinutes)}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm text-slate-500">
                                        {u.lastActive ? new Date(u.lastActive).toLocaleString() : 'Never'}
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditUser(u)}
                                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toggleUserStatus(u._id)}
                                                className={`p-2 rounded-lg transition-all ${u.isActive
                                                    ? 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
                                                    : 'text-slate-500 hover:text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={u.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {u.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => confirmPayment(u._id)}
                                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Confirm Payment"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteUser(u._id)}
                                                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="p-16 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                        <Users className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">{emptyMessage}</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
                                <p className="text-xs text-slate-500">System Management & Overview</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                System Operational
                            </span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 mt-4">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'users' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            User Management
                            {activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('admins')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'admins' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Admin Management
                            {activeTab === 'admins' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'logs' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Audit Logs
                            {activeTab === 'logs' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'system' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            System Health
                            {activeTab === 'system' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Users</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            <span className="text-green-600 font-medium flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> Updated
                            </span>
                            just now
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Now</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeUsers}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online in last 15m
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Usage</p>
                                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalHours}h</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-500">
                            Cumulative system usage
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {(activeTab === 'users' || activeTab === 'admins') && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Toolbar */}
                        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeTab}...`}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-200 font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>

                        {/* Table */}
                        <ErrorBoundary onReset={() => {
                            if (activeTab === 'users') fetchUsers(false);
                            if (activeTab === 'admins') fetchAdmins(false);
                        }}>
                            <UserTable
                                data={activeTab === 'users' ? users : admins}
                                emptyMessage={activeTab === 'users' ? "No users found" : "No admins found"}
                            />
                        </ErrorBoundary>

                        {/* Pagination */}
                        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-all"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 shadow-sm transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Audit Logs Tab */}
                {activeTab === 'logs' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="font-bold text-lg text-slate-900">System Audit Logs</h3>
                            <p className="text-sm text-slate-500">Track all administrative actions and security events</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {auditLogs.length > 0 ? (
                                auditLogs.map((log) => (
                                    <div key={log._id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="p-2 bg-slate-100 rounded-lg h-fit">
                                                    <FileText className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{log.action}</p>
                                                    <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                                        <span>By: {log.adminId?.name || 'Unknown'}</span>
                                                        <span>•</span>
                                                        <span>IP: {log.ip || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 text-center text-slate-500">No audit logs found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* System Tab */}
                {activeTab === 'system' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                <Database className="w-5 h-5 text-indigo-600" />
                                Database Statistics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                    <span className="text-slate-600">Total Users Collection</span>
                                    <span className="font-bold text-slate-900">{stats.totalUsers}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                    <span className="text-slate-600">Audit Logs Stored</span>
                                    <span className="font-bold text-slate-900">{auditLogs.length}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                                    <span className="text-slate-600">System Uptime</span>
                                    <span className="font-bold text-green-600">99.9%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-slate-600" />
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full p-4 text-left bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-between group">
                                    <span className="font-medium text-slate-700">Clear System Cache</span>
                                    <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                </button>
                                <button className="w-full p-4 text-left bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-between group">
                                    <span className="font-medium text-slate-700">Export All System Logs</span>
                                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                </button>
                                <button className="w-full p-4 text-left bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center justify-between group">
                                    <span className="font-medium text-red-700">Purge Deleted Users</span>
                                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-900">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Plan</label>
                                    <select
                                        value={editForm.plan}
                                        onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    >
                                        <option value="free">Free</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="annual">Annual</option>
                                    </select>
                                </div>
                            </div>

                            {editForm.plan === 'free' && (
                                <div className="flex items-center gap-2 mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <input
                                        type="checkbox"
                                        id="resetUsage"
                                        checked={editForm.resetUsage}
                                        onChange={(e) => setEditForm({ ...editForm, resetUsage: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="resetUsage" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                        Reset Usage Limit (Grant 1 Hour Free Access)
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveUserChanges}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default AdminDashboard;
