import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ALLERGY_GROUPS, normalizeAllergies } from '@/constants/allergyList';

interface AllergySettingsProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
}

export default function AllergySettings({
    title = 'Allergy Categories',
    subtitle = 'Tap every ingredient category you need to avoid.',
    showHeader = true,
}: AllergySettingsProps) {
    const allergies = useAppStore((state) => state.allergies);
    const setAllergies = useAppStore((state) => state.setAllergies);

    const normalizedAllergies = useMemo(() => normalizeAllergies(allergies), [allergies]);

    const toggleAllergy = (selectedLabel: string) => {
        const nextAllergies = normalizedAllergies.includes(selectedLabel)
            ? normalizedAllergies.filter((item) => item !== selectedLabel)
            : [...normalizedAllergies, selectedLabel];

        setAllergies(nextAllergies);
    };

    return (
        <ScrollView className="flex-1 px-5 pt-8">
            {showHeader ? (
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{title}</Text>
                    <Text className="text-gray-500 text-lg">{subtitle}</Text>
                    <View className="mt-4 self-start rounded-full bg-gray-100 px-4 py-2">
                        <Text className="text-sm font-semibold text-gray-700">
                            {normalizedAllergies.length} selected
                        </Text>
                    </View>
                </View>
            ) : null}

            <View className="relative mb-6 rounded-[24px] border border-gray-200 bg-white px-4 py-5 pt-6">
                <View className="absolute -top-3 left-4 rounded-full bg-white px-2">
                    <Text className="text-sm font-semibold text-gray-500">selected allergies</Text>
                </View>
                {normalizedAllergies.length > 0 ? (
                    <View className="flex-row flex-wrap gap-2">
                        {normalizedAllergies.map((allergy) => (
                            <View key={allergy} className="rounded-full bg-blue-500 px-3 py-2">
                                <Text className="text-xs font-semibold text-white">{allergy}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text className="text-sm text-gray-400">No allergies selected yet.</Text>
                )}
            </View>

            {ALLERGY_GROUPS.map((group) => {
                const groupHasSelection = group.items.some((item) => normalizedAllergies.includes(item.label));

                return (
                    <View
                        key={group.id}
                        className={`mb-6 rounded-[28px] border px-4 py-4 ${
                            groupHasSelection ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
                        }`}
                    >
                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-900">{group.title}</Text>
                            <Text className="text-sm text-gray-500 mt-1">{group.subtitle}</Text>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {group.items.map((item) => {
                                const isSelected = normalizedAllergies.includes(item.label);

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        className={`min-h-[46px] rounded-full border px-4 py-3 ${
                                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white'
                                        }`}
                                        onPress={() => toggleAllergy(item.label)}
                                    >
                                        <Text
                                            className={`text-[15px] font-semibold ${
                                                isSelected ? 'text-white' : 'text-gray-700'
                                            }`}
                                        >
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}
