import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const Calculators = () => {
    const [activeTab, setActiveTab] = useState('emi');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Financial Calculators</h2>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setActiveTab('emi')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'emi' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <Calculator className="w-4 h-4" />
                        EMI Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab('sip')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'sip' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Investment (SIP)
                    </button>
                </div>
            </div>

            {activeTab === 'emi' ? <EMICalculator /> : <SIPCalculator />}
        </div>
    );
};

const EMICalculator = () => {
    const [amount, setAmount] = useState(100000);
    const [rate, setRate] = useState(10);
    const [tenure, setTenure] = useState(12); // Months

    const calculateEMI = () => {
        const r = rate / 12 / 100;
        const emi = (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
        return isNaN(emi) ? 0 : emi;
    };

    const emi = calculateEMI();
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - amount;

    // Generate chart data
    const chartData = [];
    let balance = amount;
    const r = rate / 12 / 100;
    for (let i = 1; i <= tenure; i++) {
        const interest = balance * r;
        const principal = emi - interest;
        balance -= principal;
        chartData.push({
            month: i,
            balance: Math.max(0, balance),
            interestPaid: totalInterest - (totalPayment - (emi * i) - balance) // Approximate cumulative interest
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loan Amount</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <input
                        type="range"
                        min="1000"
                        max="10000000"
                        step="1000"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (% p.a)</label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="30"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tenure (Months)</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={tenure}
                            onChange={(e) => setTenure(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="360"
                        step="1"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                        <p className="text-sm text-indigo-600 font-medium">Monthly EMI</p>
                        <p className="text-2xl font-bold text-indigo-900">{emi.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-green-600 font-medium">Total Interest</p>
                        <p className="text-2xl font-bold text-green-900">{totalInterest.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-sm text-blue-600 font-medium">Total Payment</p>
                        <p className="text-2xl font-bold text-blue-900">{totalPayment.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Loan Balance Over Time</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="balance" stroke="#4F46E5" fill="#E0E7FF" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const SIPCalculator = () => {
    const [investment, setInvestment] = useState(5000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    const calculateSIP = () => {
        const i = rate / 12 / 100;
        const n = years * 12;
        const fv = investment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        return isNaN(fv) ? 0 : fv;
    };

    const futureValue = calculateSIP();
    const totalInvested = investment * years * 12;
    const estimatedReturns = futureValue - totalInvested;

    // Generate chart data
    const chartData = [];
    const i = rate / 12 / 100;
    for (let y = 1; y <= years; y++) {
        const n = y * 12;
        const fv = investment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        const invested = investment * n;
        chartData.push({
            year: y,
            invested: invested,
            value: fv
        });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Investment</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={investment}
                            onChange={(e) => setInvestment(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <input
                        type="range"
                        min="500"
                        max="100000"
                        step="500"
                        value={investment}
                        onChange={(e) => setInvestment(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Return Rate (% p.a)</label>
                    <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="30"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Period (Years)</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="number"
                            value={years}
                            onChange={(e) => setYears(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={years}
                        onChange={(e) => setYears(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                        <p className="text-sm text-indigo-600 font-medium">Invested Amount</p>
                        <p className="text-2xl font-bold text-indigo-900">{totalInvested.toFixed(0)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-green-600 font-medium">Est. Returns</p>
                        <p className="text-2xl font-bold text-green-900">{estimatedReturns.toFixed(0)}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl col-span-2">
                        <p className="text-sm text-blue-600 font-medium">Total Value</p>
                        <p className="text-3xl font-bold text-blue-900">{futureValue.toFixed(0)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Growth Over Time</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Total Value" />
                            <Area type="monotone" dataKey="invested" stackId="2" stroke="#8884d8" fill="#8884d8" name="Invested" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Calculators;
