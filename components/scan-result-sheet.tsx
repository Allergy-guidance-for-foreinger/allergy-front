import { useCallback, useMemo, type Ref } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type {
    FoodAnalysisResult,
    ScanItem,
    ScanMatchedReligiousIngredientItem,
} from '@/api/scan';
import type { SuccessResponse } from '@/api/client';
import { getLocalizedLabelByCode } from '@/constants/allergyList';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/i18n';

interface Props {
    result: FoodAnalysisResult | null;
    imageUri?: string | null;
    debugResponse?: SuccessResponse<FoodAnalysisResult> | null;
    ref?: Ref<BottomSheetModal>;
}

// 칩 한 줄 묶음. danger=true면 빨강 강조 + ⚠ 아이콘.
function ChipRow({
    items,
    lang,
    danger = false,
}: {
    items: ScanItem[];
    lang: string;
    danger?: boolean;
}) {
    return (
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {items.map((item, index) => {
                const rawLabel =
                    typeof item === 'string'
                        ? item
                        : item.name ?? item.code ?? '';
                const label =
                    typeof item === 'string'
                        ? getLocalizedLabelByCode(item, lang)
                        : item.name ?? getLocalizedLabelByCode(item.code ?? '', lang);
                return (
                    <View
                        key={`${danger ? 'd' : 'n'}-${index}-${
                            typeof item === 'string'
                                ? item
                                : item.code ?? item.name ?? ''
                        }`}
                        className={`flex-row items-center rounded-full px-3 py-1.5 border ${
                            danger ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200'
                        }`}
                        style={{ gap: 4 }}
                    >
                        {danger ? (
                            <Ionicons name="warning" size={14} color="#b91c1c" />
                        ) : null}
                        <Text className={danger ? 'text-red-700 font-semibold' : 'text-gray-700'}>
                            {rawLabel ? label : ''}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={{ gap: 8 }}>
            <Text className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
                {title}
            </Text>
            {children}
        </View>
    );
}

function ChipPill({
    label,
    tone = 'gray',
}: {
    label: string;
    tone?: 'gray' | 'red' | 'amber';
}) {
    const toneClass =
        tone === 'red'
            ? 'border-red-300 bg-red-100 text-red-700'
            : tone === 'amber'
              ? 'border-amber-200 bg-amber-50 text-amber-900'
              : 'border-gray-200 bg-white text-gray-700';

    return (
        <View className={`rounded-full border px-3 py-1.5 ${toneClass}`}>
            <Text className="text-[13px] font-semibold">{label}</Text>
        </View>
    );
}

function ReligiousCard({ item }: { item: ScanMatchedReligiousIngredientItem }) {
    return (
        <View className="rounded-2xl border border-amber-200 bg-white px-3 py-3">
            <View className="flex-row items-center justify-between gap-2">
                <Text className="text-sm font-semibold text-amber-900" numberOfLines={1}>
                    {item.ingredientName || item.ingredientCode}
                </Text>
                <Text className="text-xs font-semibold text-amber-700">
                    {Math.round((item.confidence ?? 0) * 100)}%
                </Text>
            </View>
            <View className="mt-2 flex-row flex-wrap" style={{ gap: 6 }}>
                {item.matchedReligiousRestrictions.map((restriction) => (
                    <View
                        key={`${restriction.religiousRestrictionCode}-${restriction.religiousRestrictionName}`}
                        className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1"
                    >
                        <Text className="text-xs font-semibold text-amber-900">
                            {restriction.religiousRestrictionName}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function ScanResultSheet({ result, imageUri, debugResponse, ref }: Props) {
    const t = useTranslation();
    const language = useAppStore((state) => state.language);
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['60%', '92%'], []);

    const confidence = useMemo(() => {
        if (!result) return null;
        const raw = result.imageConfidence;
        if (!Number.isFinite(raw)) return null;
        const percent = raw <= 1 ? raw * 100 : raw;
        return Math.max(0, Math.min(100, Math.round(percent)));
    }, [result]);

    const handleLogDebugResponse = () => {
        if (!debugResponse) return;
        // 개발자용: 서버 원본 응답을 터미널에 그대로 확인
        console.log('[SCAN_API_RESPONSE]', JSON.stringify(debugResponse, null, 2));
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.4}
                pressBehavior="close"
            />
        ),
        []
    );

    return (
        <BottomSheetModal
            ref={ref}
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            handleIndicatorStyle={{ backgroundColor: '#D1D5DB' }}
        >
            <BottomSheetScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 24 + insets.bottom }}
            >
                {!result ? (
                    <Text className="text-gray-500 text-center py-10">
                        {t('scan.result.empty')}
                    </Text>
                ) : (
                    <View style={{ gap: 20 }}>
                        {imageUri ? (
                            <View className="rounded-3xl border border-gray-200 bg-white p-3">
                                <Text className="mb-3 text-sm font-semibold text-gray-500">
                                    {t('scan.result.uploadedImage')}
                                </Text>
                                <Image
                                    source={{ uri: imageUri }}
                                    className="w-full rounded-2xl bg-gray-100"
                                    style={{ aspectRatio: 4 / 3 }}
                                    resizeMode="cover"
                                />
                            </View>
                        ) : null}

                        <View
                            className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-4"
                            style={{ gap: 12 }}
                        >
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-semibold text-gray-500">
                                    {t('scan.result.foodInfo')}
                                </Text>
                                {__DEV__ && debugResponse ? (
                                    <TouchableOpacity
                                        onPress={handleLogDebugResponse}
                                        className="rounded-full border border-gray-300 bg-white px-3 py-1"
                                    >
                                        <Text className="text-xs font-semibold text-gray-700">
                                            Log JSON
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                            <View>
                                <Text className="text-2xl font-bold text-gray-900">
                                    {result.identifiedFoodTranslationName ||
                                        result.identifiedFoodKoreanName}
                                    {result.spicyLevel > 0
                                        ? ` ${'🌶️'.repeat(result.spicyLevel)}`
                                        : ''}
                                </Text>
                                {result.identifiedFoodKoreanName ? (
                                    <Text className="mt-1 text-base text-gray-500">
                                        {result.identifiedFoodKoreanName}
                                        {result.identifiedFoodPronunciationName
                                            ? ` · ${result.identifiedFoodPronunciationName}`
                                            : ''}
                                    </Text>
                                ) : null}
                            </View>

                            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                <ChipPill
                                    label={`${t('scan.result.confidence')}: ${
                                        confidence !== null ? `${confidence}%` : '-'
                                    }`}
                                    tone="gray"
                                />
                            </View>
                            {result.ingredients.length > 0 ? (
                                <Section title={t('scan.result.ingredients')}>
                                    <ChipRow items={result.ingredients} lang={language} />
                                </Section>
                            ) : null}

                            {result.matchedAllergies.length > 0 ? (
                                <Section title={t('scan.result.matchedAllergies')}>
                                    <ChipRow items={result.matchedAllergies} lang={language} danger />
                                </Section>
                            ) : null}

                            {result.matchedReligiousIngredients.length > 0 ? (
                                <Section title={t('scan.result.matchedReligious')}>
                                    <View style={{ gap: 10 }}>
                                        {result.matchedReligiousIngredients.map((item, index) => (
                                            <ReligiousCard
                                                key={`${item.ingredientCode}-${item.ingredientName}-${index}`}
                                                item={item}
                                            />
                                        ))}
                                    </View>
                                </Section>
                            ) : null}
                        </View>

                        {result.identifiedFoodNameReason ? (
                            <View className="rounded-3xl border border-gray-200 bg-white px-4 py-4">
                                <Text className="mb-3 text-sm font-semibold text-gray-500">
                                    {t('scan.result.reason')}
                                </Text>
                                <Text className="text-sm leading-6 text-gray-600">
                                    {result.identifiedFoodNameReason}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}

export default ScanResultSheet;
