import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Shield,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: Users }, // Placeholder for future expansion
        { name: 'Settings', path: '/admin/settings', icon: Settings }, // Placeholder
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar for Desktop - Dark Theme */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-8 h-8 text-indigo-500" />
                        Admin Portal
                    </h1>
                    <div className="mt-4 flex items-center justify-between bg-slate-800 p-2 rounded-lg">
                        <span className="text-sm font-medium text-slate-300">Admin Mode</span>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            title="Switch to User Dashboard"
                        >
                            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                        </button>
                    </div>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Menu */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-6 h-6 text-indigo-500" />
                        Admin Portal
                    </h1>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-gray-800/50" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="absolute right-0 top-0 bottom-0 w-64 bg-slate-900 p-4 shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={clsx(
                                                'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                                                isActive
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-slate-800 rounded-lg transition-colors mt-4"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
