import { useCallback, useMemo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import type { ScanItem, ScanMatchedReligiousIngredientItem } from '@/api/scan';
import type { SuccessResponse } from '@/api/client';
import { getLocalizedLabelByCode } from '@/constants/allergyList';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/i18n';

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
                const keyBase =
                    typeof item === 'string'
                        ? item
                        : `${item.code ?? ''}-${item.name ?? ''}`;
                const label =
                    typeof item === 'string'
                        ? getLocalizedLabelByCode(item, lang)
                        : item.name ?? getLocalizedLabelByCode(item.code ?? '', lang);

                return (
                    <View
                        key={`${danger ? 'd' : 'n'}-${index}-${keyBase}`}
                        className={`rounded-full border px-3 py-1.5 ${
                            danger ? 'border-red-300 bg-red-100' : 'border-gray-200 bg-white'
                        }`}
                    >
                        <Text className={danger ? 'text-red-700 font-semibold' : 'text-gray-700'}>
                            {label}
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

type ScanResultContentProps = {
    result: {
        identifiedFoodKoreanName: string;
        identifiedFoodTranslationName: string;
        identifiedFoodPronunciationName: string;
        identifiedFoodNameReason: string;
        imageConfidence: number;
        spicyLevel: number;
        ingredients: ScanItem[];
        matchedAllergies: ScanItem[];
        matchedReligiousIngredients: ScanMatchedReligiousIngredientItem[];
    };
    imageUri?: string | null;
    debugResponse?: SuccessResponse<unknown> | null;
};

export default function ScanResultContent({
    result,
    imageUri,
    debugResponse,
}: ScanResultContentProps) {
    const t = useTranslation();
    const language = useAppStore((state) => state.language);

    const confidence = useMemo(() => {
        const raw = result.imageConfidence;
        if (!Number.isFinite(raw)) return null;
        const percent = raw <= 1 ? raw * 100 : raw;
        return Math.max(0, Math.min(100, Math.round(percent)));
    }, [result.imageConfidence]);

    const handleLogDebugResponse = useCallback(() => {
        if (!debugResponse) return;
        console.log('[SCAN_API_RESPONSE]', JSON.stringify(debugResponse, null, 2));
    }, [debugResponse]);

    return (
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
                </View>

                <View>
                    <Text className="text-2xl font-bold text-gray-900">
                        {result.identifiedFoodTranslationName || result.identifiedFoodKoreanName}
                        {result.spicyLevel > 0 ? ` ${'🌶️'.repeat(result.spicyLevel)}` : ''}
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
    );
}
