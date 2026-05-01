import { useLocalSearchParams } from 'expo-router';
import { Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    cafeterias,
    getMenuItemDetail,
    getWeekdayFromDateString,
    mealLabels,
    mockMenuByWeekday,
    translateMenuItem,
    MealKey,
    CafeteriaId,
} from '@/data/mockMenu';
import { ALLERGY_LIST, normalizeAllergyValue } from '@/constants/allergyList';
import ScreenHeader from '@/components/ui/screen-header';

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
    const normalizedAllergies = useMemo(
        () => Array.from(new Set(allergies.map((allergy) => normalizeAllergyValue(allergy)))),
        [allergies]
    );

    const date = String(params.date ?? '');
    const cafeteria = String(params.cafeteria ?? 'a1') as CafeteriaId;
    const meal = String(params.meal ?? 'breakfast') as MealKey;

    const weekday = useMemo(() => getWeekdayFromDateString(date), [date]);
    const cafeteriaName = cafeterias.find((item) => item.id === cafeteria)?.name ?? 'Cafeteria';
    const mealLabel = mealLabels.find((item) => item.key === meal)?.label ?? 'Meal';

    const mealItems = useMemo(() => {
        if (!weekday) return [];
        return mockMenuByWeekday[weekday]?.[cafeteria]?.[meal] ?? [];
    }, [cafeteria, meal, weekday]);

    const displayedAllergies: DisplayedAllergy[] = useMemo(() => {
        return normalizedAllergies.map((allergy) => {
            const normalizedAllergy = normalizeAllergyValue(allergy);
            const preset = ALLERGY_LIST.find((item) => item.label === normalizedAllergy);

            return {
                key: normalizedAllergy,
                label: preset ? preset.label : normalizedAllergy,
                keywords: preset ? preset.keywords : [normalizedAllergy],
            };
        });
    }, [normalizedAllergies]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title={`${cafeteriaName} (${mealLabel})`} />

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="gap-4">
                    {mealItems.map((item) => {
                        const detail = getMenuItemDetail(item);
                        const displayName = translateMenuItem(item);
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
                            <View key={item} className="rounded-3xl border-2 border-gray-300 bg-white px-5 py-4">
                                <Text className="text-xl font-bold text-gray-900 mb-2">{displayName}</Text>
                                <Text className="text-gray-500 mb-4">{detail.description}</Text>

                                <Text className="text-sm font-semibold text-gray-500 mb-2">Ingredients</Text>
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
                                            Ingredients matching your allergies: {matchedIngredients.join(', ')}
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="rounded-2xl bg-gray-50 px-4 py-3">
                                        <Text className="text-gray-500 font-semibold">
                                            No ingredients match the selected allergies.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {mealItems.length === 0 ? (
                    <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                        <Text className="text-gray-500">No detailed information is available for the selected menu.</Text>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}
