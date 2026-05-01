import { ReactNode } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { cn } from '@/cn';

type ActionButtonProps = {
    children: ReactNode;
    onPress: () => void;
    className?: string;
    textClassName?: string;
    disabled?: boolean;
};

export function ActionButton({
    children,
    onPress,
    className,
    textClassName,
    disabled = false,
}: ActionButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className={cn(
                'w-52 bg-black py-3 rounded-3xl items-center justify-center active:opacity-70',
                disabled && 'opacity-50',
                className
            )}
        >
            {typeof children === 'string' ? (
                <Text className={cn('text-white text-lg font-bold', textClassName)}>{children}</Text>
            ) : (
                <View>{children}</View>
            )}
        </TouchableOpacity>
    );
}
