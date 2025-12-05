import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ChevronRight, MessageCircle, Mail, FileText, ExternalLink } from 'lucide-react-native';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <View className="bg-white p-4 rounded-xl border border-gray-100 mb-2 shadow-sm">
        <Text className="font-semibold text-gray-900 mb-2">{question}</Text>
        <Text className="text-gray-500 leading-5">{answer}</Text>
    </View>
);

const LinkItem = ({ icon: Icon, title, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center bg-white p-4 rounded-xl border border-gray-100 mb-2 shadow-sm active:bg-gray-50"
    >
        <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
            <Icon size={20} color="#2563EB" />
        </View>
        <Text className="flex-1 font-semibold text-gray-900">{title}</Text>
        <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
);

export default function HelpScreen() {
    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="p-4">
                <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</Text>
                    <FAQItem
                        question="How do I export my data?"
                        answer="Go to Settings > Notifications & Reports to schedule automated CSV exports, or use the Reports tab to download manually."
                    />
                    <FAQItem
                        question="Is my financial data safe?"
                        answer="Yes, we use industry-standard encryption to protect your data. You can also enable Biometric Login in Security settings."
                    />
                    <FAQItem
                        question="Can I customize budget categories?"
                        answer="Yes, you can add or edit categories directly from the Daily Entry screen when adding a transaction."
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Contact Support</Text>
                    <LinkItem
                        icon={Mail}
                        title="Email Support"
                        onPress={() => Linking.openURL('mailto:support@smartspend.com')}
                    />
                    <LinkItem
                        icon={MessageCircle}
                        title="Live Chat"
                        onPress={() => { }}
                    />
                </View>

                <View>
                    <Text className="text-xl font-bold text-gray-900 mb-4">Legal</Text>
                    <LinkItem
                        icon={FileText}
                        title="Privacy Policy"
                        onPress={() => Linking.openURL('https://example.com/privacy')}
                    />
                    <LinkItem
                        icon={FileText}
                        title="Terms of Service"
                        onPress={() => Linking.openURL('https://example.com/terms')}
                    />
                </View>
            </View>
        </ScrollView>
    );
}
