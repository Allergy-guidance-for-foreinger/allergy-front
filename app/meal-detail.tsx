import { router, useLocalSearchParams } from 'expo-router';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import {
    cafeterias,
    getMenuItemDetail,
    getWeekdayFromDateString,
    mealLabels,
    mockMenuByWeekday,
    MealKey,
    CafeteriaId,
} from '@/data/mockMenu';
import { ALLERGY_LIST } from '@/constants/allergyList';

type DisplayedAllergy = {
    key: string;
    label: string;
    keywords: string[];
};

export default function MealDetailScreen() {
    const params = useLocalSearchParams<{
        date?: string;
        cafeteria?: string;
        meal?: string;
    }>();
    const allergies = useAppStore((state) => state.allergies);

    const date = String(params.date ?? '');
    const cafeteria = String(params.cafeteria ?? 'a1') as CafeteriaId;
    const meal = String(params.meal ?? 'breakfast') as MealKey;

    const weekday = useMemo(() => getWeekdayFromDateString(date), [date]);
    const cafeteriaName = cafeterias.find((item) => item.id === cafeteria)?.name ?? '식당';
    const mealLabel = mealLabels.find((item) => item.key === meal)?.label ?? '식사';

    const mealItems = useMemo(() => {
        if (!weekday) return [];
        return mockMenuByWeekday[weekday]?.[cafeteria]?.[meal] ?? [];
    }, [cafeteria, meal, weekday]);

    const displayedAllergies: DisplayedAllergy[] = useMemo(() => {
        return allergies.map((allergy) => {
            const preset = ALLERGY_LIST.find((item) => item.icon === allergy);

            return {
                key: allergy,
                label: preset ? `${preset.icon} ${preset.name}` : allergy,
                keywords: preset ? [preset.name, preset.nameEn] : [allergy],
            };
        });
    }, [allergies]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-2 pb-3">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-12 w-12 items-center justify-center rounded-full bg-white-100 active:bg-gray-200"
                    accessibilityRole="button"
                    accessibilityLabel="뒤로가기"
                >
                    <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="mb-4">
                    <Text className="text-xl font-semibold text-gray-900">{cafeteriaName}</Text>
                    <Text className="text-xl font-semibold text-gray-900">{mealLabel}</Text>
                </View>

                <View className="gap-4">
                    {mealItems.map((item) => {
                        const detail = getMenuItemDetail(item);
                        const matchedIngredients = detail.ingredients.filter((ingredient) =>
                            displayedAllergies.some((allergy) =>
                                allergy.keywords.some((keyword) => {
                                    const source = ingredient.toLowerCase();
                                    const target = keyword.toLowerCase();
                                    return source.includes(target) || target.includes(source);
                                })
                            )
                        );

                        return (
                            <View key={item} className="rounded-3xl border border-gray-200 bg-white px-5 py-4">
                                <Text className="text-xl font-bold text-gray-900 mb-2">{item}</Text>
                                <Text className="text-gray-500 mb-4">{detail.description}</Text>

                                <Text className="text-sm font-semibold text-gray-500 mb-2">식재료</Text>
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    {detail.ingredients.map((ingredient) => {
                                        const isMatched = matchedIngredients.includes(ingredient);

                                        return (
                                            <View
                                                key={ingredient}
                                                className={`rounded-full px-3 py-1 border ${
                                                    isMatched ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-200'
                                                }`}
                                            >
                                                <Text className={`${isMatched ? 'text-red-700' : 'text-gray-700'}`}>
                                                    {ingredient}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                {matchedIngredients.length > 0 ? (
                                    <View className="rounded-2xl bg-red-50 px-4 py-3">
                                        <Text className="text-red-700 font-semibold">
                                            내 알러지와 겹치는 식재료: {matchedIngredients.join(', ')}
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="rounded-2xl bg-gray-50 px-4 py-3">
                                        <Text className="text-gray-500 font-semibold">
                                            선택된 알러지와 겹치는 식재료가 없습니다.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {mealItems.length === 0 ? (
                    <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                        <Text className="text-gray-500">선택한 메뉴의 상세 정보가 없습니다.</Text>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}
