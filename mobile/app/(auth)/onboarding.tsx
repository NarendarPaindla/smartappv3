import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Wallet, PieChart, ShieldCheck, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Smart Finance',
        description: 'Take control of your money with intelligent tracking and insights.',
        icon: <Wallet size={100} color="#2563EB" />,
        color: '#EFF6FF'
    },
    {
        id: '2',
        title: 'Detailed Analytics',
        description: 'Visualize your spending habits with beautiful, interactive charts.',
        icon: <PieChart size={100} color="#7C3AED" />,
        color: '#F5F3FF'
    },
    {
        id: '3',
        title: 'Secure & Synced',
        description: 'Your data is encrypted and synced across all your devices in real-time.',
        icon: <ShieldCheck size={100} color="#059669" />,
        color: '#ECFDF5'
    }
];

const Onboarding = () => {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.replace('/(auth)/login');
        }
    };

    const handleSkip = () => {
        router.replace('/(auth)/login');
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderItem = ({ item, index }: any) => {
        return (
            <View style={{ width, height: height * 0.7, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Animated.View
                    entering={FadeInDown.delay(200).springify()}
                    className="mb-10 p-10 rounded-full bg-white shadow-lg"
                    style={{ shadowColor: item.color, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 }}
                >
                    {item.icon}
                </Animated.View>
                <Animated.Text
                    entering={FadeInDown.delay(300).springify()}
                    className="text-3xl font-bold text-gray-900 text-center mb-4"
                >
                    {item.title}
                </Animated.Text>
                <Animated.Text
                    entering={FadeInDown.delay(400).springify()}
                    className="text-lg text-gray-500 text-center px-4 leading-8"
                >
                    {item.description}
                </Animated.Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-end p-4">
                <TouchableOpacity onPress={handleSkip}>
                    <Text className="text-gray-500 font-medium text-base">Skip</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                keyExtractor={item => item.id}
            />

            <View className="h-[20%] justify-between pb-10 px-6">
                {/* Paginator */}
                <View className="flex-row justify-center gap-2 mb-6">
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`}
                        />
                    ))}
                </View>

                {/* Button */}
                <TouchableOpacity
                    onPress={handleNext}
                    className="bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-blue-200"
                >
                    <Text className="text-white font-bold text-lg mr-2">
                        {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    {currentIndex !== SLIDES.length - 1 && <ArrowRight size={20} color="white" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

export default Onboarding;
