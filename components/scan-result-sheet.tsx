import { useCallback, useMemo, type Ref } from 'react';
import { Text, View } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetScrollView,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { FoodAnalysisResult } from '@/api/scan';
import { getLocalizedLabelByCode } from '@/constants/allergyList';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/lib/i18n';

interface Props {
    result: FoodAnalysisResult | null;
    ref?: Ref<BottomSheetModal>;
}

// 칩 한 줄 묶음. danger=true면 빨강 강조 + ⚠ 아이콘.
function ChipRow({
    items,
    lang,
    danger = false,
}: {
    items: string[];
    lang: string;
    danger?: boolean;
}) {
    return (
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {items.map((code) => {
                // 서버가 코드('EGG')를 주면 언어별 라벨로, 이름이면 그대로 표시.
                const label = getLocalizedLabelByCode(code, lang);
                return (
                    <View
                        key={`${danger ? 'd' : 'n'}-${code}`}
                        className={`flex-row items-center rounded-full px-3 py-1.5 border ${
                            danger ? 'bg-red-100 border-red-300' : 'bg-white border-gray-200'
                        }`}
                        style={{ gap: 4 }}
                    >
                        {danger ? (
                            <Ionicons name="warning" size={14} color="#b91c1c" />
                        ) : null}
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

function ScanResultSheet({ result, ref }: Props) {
    const t = useTranslation();
    const language = useAppStore((state) => state.language);
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['60%', '92%'], []);

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
                        {/* 음식 이름 */}
                        <View>
                            <Text className="text-2xl font-bold text-gray-900">
                                {result.identifiedFoodTranslationName ||
                                    result.identifiedFoodKoreanName}
                                {result.spicyLevel > 0
                                    ? ` ${'🌶️'.repeat(result.spicyLevel)}`
                                    : ''}
                            </Text>
                            {result.identifiedFoodKoreanName ? (
                                <Text className="text-base text-gray-500 mt-1">
                                    {result.identifiedFoodKoreanName}
                                    {result.identifiedFoodPronunciationName
                                        ? ` · ${result.identifiedFoodPronunciationName}`
                                        : ''}
                                </Text>
                            ) : null}
                        </View>

                        {/* [1] 내 알러지 매칭 — 가장 위험, 최우선 노출 */}
                        {result.matchedAllergies.length > 0 ? (
                            <Section title={t('scan.result.matchedAllergies')}>
                                <ChipRow items={result.matchedAllergies} lang={language} danger />
                            </Section>
                        ) : null}

                        {/* [2] 종교 제한 매칭 */}
                        {result.matchedReligiousIngredients.length > 0 ? (
                            <Section title={t('scan.result.matchedReligious')}>
                                <ChipRow
                                    items={result.matchedReligiousIngredients}
                                    lang={language}
                                    danger
                                />
                            </Section>
                        ) : null}

                        {/* [3] 검출된 전체 알러지 */}
                        {result.allergies.length > 0 ? (
                            <Section title={t('scan.result.allergies')}>
                                <ChipRow items={result.allergies} lang={language} />
                            </Section>
                        ) : null}

                        {/* [4] 전체 재료 */}
                        {result.ingredients.length > 0 ? (
                            <Section title={t('scan.result.ingredients')}>
                                <ChipRow items={result.ingredients} lang={language} />
                            </Section>
                        ) : null}

                        {/* [5] 분석 근거 */}
                        {result.identifiedFoodNameReason ? (
                            <Section title={t('scan.result.reason')}>
                                <Text className="text-sm text-gray-600 leading-5">
                                    {result.identifiedFoodNameReason}
                                </Text>
                            </Section>
                        ) : null}
                    </View>
                )}
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
}

export default ScanResultSheet;
