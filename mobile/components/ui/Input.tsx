import { TextInput, View, Text, TextInputProps } from 'react-native';
import { clsx } from 'clsx';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className, ...props }: InputProps) => {
    return (
        <View className="mb-4">
            {label && <Text className="mb-1 text-gray-700 font-medium">{label}</Text>}
            <View className="relative">
                {icon && (
                    <View className="absolute left-3 top-3 z-10">
                        {icon}
                    </View>
                )}
                <TextInput
                    className={clsx(
                        "border rounded-lg py-3 bg-white text-gray-900",
                        icon ? "pl-10 pr-4" : "px-4",
                        error ? "border-red-500" : "border-gray-300 focus:border-blue-500",
                        className
                    )}
                    placeholderTextColor="#9CA3AF"
                    {...props}
                />
            </View>
            {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
        </View>
    );
};
