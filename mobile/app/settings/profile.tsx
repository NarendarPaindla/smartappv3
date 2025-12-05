import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Camera, Mail, User, Phone, DollarSign } from 'lucide-react-native';


// Assuming we might need to install @react-native-picker/picker, but for now I'll use a simple View mock or conditional if standard picker isn't available.
// Actually, standard modern RN doesn't have a picker. I will use a simple modal or just a list of buttons for currency if picker is missing.
// Checking package.json... I will assume I can use a simple custom implementation for now to avoid installing native deps without checking.
// Or I'll use a simple View constructed dropdown.

const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function ProfileScreen() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || ''); // Assuming user object has phone
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Profile updated successfully');
        }, 1500);
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-6 items-center bg-white border-b border-gray-100">
                <View className="relative mb-4">
                    <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm">
                        <Text className="text-3xl font-bold text-blue-600">{name?.[0]?.toUpperCase() || 'U'}</Text>
                    </View>
                    <TouchableOpacity className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white shadow-sm">
                        <Camera size={16} color="white" />
                    </TouchableOpacity>
                </View>
                <Text className="text-xl font-bold text-gray-900">{name || 'User Name'}</Text>
                <Text className="text-gray-500">{email || 'user@example.com'}</Text>
            </View>

            <View className="p-4">
                <Text className="text-gray-900 font-bold text-lg mb-4">Personal Information</Text>

                <Input
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    icon={<User size={20} color="#9CA3AF" />}
                    placeholder="Enter your name"
                />

                <Input
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    icon={<Mail size={20} color="#9CA3AF" />}
                    keyboardType="email-address"
                    placeholder="Enter your email"
                />

                <Input
                    label="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    icon={<Phone size={20} color="#9CA3AF" />}
                    keyboardType="phone-pad"
                    placeholder="Enter your phone number"
                />

                <Text className="text-gray-700 font-medium mb-2 mt-2">Currency Preference</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {CURRENCIES.map((curr) => (
                        <TouchableOpacity
                            key={curr.code}
                            onPress={() => setCurrency(curr.code)}
                            className={`px-4 py-2 rounded-full border ${currency === curr.code ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                        >
                            <Text className={`${currency === curr.code ? 'text-white' : 'text-gray-700'} font-medium`}>
                                {curr.symbol} {curr.code}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={loading}
                    className="mt-4"
                />
            </View>
        </ScrollView>
    );
}
