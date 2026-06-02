import { useLocalSearchParams } from 'expo-router';
import { Alert, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import ReviewsBottomSheet from '@/components/reviews-bottom-sheet';
import ScreenHeader from '@/components/ui/screen-header';
import {
    getMenuDetail,
    toggleMenuLike,
    type ServerMenuDetail,
} from '@/api/cafeteria';
import type { SuccessResponse } from '@/api/client';
import { useTranslation, t as tFn } from '@/lib/i18n';

type MenuDetailData = SuccessResponse<ServerMenuDetail> | undefined;
type MenuIngredient = ServerMenuDetail['ingredients'][number];
type MenuMatchedReligiousIngredient = ServerMenuDetail['matchedReligiousIngredients'][number];

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
    const matchedAllergyKeySet = new Set(
        [
            ...(menu?.matchedAllergies ?? []).flatMap((item) => [item.code, item.name]),
        ].filter((value): value is string => Boolean(value))
    );
    const matchedReligiousIngredientKeySet = new Set(
        (menu?.matchedReligiousIngredients ?? [])
            .flatMap((item) => [item.ingredientCode, item.ingredientName])
            .filter((value): value is string => Boolean(value))
    );
    const isIngredientMatched = (ingredient: MenuIngredient) =>
        matchedAllergyKeySet.has(ingredient.code) ||
        matchedAllergyKeySet.has(ingredient.name) ||
        matchedReligiousIngredientKeySet.has(ingredient.code) ||
        matchedReligiousIngredientKeySet.has(ingredient.name);
    const sortedIngredients = menu
        ? [...menu.ingredients].sort((left, right) => {
              const leftMatched = isIngredientMatched(left) ? 1 : 0;
              const rightMatched = isIngredientMatched(right) ? 1 : 0;
              return rightMatched - leftMatched;
          })
        : [];
    const matchedAllergies = menu?.matchedAllergies ?? [];
    const matchedReligiousIngredients = menu?.matchedReligiousIngredients ?? [];

    const liked = Boolean(menu?.like?.likedByMe);
    const likeCount = Number(menu?.like?.count) || 0;
    const reviewCount = Number(menu?.review?.count) || 0;

    const [isTogglingLike, setIsTogglingLike] = useState(false);
    const headerTitle = menu ? (
        <View className="flex-row items-center gap-2">
            <Text className="flex-1 text-lg font-semibold text-gray-900" numberOfLines={1}>
                {menu.menuName}
            </Text>
            <View className="min-w-[44px] items-center">
                {menu.spicyLevel > 0 ? (
                    <Text className="text-base">{'🌶️'.repeat(menu.spicyLevel)}</Text>
                ) : (
                    <View className="h-5" />
                )}
            </View>
        </View>
    ) : (
        <Text className="text-xl font-semibold text-gray-900" numberOfLines={1}>
            {mealLabel}
        </Text>
    );

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
            <ScreenHeader title={headerTitle} />

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
                        <View
                            className="mx-4 mt-2 rounded-3xl bg-white px-6 py-8"
                            style={{ minHeight: 380, gap: 16 }}
                        >
                            <View className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                                <Text className="mb-3 text-sm font-semibold text-gray-500">
                                    Description
                                </Text>
                                <Text className="text-base leading-6 text-gray-700">
                                    {menu.description}
                                </Text>
                            </View>

                            <View className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                                <Text className="mb-3 text-sm font-semibold text-gray-500">
                                    Ingredients
                                </Text>

                                <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                    {sortedIngredients.map((ingredient) => {
                                        const matched = isIngredientMatched(ingredient);
                                        return (
                                            <View
                                                key={ingredient.code}
                                                className={`flex-row items-center rounded-full border px-3 py-1.5 ${
                                                    matched
                                                        ? 'border-red-300 bg-red-100'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <Text
                                                    className={
                                                        matched
                                                            ? 'font-semibold text-red-700'
                                                            : 'text-gray-700'
                                                    }
                                                >
                                                    {ingredient.name}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {matchedAllergies.length > 0 ? (
                                <View className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                                    <Text className="mb-3 text-sm font-semibold text-gray-500">
                                        Matched allergies
                                    </Text>
                                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                        {matchedAllergies.map((allergy) => (
                                            <View
                                                key={`${allergy.code}-${allergy.name}`}
                                                className="rounded-full border border-red-300 bg-red-100 px-3 py-1.5"
                                            >
                                                <Text className="font-semibold text-red-700">
                                                    {allergy.name}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : null}

                            {matchedReligiousIngredients.length > 0 ? (
                                <View className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                                    <Text className="mb-3 text-sm font-semibold text-gray-500">
                                        Matched religious restrictions
                                    </Text>
                                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                                        {matchedReligiousIngredients.map((item: MenuMatchedReligiousIngredient) => (
                                            <View
                                                key={`${item.ingredientCode}-${item.ingredientName}`}
                                                className="rounded-full border border-amber-200 bg-white px-3 py-1.5"
                                            >
                                                <Text className="font-semibold text-amber-900">
                                                    {item.ingredientName}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            ) : null}
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
