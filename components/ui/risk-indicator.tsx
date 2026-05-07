import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RiskLevel } from '@/data/mockMenu';

interface RiskIndicatorProps {
    level: RiskLevel | null;
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
    if (level === 'high') {
        return (
            <View className="rounded-full bg-red-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">High</Text>
            </View>
        );
    }
    if (level === 'medium') {
        return (
            <View className="rounded-full bg-yellow-400 px-2.5 py-1">
                <Text className="text-xs font-bold text-yellow-900">Medium</Text>
            </View>
        );
    }
    if (level === 'low') {
        return (
            <View className="rounded-full bg-green-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">Low</Text>
            </View>
        );
    }
    // 알러지 매칭 없음 → 안전 표시
    return <Ionicons name="checkmark-circle" size={20} color="#16a34a" />;
}
