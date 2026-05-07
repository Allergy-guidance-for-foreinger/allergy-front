import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import { useAppStore } from '@/store/useAppStore';
import { ALLERGY_LIST, normalizeAllergyValue } from '@/constants/allergyList';
import { cafeterias, getMenuRiskLevel, mealLabels, mockMenuByWeekday, translateMenuItem, Weekday, CafeteriaId, MealKey } from '@/data/mockMenu';
import { RiskIndicator } from '@/components/ui/risk-indicator';
const ITEM_WIDTH = 80;
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const DISPLAY_DAY_NAMES: Record<string, string> = {
    일: 'Sun',
    월: 'Mon',
    화: 'Tue',
    수: 'Wed',
    목: 'Thu',
    금: 'Fri',
    토: 'Sat',
};

type DisplayedAllergy = {
    key: string;
    label: string;
    keywords: string[];
};

export default function HomeScreen() {
    const allergies  = useAppStore(state => state.allergies);
    const normalizedAllergies = useMemo(
        () => Array.from(new Set(allergies.map((allergy) => normalizeAllergyValue(allergy)))),
        [allergies]
    );

    const dateScrollRef = useRef<ScrollView>(null);

    const today = useMemo(() => new Date(), []);
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [selectedDate, setSelectedDate] = useState(todayString);
    const [selectedCafeteria, setSelectedCafeteria] = useState<CafeteriaId>('a1');

    // 날짜 계산 로직
    const weekDates = useMemo(() => {
        const dates = [];
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + diffToMonday + i);

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateId = `${year}-${month}-${day}`;

            dates.push({
                id: dateId,
                dayName: DAY_NAMES[date.getDay()],
                displayDate: `${month}.${day}`,
            });
        }
        return dates;
    }, [today]);

    const selectedDayName = useMemo(() => {
        return weekDates.find((item) => item.id === selectedDate)?.dayName as Weekday | undefined;
    }, [selectedDate, weekDates]);

    const selectedMenu = useMemo(() => {
        if (!selectedDayName) return null;
        return mockMenuByWeekday[selectedDayName]?.[selectedCafeteria] ?? null;
    }, [selectedCafeteria, selectedDayName]);

    const displayedAllergies: DisplayedAllergy[] = useMemo(() => {
        return normalizedAllergies.map((normalizedAllergy) => {
            const preset = ALLERGY_LIST.find((item) => item.label === normalizedAllergy);

            return {
                key: normalizedAllergy,
                label: preset ? preset.label : normalizedAllergy,
                keywords: preset ? preset.keywords : [normalizedAllergy],
            };
        });
    }, [normalizedAllergies]);

    // 메인으로 복귀 시 로직
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useFocusEffect(
        useCallback(() => {
            setSelectedDate(todayString);
            const todayIndex = weekDates.findIndex(item => item.id === todayString);
            if (todayIndex >= 0) {
                timerRef.current = setTimeout(() => {
                    const screenWidth = Dimensions.get('window').width;
                    const itemWidth = 90;
                    const offset = (todayIndex * itemWidth) - (screenWidth / 2) + (itemWidth / 2) + 20;
                    dateScrollRef.current?.scrollTo({ x: offset, animated: true });
                }, 100);
            }

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }, [todayString, weekDates])
    );

    const handleDatePress = (newDateId: string) => {
        const newIndex = weekDates.findIndex(item => item.id === newDateId);

        const screenWidth = Dimensions.get('window').width;
        const itemWidth = 90;
        const gap = 10;
        const totalWidth = itemWidth + gap;
        const offset = (newIndex * totalWidth) - (screenWidth / 2) + (itemWidth / 2) + 20;

        dateScrollRef.current?.scrollTo({
            x: offset,
            animated: true,
        });
        setSelectedDate(newDateId);
    };

    return (
        <SafeAreaView className="flex-1 bg-white pt-5">
            <View className="px-5 items-center mb-6">
                <Text className="text-3xl font-bold text-gray-800 mb-3">Today&apos;s Campus Menu 🍽️</Text>
                <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-red-600 font-semibold">Current filter: {normalizedAllergies.join(', ') || 'None'}</Text>
                </View>
            </View>

            <View className="mb-6">
                <ScrollView
                    ref={dateScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                    >
                        {weekDates.map((item) => {
                            const isSelected = selectedDate === item.id;
                            const isToday = item.id === todayString;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handleDatePress(item.id)}
                                className={`items-center justify-center py-1 rounded-2xl border-2 ${
                                    isSelected
                                        ? 'border-black bg-black'
                                        : 'border-gray-200 bg-white'
                                }`}
                                style={{ width: ITEM_WIDTH }}
                                >
                                <Text className={`text-lg font-semibold mb-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {DISPLAY_DAY_NAMES[item.dayName]}
                                </Text>
                                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                    {item.displayDate}
                                </Text>
                                {isToday && (
                                    <View className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-red-500'}`} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                    </ScrollView>
            </View>

            <View className="mb-6">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                >
                    {cafeterias.map((item) => {
                        const isSelected = selectedCafeteria=== item.id;

                        return (
                            <TouchableOpacity
                                key={item.id}
                                className={`items-center justify-center py-3 px-5 rounded-2xl border-2 ${
                                    isSelected
                                        ? 'border-black bg-black'
                                        : 'border-gray-200 bg-white'
                                }`}
                                onPress={() => setSelectedCafeteria(item.id)}
                            >

                                <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                    </ScrollView>
            </View>

            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>

                {selectedMenu ? (
                    <View className="gap-4">
                        {mealLabels.map((meal) => (
                            <TouchableOpacity
                                key={meal.key}
                                className="rounded-3xl border border-gray-200 bg-white px-5 py-4 active:bg-gray-50"
                                onPress={() =>
                                    router.push({
                                        pathname: '/meal-detail',
                                        params: {
                                            date: selectedDate,
                                            cafeteria: selectedCafeteria,
                                            meal: meal.key as MealKey,
                                        },
                                    })
                                }
                            >
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="text-xl font-bold text-gray-900">{meal.label}</Text>
                                    <Text className="text-sm font-semibold text-gray-400">Details</Text>
                                </View>
                                <View className="gap-2">
                                    {selectedMenu[meal.key].map((item) => {
                                        const displayName = translateMenuItem(item);
                                        const riskLevel = getMenuRiskLevel(item, displayedAllergies);

                                        return (
                                            <View
                                                key={item}
                                                className="rounded-2xl bg-gray-50 px-4 py-3 flex-row items-center justify-between"
                                            >
                                                <Text className="text-base text-gray-700 flex-1 pr-3">{displayName}</Text>
                                                <RiskIndicator level={riskLevel} />
                                            </View>
                                        );
                                    })}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 items-center">
                        <Text className="text-gray-500 text-base">No mock data is available for the selected date and cafeteria.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
