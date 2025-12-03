import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Save } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Settings = () => {
    const { user, updateUserProfile } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        defaultCurrency: user?.defaultCurrency || 'USD',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/auth/profile', formData);
            updateUserProfile(data);
            addToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast('Error updating profile', 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                        <p className="text-gray-500">{user?.email}</p>
                    </div>
                </div>



                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                        <select
                            name="defaultCurrency"
                            value={formData.defaultCurrency}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="INR">INR (₹)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
