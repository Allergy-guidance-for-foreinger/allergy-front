import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

type ScreenHeaderProps = {
    title: string;
    onBackPress?: () => void;
};

export default function ScreenHeader({ title, onBackPress }: ScreenHeaderProps) {
    return (
        <View className="px-5 pt-2 pb-3 flex-row items-center gap-3">
            <TouchableOpacity
                onPress={onBackPress ?? (() => router.back())}
                className="h-12 w-12 items-center justify-center rounded-full bg-white-100 active:bg-gray-200"
                accessibilityRole="button"
                accessibilityLabel="Go back"
            >
                <Ionicons name="chevron-back" size={30} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-gray-900 flex-1" numberOfLines={1}>
                {title}
            </Text>
        </View>
    );
}
