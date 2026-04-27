import { router, useLocalSearchParams } from 'expo-router';
import { Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo } from 'react';
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

    const selectedAllergyNames = useMemo(() => {
        return ALLERGY_LIST.filter((item) => allergies.includes(item.icon));
    }, [allergies]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-5 pt-10" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="mb-4">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{mealLabel} 상세</Text>
                    <Text className="text-gray-500">{date}</Text>
                    <Text className="text-gray-500 mt-1">{cafeteriaName}</Text>
                </View>

                <View className="mb-4 rounded-3xl bg-red-50 px-5 py-4">
                    <Text className="text-lg font-bold text-red-600 mb-2">내 알러지</Text>
                    {selectedAllergyNames.length > 0 ? (
                        <View className="flex-row flex-wrap gap-2">
                            {selectedAllergyNames.map((item) => (
                                <View key={item.id} className="rounded-full bg-white px-3 py-1 border border-red-200">
                                    <Text className="text-red-600 font-semibold">
                                        {item.icon} {item.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text className="text-red-500">선택된 알러지 정보가 없습니다.</Text>
                    )}
                </View>

                <View className="gap-4">
                    {mealItems.map((item) => {
                        const detail = getMenuItemDetail(item);
                        const matchedAllergies = detail.allergens.filter((icon) => allergies.includes(icon));

                        return (
                            <View key={item} className="rounded-3xl border border-gray-200 bg-white px-5 py-4">
                                <Text className="text-xl font-bold text-gray-900 mb-3">{item}</Text>

                                <Text className="text-sm font-semibold text-gray-500 mb-2">식재료</Text>
                                <View className="flex-row flex-wrap gap-2 mb-4">
                                    {detail.ingredients.map((ingredient) => (
                                        <View key={ingredient} className="rounded-full bg-gray-100 px-3 py-1">
                                            <Text className="text-gray-700">{ingredient}</Text>
                                        </View>
                                    ))}
                                </View>

                                <Text className="text-sm font-semibold text-gray-500 mb-2">알러지 유발 물질</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {detail.allergens.length > 0 ? (
                                        detail.allergens.map((icon) => {
                                            const allergy = ALLERGY_LIST.find((entry) => entry.icon === icon);
                                            const isMatched = allergies.includes(icon);

                                            return (
                                                <View
                                                    key={icon}
                                                    className={`rounded-full px-3 py-1 border ${
                                                        isMatched
                                                            ? 'bg-red-100 border-red-300'
                                                            : 'bg-gray-100 border-gray-200'
                                                    }`}
                                                >
                                                    <Text className={`${isMatched ? 'text-red-700' : 'text-gray-700'} font-semibold`}>
                                                        {icon} {allergy?.name ?? icon}
                                                    </Text>
                                                </View>
                                            );
                                        })
                                    ) : (
                                        <Text className="text-gray-400">표시할 알러지 유발 물질이 없습니다.</Text>
                                    )}
                                </View>

                                {matchedAllergies.length > 0 ? (
                                    <View className="mt-4 rounded-2xl bg-red-50 px-4 py-3">
                                        <Text className="text-red-700 font-semibold">
                                            내 알러지와 겹치는 항목: {matchedAllergies.map((icon) => icon).join(', ')}
                                        </Text>
                                    </View>
                                ) : null}
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

            <View className="flex-row bg-white px-5 py-4 gap-x-3">
                <TouchableOpacity
                    className="flex-1 bg-gray-200 py-4 rounded-3xl items-center"
                    onPress={() => router.back()}
                >
                    <Text className="text-gray-800 text-lg font-bold">뒤로</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 bg-black py-4 rounded-3xl items-center"
                    onPress={() => router.replace('/main')}
                >
                    <Text className="text-white text-lg font-bold">메인으로</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
