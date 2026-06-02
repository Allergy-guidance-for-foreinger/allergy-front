import { Text, View } from 'react-native';
import type { RiskLevel } from '@/api/cafeteria';
import { useTranslation } from '@/lib/i18n';

interface RiskIndicatorProps {
    level: RiskLevel | null;
}

export function RiskIndicator({ level }: RiskIndicatorProps) {
    const t = useTranslation();
    if (level === 'danger') {
        return (
            <View className="rounded-full bg-red-700 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">{t('risk.danger')}</Text>
            </View>
        );
    }
    if (level === 'high') {
        return (
            <View className="rounded-full bg-red-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">{t('risk.high')}</Text>
            </View>
        );
    }
    if (level === 'medium') {
        return (
            <View className="rounded-full bg-yellow-400 px-2.5 py-1">
                <Text className="text-xs font-bold text-yellow-900">{t('risk.medium')}</Text>
            </View>
        );
    }
    if (level === 'low') {
        return (
            <View className="rounded-full bg-green-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">{t('risk.low')}</Text>
            </View>
        );
    }
    if (level === 'safe') {
        return (
            <View className="rounded-full bg-green-500 px-2.5 py-1">
                <Text className="text-xs font-bold text-white">{t('risk.safe')}</Text>
            </View>
        );
    }
    return (
        <View className="rounded-full bg-gray-400 px-2.5 py-1">
            <Text className="text-xs font-bold text-white">{t('risk.unknown')}</Text>
        </View>
    );
}
