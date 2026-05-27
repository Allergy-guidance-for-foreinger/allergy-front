import { useLocalSearchParams } from 'expo-router';
import { Alert, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import ReviewsBottomSheet from '@/components/reviews-bottom-sheet';
import ScreenHeader from '@/components/ui/screen-header';
import { RiskIndicator } from '@/components/ui/risk-indicator';
import {
    getMenuDetail,
    mapServerRiskLevel,
    toggleMenuLike,
    type ServerMenuDetail,
} from '@/api/cafeteria';
import type { SuccessResponse } from '@/api/client';
import { getLocalizedLabelByCode } from '@/constants/allergyList';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation, t as tFn } from '@/lib/i18n';

type MenuDetailData = SuccessResponse<ServerMenuDetail> | undefined;

export default function MealDetailScreen() {
    const params = useLocalSearchParams<{
        mealMenuId?: string;
        date?: string;
        cafeteriaId?: string;
        cafeteriaName?: string;
        mealType?: string;
    }>();

    const targetMealMenuId = parseInt(String(params.mealMenuId ?? ''), 10);
    const mealType = String(params.mealType ?? 'LUNCH');
    const t = useTranslation();
    const language = useAppStore((state) => state.language);
    const mealLabel = t(`meal.${mealType.toLowerCase()}`);

    const queryClient = useQueryClient();
    const queryKey = ['menuDetail', targetMealMenuId] as const;
    const reviewsSheetRef = useRef<BottomSheetModal>(null);

    const { data: menuDetailResponse, isLoading } = useQuery({
        queryKey,
        queryFn: () => getMenuDetail(targetMealMenuId),
        enabled: Number.isFinite(targetMealMenuId),
        staleTime: 1000 * 60 * 10,
    });

    const menu = menuDetailResponse?.data ?? null;
    // matchedAllergies가 객체 배열이라 코드만 추출해 Set 구성.
    // ingredientCode가 있으면 그걸 우선, 없으면 allergyCode로 매칭 (ingredient.code와 비교)
    const matchedSet = new Set(
        (menu?.matchedAllergies ?? []).map((m) => m.ingredientCode ?? m.allergyCode)
    );
    // 재료 목록에는 없지만 사용자 알러지와 매칭된 코드들 — 별도 칩으로 표시해야 함.
    // 예: 서버가 메뉴명에서 'shrimp paste'를 보고 SHRIMP 매칭은 했지만,
    //     ingredients에는 EGG/MILK만 분석돼 들어온 경우.
    const ingredientCodeSet = new Set(menu?.ingredients?.map((i) => i.code) ?? []);
    const unlistedMatchedCodes = Array.from(matchedSet).filter(
        (code): code is string => Boolean(code) && !ingredientCodeSet.has(code)
    );

    const liked = Boolean(menu?.like?.likedByMe);
    const likeCount = Number(menu?.like?.count) || 0;
    const reviewCount = Number(menu?.review?.count) || 0;

    const [isTogglingLike, setIsTogglingLike] = useState(false);

    const showComingSoon = (label: string) =>
        Alert.alert(tFn('common.comingSoon'), tFn('common.comingSoonMessage', { label }));

    const handleToggleLike = async () => {
        if (isTogglingLike) return;
        if (!Number.isFinite(targetMealMenuId)) return;
        if (!menu) return;

        const oldLike = menu.like ?? { count: 0, likedByMe: false };
        const optimisticLike = {
            likedByMe: !oldLike.likedByMe,
            count: oldLike.likedByMe
                ? Math.max(0, oldLike.count - 1)
                : oldLike.count + 1,
        };

        queryClient.setQueryData<MenuDetailData>(queryKey, (old) => {
            if (!old) return old;
            return { ...old, data: { ...old.data, like: optimisticLike } };
        });
        setIsTogglingLike(true);

        try {
            const response = await toggleMenuLike(targetMealMenuId);
            const data = response?.data;
            if (data) {
                queryClient.setQueryData<MenuDetailData>(queryKey, (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: {
                            ...old.data,
                            like: {
                                count: Number.isFinite(data.likeCount)
                                    ? data.likeCount
                                    : optimisticLike.count,
                                likedByMe: Boolean(data.likedByMe),
                            },
                        },
                    };
                });
            }
        } catch (error: any) {
            queryClient.setQueryData<MenuDetailData>(queryKey, (old) => {
                if (!old) return old;
                return { ...old, data: { ...old.data, like: oldLike } };
            });
            Alert.alert(tFn('detail.likeFailed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsTogglingLike(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="" />

            <ScrollView className="flex-1">
                {!menu ? (
                    <View className="px-5 mt-10">
                        <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                            <Text className="text-gray-700 text-lg font-bold">
                                {isLoading ? t('common.loading') : t('detail.notFound')}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* === 카드 (콘텐츠만, 헤더 행 제거됨) === */}
                        <View
                            className="mx-4 mt-2 rounded-3xl bg-orange-50 px-6 py-8"
                            style={{ minHeight: 380 }}
                        >
                            {/* 콘텐츠 영역 (구조화 레이아웃) */}
                            <View style={{ gap: 16 }}>
                                {/* Row 1: menuName + spicyLevel | riskLevel — 카드 맨 위 */}
                                <View className="flex-row items-center">
                                    <Text
                                        className="text-xl font-bold text-gray-900 flex-1 pr-3"
                                        numberOfLines={2}
                                    >
                                        {menu.menuName}
                                        {menu.spicyLevel > 0
                                            ? ` ${'🌶️'.repeat(menu.spicyLevel)}`
                                            : ''}
                                    </Text>
                                    <RiskIndicator level={mapServerRiskLevel(menu.risk)} />
                                </View>

                                {/* Row 2: description */}
                                {menu.description ? (
                                    <Text className="text-base text-gray-700 leading-6">
                                        {menu.description}
                                    </Text>
                                ) : null}

                                {/* Row 3: 재료 + 매칭 알러지 칩. 리스크 높은 순으로 정렬:
                                    [1] 재료엔 없지만 매칭된 알러지 (⚠ — 가장 위험: 사용자가 못 봄)
                                    [2] 매칭된 재료 (빨강)
                                    [3] 일반 재료 (회색) */}
                                {menu.ingredients.length > 0 ||
                                unlistedMatchedCodes.length > 0 ? (
                                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                        {/* [1] 재료엔 없지만 사용자 알러지와 매칭 — 최우선 노출 */}
                                        {unlistedMatchedCodes.map((code) => {
                                            const label = getLocalizedLabelByCode(code, language);
                                            return (
                                                <View
                                                    key={`matched-${code}`}
                                                    className="flex-row items-center rounded-full px-3 py-1.5 border bg-red-100 border-red-300"
                                                    style={{ gap: 4 }}
                                                >
                                                    <Ionicons
                                                        name="warning"
                                                        size={14}
                                                        color="#b91c1c"
                                                    />
                                                    <Text className="text-red-700 font-semibold">
                                                        {label}
                                                    </Text>
                                                </View>
                                            );
                                        })}

                                        {/* [2] 매칭된 재료 — 빨강 강조 */}
                                        {menu.ingredients
                                            .filter((ingredient) => matchedSet.has(ingredient.code))
                                            .map((ingredient) => {
                                                const label = getLocalizedLabelByCode(
                                                    ingredient.code,
                                                    language
                                                );
                                                return (
                                                    <View
                                                        key={ingredient.code}
                                                        className="rounded-full px-3 py-1.5 border bg-red-100 border-red-300"
                                                    >
                                                        <Text className="text-red-700 font-semibold">
                                                            {label}
                                                        </Text>
                                                    </View>
                                                );
                                            })}

                                        {/* [3] 일반 재료 — 회색 */}
                                        {menu.ingredients
                                            .filter((ingredient) => !matchedSet.has(ingredient.code))
                                            .map((ingredient) => {
                                                const label = getLocalizedLabelByCode(
                                                    ingredient.code,
                                                    language
                                                );
                                                return (
                                                    <View
                                                        key={ingredient.code}
                                                        className="rounded-full px-3 py-1.5 border bg-white border-gray-200"
                                                    >
                                                        <Text className="text-gray-700">
                                                            {label}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        {/* === ACTION ROW (Instagram-style) === */}
                        <View className="flex-row items-center px-4 py-3" style={{ gap: 20 }}>
                            <TouchableOpacity
                                onPress={handleToggleLike}
                                disabled={isTogglingLike}
                                className="flex-row items-center"
                            >
                                <Ionicons
                                    name={liked ? 'heart' : 'heart-outline'}
                                    size={28}
                                    color={liked ? '#ef4444' : '#000'}
                                />
                                {likeCount > 0 ? (
                                    <Text className="ml-1.5 text-base font-semibold text-gray-900">
                                        {likeCount}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => reviewsSheetRef.current?.present()}
                                disabled={!Number.isFinite(targetMealMenuId)}
                                className="flex-row items-center"
                            >
                                <Ionicons name="chatbubble-outline" size={26} color="#000" />
                                {reviewCount > 0 ? (
                                    <Text className="ml-1.5 text-base font-semibold text-gray-900">
                                        {reviewCount}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* 리뷰 Bottom Sheet — Reviews 버튼 누르면 슬라이드 업 */}
            <ReviewsBottomSheet ref={reviewsSheetRef} mealMenuId={targetMealMenuId} />
        </SafeAreaView>
    );
}
