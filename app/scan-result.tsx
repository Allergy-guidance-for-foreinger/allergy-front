import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScanResultContent from '@/components/scan-result-content';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/i18n';

export default function ScanResultScreen() {
    const t = useTranslation();
    const result = useAppStore((state) => state.currentScanResponse?.data ?? null);
    const imageUri = useAppStore((state) => state.currentScanImageUri);
    const clearCurrentScanResult = useAppStore((state) => state.clearCurrentScanResult);

    useEffect(() => {
        return () => {
            clearCurrentScanResult();
        };
    }, [clearCurrentScanResult]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-2 pb-3 flex-row items-center gap-3">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-12 w-12 items-center justify-center rounded-full bg-white-100 active:bg-gray-200"
                    accessibilityRole="button"
                    accessibilityLabel={t('a11y.goBack')}
                >
                    <Ionicons name="chevron-back" size={30} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
                {result ? (
                    <ScanResultContent result={result} imageUri={imageUri} debugResponse={useAppStore.getState().currentScanResponse} />
                ) : (
                    <View className="items-center justify-center py-24">
                        <Text className="text-base font-semibold text-gray-900">
                            {t('scan.result.empty')}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
