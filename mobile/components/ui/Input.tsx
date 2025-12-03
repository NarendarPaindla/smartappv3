import { TextInput, View, Text, TextInputProps } from 'react-native';
import { clsx } from 'clsx';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
    return (
        <View className="mb-4">
            {label && <Text className="mb-1 text-gray-700 font-medium">{label}</Text>}
            <TextInput
                className={clsx(
                    "border rounded-lg px-4 py-3 bg-white text-gray-900",
                    error ? "border-red-500" : "border-gray-300 focus:border-blue-500",
                    className
                )}
                placeholderTextColor="#9CA3AF"
                {...props}
            />
            {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
        </View>
    );
};
