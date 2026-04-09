import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import { useAppStore } from "@/store/useAppStore";
const ITEM_WIDTH = 80;
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const cafeterias = [{name: '힉생식당',id:'a1'},{name: '교직원식당',id:'b2'},{name: '분식당',id:'c3'}];

export default function HomeScreen() {
    const allergies  = useAppStore(state => state.allergies);

    const dateScrollRef = useRef<ScrollView>(null);
    const cafeteriaRef = useRef<ScrollView>(null);

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [selectedDate, setSelectedDate] = useState(todayString);
    const [selectedCafeteria, setSelectedCafeteria] = useState('a1');

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
    }, []);

    // 메인으로 복귀 시 로직
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useFocusEffect(
        useCallback(() => {
            setSelectedDate(todayString);
            const todayIndex = weekDates.findIndex(item => item.id === todayString);

            if (todayIndex >= 3) {
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

    // 날짜 선택 시 실행 함수
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
                <Text className="text-3xl font-bold text-gray-800 mb-3">오늘의 학식 메뉴 🍽️</Text>
                <View className="bg-red-100 px-4 py-2 rounded-full">
                    <Text className="text-red-600 font-semibold">현재 필터: {allergies}</Text>
                </View>
            </View>

            {/*날짜 선택 스크롤*/}
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
                                    {item.dayName}
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

            {/*식당 선택 스크롤*/}
            <View className="mb-6">
                <ScrollView
                    ref={cafeteriaRef}
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
            <View className="flex-1 px-5 justify-center items-center">
                <Text className="text-gray-400">선택된 날짜: {selectedDate}</Text>
                <Text className="text-gray-400">선택된 식당: {selectedCafeteria}</Text>
            </View>
        </SafeAreaView>
    );
}