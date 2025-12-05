import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, Mail, FileText, Calendar, Clock, AlertTriangle } from 'lucide-react-native';

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

export default function NotificationsScreen() {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [budgetAlerts, setBudgetAlerts] = useState(true);

    // Scheduled Exports
    const [scheduledExports, setScheduledExports] = useState(false);
    const [exportFrequency, setExportFrequency] = useState('Weekly'); // Weekly, Monthly, Yearly

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <Text className="text-gray-500 font-medium mb-2 uppercase text-xs">General</Text>
                <View className="bg-white rounded-xl px-4 shadow-sm border border-gray-100 mb-6">
                    <ToggleItem
                        icon={Bell}
                        title="Push Notifications"
                        description="Receive real-time alerts on your device"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                    />
                    <ToggleItem
                        icon={Mail}
                        title="Email Notifications"
                        description="Get important updates via email"
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                    />
                    <ToggleItem
                        icon={AlertTriangle}
                        title="Budget Alerts"
                        description="Get notified when you exceed budget limits"
                        value={budgetAlerts}
                        onValueChange={setBudgetAlerts}
                        iconColor="#DC2626"
                    />
                </View>

                <Text className="text-gray-500 font-medium mb-2 uppercase text-xs">Automated Reports</Text>
                <View className="bg-white rounded-xl px-4 shadow-sm border border-gray-100 mb-6">
                    <ToggleItem
                        icon={FileText}
                        title="Scheduled Exports"
                        description="Automatically export your data as CSV"
                        value={scheduledExports}
                        onValueChange={setScheduledExports}
                        iconColor="#059669"
                    />

                    {scheduledExports && (
                        <View className="py-4 border-t border-gray-100">
                            <Text className="text-gray-900 font-semibold mb-3 flex-row items-center">
                                <Clock size={16} color="#4B5563" className="mr-2" /> Export Frequency
                            </Text>
                            <View className="flex-row gap-2">
                                {['Weekly', 'Monthly', 'Yearly'].map((freq) => (
                                    <TouchableOpacity
                                        key={freq}
                                        onPress={() => setExportFrequency(freq)}
                                        className={`px-4 py-2 rounded-lg border ${exportFrequency === freq ? 'bg-green-600 border-green-600' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <Text className={`${exportFrequency === freq ? 'text-white' : 'text-gray-700'} font-medium`}>
                                            {freq}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text className="text-gray-500 text-xs mt-3">
                                Reports will be sent to your email in <Text className="font-bold">CSV</Text> format.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
