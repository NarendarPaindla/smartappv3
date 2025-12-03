import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { clsx } from 'clsx';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
}

export const Button = ({ title, variant = 'primary', loading, className, disabled, ...props }: ButtonProps) => {
    const baseStyles = "rounded-lg py-3 items-center justify-center flex-row";
    const variants = {
        primary: "bg-blue-600 active:bg-blue-700",
        secondary: "bg-gray-200 active:bg-gray-300",
        outline: "border border-gray-300 bg-transparent active:bg-gray-50",
        ghost: "bg-transparent active:bg-gray-100",
    };
    const textStyles = {
        primary: "text-white font-semibold",
        secondary: "text-gray-900 font-semibold",
        outline: "text-gray-700 font-medium",
        ghost: "text-blue-600 font-medium",
    };

    return (
        <TouchableOpacity
            className={clsx(baseStyles, variants[variant], disabled && "opacity-50", className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : 'black'} />
            ) : (
                <Text className={clsx(textStyles[variant])}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};
