import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Check, CreditCard, Shield } from 'lucide-react';

const Subscription = () => {
    const { user, updateUserProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (plan) => {
        setLoading(true);
        try {
            // 1. Create Order
            const { data: order } = await api.post('/payment/create-order', { plan });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Smart Spend App",
                description: `${plan === 'monthly' ? 'Monthly' : 'Annual'} Subscription`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payment/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: plan
                        });
                        if (verifyRes.data.status === 'success') {
                            alert('Payment Successful!');
                            // Fetch fresh profile to update context
                            try {
                                const { data: profile } = await api.get('/auth/me');
                                updateUserProfile(profile);
                            } catch (e) {
                                console.error('Failed to refresh profile', e);
                            }
                            navigate('/');
                        }
                    } catch (err) {
                        console.error(err);
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: '' // Can be added if available in user object
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error('Subscription failed:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Choose Your Plan
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Your free trial has ended. Subscribe to continue managing your finances effectively.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {/* Monthly Plan */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:border-primary transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                            FLEXIBLE
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Monthly</h3>
                        <div className="mt-4 flex items-baseline text-gray-900">
                            <span className="text-5xl font-extrabold tracking-tight">₹100</span>
                            <span className="ml-1 text-xl font-semibold text-gray-500">/month</span>
                        </div>
                        <ul className="mt-6 space-y-4">
                            {['Full Dashboard Access', 'Unlimited Transactions', 'Budget Analytics', 'Export Reports'].map((feature) => (
                                <li key={feature} className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
                                    <span className="ml-3 text-gray-500">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSubscribe('monthly')}
                            disabled={loading}
                            className="mt-8 w-full bg-primary text-white rounded-xl py-3 px-4 font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Subscribe Monthly
                                </>
                            )}
                        </button>
                    </div>

                    {/* Annual Plan */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-primary p-8 relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            BEST VALUE
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Annual</h3>
                        <div className="mt-4 flex items-baseline text-gray-900">
                            <span className="text-5xl font-extrabold tracking-tight">₹1000</span>
                            <span className="ml-1 text-xl font-semibold text-gray-500">/year</span>
                        </div>
                        <p className="mt-1 text-sm text-green-600 font-medium">Save ₹200 (2 months free)</p>
                        <ul className="mt-6 space-y-4">
                            {['All Monthly Features', 'Priority Support', 'Advanced Insights', 'Early Access to Features'].map((feature) => (
                                <li key={feature} className="flex">
                                    <Check className="flex-shrink-0 w-6 h-6 text-green-500" />
                                    <span className="ml-3 text-gray-500">{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleSubscribe('annual')}
                            disabled={loading}
                            className="mt-8 w-full bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl py-3 px-4 font-semibold hover:from-primary/90 hover:to-blue-600/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Subscribe Annually
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
