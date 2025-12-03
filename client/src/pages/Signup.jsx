import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, TrendingUp, Calendar, DollarSign, Github, Linkedin, Check, X } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        defaultCurrency: 'USD',
        monthStartDay: 1
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordFeedback, setPasswordFeedback] = useState([]);
    const { signup, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const checkPasswordStrength = (pass) => {
        let score = 0;
        let feedback = [];
        if (pass.length >= 8) score++;
        else feedback.push("At least 8 characters");

        if (/[A-Z]/.test(pass)) score++;
        else feedback.push("At least one uppercase letter");

        if (/[0-9]/.test(pass)) score++;
        else feedback.push("At least one number");

        if (/[^A-Za-z0-9]/.test(pass)) score++;
        else feedback.push("At least one special character");

        setPasswordStrength(score);
        setPasswordFeedback(feedback);
    };

    const handlePasswordChange = (e) => {
        const newPass = e.target.value;
        setFormData({ ...formData, password: newPass });
        checkPasswordStrength(newPass);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwordStrength < 4) {
            alert("Please create a stronger password.");
            return;
        }
        try {
            await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                defaultCurrency: formData.defaultCurrency,
                monthStartDay: formData.monthStartDay
            });
            navigate('/');
        } catch (error) {
            console.error('Signup failed:', error);
            alert('Error creating account');
        }
    };

    const handleSocialLogin = (provider) => {
        window.location.href = `http://localhost:8000/api/auth/${provider}`;
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength === 2) return 'bg-yellow-500';
        if (passwordStrength === 3) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-primary text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-2xl font-bold mb-2">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        SmartSpend
                    </div>
                    <p className="text-blue-100">Start your financial journey today.</p>
                </div>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Create your <br />
                        <span className="text-blue-200">free account.</span>
                    </h1>
                    <p className="text-lg text-blue-100 mb-8">
                        Get access to powerful tools that help you track, analyze, and optimize your spending habits effortlessly.
                    </p>
                    <ul className="space-y-4 text-blue-50">
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                            Smart expense tracking
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                            Visual budget analysis
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</div>
                            Secure data storage
                        </li>
                    </ul>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400/30 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Right Panel - Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 my-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h2>
                        <p className="text-gray-500">Create your account to start tracking.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handlePasswordChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex gap-1 h-1.5">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-full rounded-full flex-1 transition-all duration-300 ${i <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {passwordStrength < 4 ? (
                                            <ul className="list-disc list-inside space-y-0.5 text-red-500">
                                                {passwordFeedback.map((msg, idx) => (
                                                    <li key={idx}>{msg}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-green-600 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Strong password
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <select
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-white"
                                        value={formData.defaultCurrency}
                                        onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="JPY">JPY (¥)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Month Start</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.monthStartDay}
                                        onChange={(e) => setFormData({ ...formData, monthStartDay: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform hover:scale-[1.02]"
                        >
                            Create Account
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleSocialLogin('google')}
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleSocialLogin('github')}
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <Github className="h-5 w-5 text-gray-900" />
                            </button>
                            <button
                                onClick={() => handleSocialLogin('linkedin')}
                                className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <Linkedin className="h-5 w-5 text-[#0077b5]" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary/80 hover:underline">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
