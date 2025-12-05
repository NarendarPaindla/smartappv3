import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Shield, Lock, Fingerprint, Smartphone } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';

const ToggleItem = ({ icon: Icon, title, description, value, onValueChange, iconColor = "#2563EB" }: any) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
        <View className="flex-row items-center flex-1 mr-4">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Icon size={20} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-gray-900 font-semibold">{title}</Text>
                {description && <Text className="text-gray-500 text-sm mt-0.5">{description}</Text>}
            </View>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#D1D5DB", true: "#2563EB" }}
            thumbColor={value ? "#ffffff" : "#f4f3f4"}
        />
    </View>
);

export default function SecurityScreen() {
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    const handleChangePassword = () => {
        Alert.alert('Change Password', 'This feature will be available soon.');
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <View className="items-center py-8">
                    <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                        <Shield size={40} color="#059669" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">Account Secured</Text>
                    <Text className="text-gray-500 text-center mt-2 px-10">Your account is protected with standard encryption.</Text>
                </View>

                <Text className="text-gray-500 font-medium mb-2 uppercase text-xs">Access Control</Text>
                <View className="bg-white rounded-xl px-4 shadow-sm border border-gray-100 mb-6">
                    <ToggleItem
                        icon={Fingerprint}
                        title="Biometric Login"
                        description="Use FaceID or Fingerprint to sign in"
                        value={biometricsEnabled}
                        onValueChange={setBiometricsEnabled}
                        iconColor="#7C3AED"
                    />
                    <ToggleItem
                        icon={Smartphone}
                        title="Two-Factor Auth"
                        description="Add an extra layer of security"
                        value={twoFactorEnabled}
                        onValueChange={setTwoFactorEnabled}
                        iconColor="#EA580C"
                    />
                </View>

                <Button
                    variant="outline"
                    title="Change Password"
                    onPress={handleChangePassword}
                    className="bg-white border-gray-300"
                />
            </View>
        </ScrollView>
    );
}
