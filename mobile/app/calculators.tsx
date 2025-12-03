import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { clsx } from 'clsx';
import Slider from '@react-native-community/slider';


export default function Calculators() {
    const [activeTab, setActiveTab] = useState<'emi' | 'sip'>('emi');

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ title: 'Calculators', headerShadowVisible: false, headerStyle: { backgroundColor: '#F9FAFB' } }} />

            <View className="px-4 py-2">
                <View className="flex-row bg-white p-1 rounded-xl border border-gray-200">
                    <TouchableOpacity
                        onPress={() => setActiveTab('emi')}
                        className={clsx("flex-1 py-2 rounded-lg items-center", activeTab === 'emi' ? "bg-blue-50" : "bg-transparent")}
                    >
                        <Text className={clsx("font-medium", activeTab === 'emi' ? "text-blue-600" : "text-gray-500")}>EMI Calculator</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('sip')}
                        className={clsx("flex-1 py-2 rounded-lg items-center", activeTab === 'sip' ? "bg-blue-50" : "text-gray-500")}
                    >
                        <Text className={clsx("font-medium", activeTab === 'sip' ? "text-blue-600" : "text-gray-500")}>SIP Calculator</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {activeTab === 'emi' ? <EMICalculator /> : <SIPCalculator />}
            </ScrollView>
        </SafeAreaView>
    );
}

function EMICalculator() {
    const [amount, setAmount] = useState(100000);
    const [rate, setRate] = useState(10);
    const [tenure, setTenure] = useState(12);

    const calculateEMI = () => {
        const r = rate / 12 / 100;
        const emi = (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
        return isNaN(emi) ? 0 : emi;
    };

    const emi = calculateEMI();
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - amount;

    return (
        <View className="space-y-6">
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <InputSlider label="Loan Amount" value={amount} min={1000} max={10000000} step={1000} onChange={setAmount} prefix="₹" />
                <InputSlider label="Interest Rate (% p.a)" value={rate} min={1} max={30} step={0.1} onChange={setRate} />
                <InputSlider label="Tenure (Months)" value={tenure} min={1} max={360} step={1} onChange={setTenure} />
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1 bg-indigo-50 p-4 rounded-xl">
                    <Text className="text-xs text-indigo-600 font-medium mb-1">Monthly EMI</Text>
                    <Text className="text-xl font-bold text-indigo-900">₹{Math.round(emi).toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-green-50 p-4 rounded-xl">
                    <Text className="text-xs text-green-600 font-medium mb-1">Total Interest</Text>
                    <Text className="text-xl font-bold text-green-900">₹{Math.round(totalInterest).toLocaleString()}</Text>
                </View>
            </View>
            <View className="bg-blue-50 p-4 rounded-xl">
                <Text className="text-xs text-blue-600 font-medium mb-1">Total Payment</Text>
                <Text className="text-2xl font-bold text-blue-900">₹{Math.round(totalPayment).toLocaleString()}</Text>
            </View>
        </View>
    );
}

function SIPCalculator() {
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

    return (
        <View className="space-y-6">
            <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <InputSlider label="Monthly Investment" value={investment} min={500} max={100000} step={500} onChange={setInvestment} prefix="₹" />
                <InputSlider label="Expected Return (%)" value={rate} min={1} max={30} step={0.1} onChange={setRate} />
                <InputSlider label="Time Period (Years)" value={years} min={1} max={50} step={1} onChange={setYears} />
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1 bg-indigo-50 p-4 rounded-xl">
                    <Text className="text-xs text-indigo-600 font-medium mb-1">Invested</Text>
                    <Text className="text-xl font-bold text-indigo-900">₹{Math.round(totalInvested).toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-green-50 p-4 rounded-xl">
                    <Text className="text-xs text-green-600 font-medium mb-1">Est. Returns</Text>
                    <Text className="text-xl font-bold text-green-900">₹{Math.round(estimatedReturns).toLocaleString()}</Text>
                </View>
            </View>
            <View className="bg-blue-50 p-4 rounded-xl">
                <Text className="text-xs text-blue-600 font-medium mb-1">Total Value</Text>
                <Text className="text-2xl font-bold text-blue-900">₹{Math.round(futureValue).toLocaleString()}</Text>
            </View>
        </View>
    );
}

function InputSlider({ label, value, min, max, step, onChange, prefix = '' }: any) {
    return (
        <View className="mb-6">
            <View className="flex-row justify-between mb-2">
                <Text className="text-gray-700 font-medium">{label}</Text>
                <Text className="text-blue-600 font-bold">{prefix}{value}</Text>
            </View>
            <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={min}
                maximumValue={max}
                step={step}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor="#2563EB"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#2563EB"
            />
        </View>
    );
}
