import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    PlusCircle,
    CalendarDays,
    PieChart,
    FileText,
    Receipt,
    Settings,
    LogOut,
    Menu,
    X,
    DollarSign,
    Calculator
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

import useHeartbeat from '../hooks/useHeartbeat';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    useHeartbeat(); // Start tracking usage
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Daily Entry', path: '/daily-entry', icon: PlusCircle },
        { name: 'Monthly Overview', path: '/monthly-overview', icon: CalendarDays },
        { name: 'Budgets', path: '/budgets', icon: PieChart },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Daily Analysis', path: '/daily-analysis', icon: CalendarDays },
        { name: 'Loans', path: '/loans', icon: DollarSign },
        { name: 'Calculators', path: '/calculators', icon: Calculator },
        { name: 'Receipts', path: '/receipts', icon: Receipt },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <PieChart className="w-8 h-8" />
                        SmartSpend
                    </h1>
                    {user?.role === 'admin' && (
                        <div className="mt-4 flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Admin Mode</span>
                            <button
                                onClick={() => navigate('/admin')}
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                title="Switch to Admin Dashboard"
                            >
                                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                            </button>
                        </div>
                    )}
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
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Menu */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden bg-white border-b border-gray-200 flex items-center justify-between p-4">
                    <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                        <PieChart className="w-6 h-6" />
                        SmartSpend
                    </h1>
                    {user?.role === 'admin' && (
                        <div className="flex items-center gap-2 mr-2">
                            <span className="text-xs font-medium text-gray-600">Admin Mode</span>
                            <button
                                onClick={() => navigate('/admin')}
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                            </button>
                        </div>
                    )}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-gray-800/50" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
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
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-danger hover:bg-red-50 rounded-lg transition-colors mt-4"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
