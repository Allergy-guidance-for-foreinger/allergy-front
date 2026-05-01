import { useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ALLERGY_LIST } from '@/constants/allergyList';

interface AllergySettingsProps {
    title?: string;
    subtitle?: string;
}

export default function AllergySettings({
    title = 'Allergies',
    subtitle = '피해야 할 식재료를 모두 골라주세요.',
}: AllergySettingsProps) {
    const allergies = useAppStore((state) => state.allergies);
    const setAllergies = useAppStore((state) => state.setAllergies);
    const [customAllergyInput, setCustomAllergyInput] = useState('');

    const presetAllergySet = useMemo(() => new Set(ALLERGY_LIST.map((allergy) => allergy.icon)), []);
    const customAllergies = useMemo(
        () => allergies.filter((allergy) => !presetAllergySet.has(allergy)),
        [allergies, presetAllergySet]
    );

    const toggleAllergy = (selectedIcon: string) => {
        if (allergies.includes(selectedIcon)) {
            setAllergies(allergies.filter((a) => a !== selectedIcon));
        } else {
            setAllergies([...allergies, selectedIcon]);
        }
    };

    const handleAddCustomAllergy = () => {
        const nextAllergy = customAllergyInput.trim();

        if (!nextAllergy || allergies.includes(nextAllergy)) {
            setCustomAllergyInput('');
            return;
        }

        setAllergies([...allergies, nextAllergy]);
        setCustomAllergyInput('');
    };

    return (
        <View className="px-5 pt-10 ">
            <Text className="text-3xl font-bold text-red-500 mb-2">{title}</Text>
            <Text className="text-gray-600 text-lg mb-10">{subtitle}</Text>

            <View className="flex-row flex-wrap gap-x-3 gap-y-3 mb-2">
                {ALLERGY_LIST.map((allergy) => {
                    const isSelected = allergies.includes(allergy.icon);
                    return (
                        <TouchableOpacity
                            key={allergy.icon}
                            className={`w-[31%] min-h-[54px] flex-row items-center justify-center px-3 py-2 rounded-2xl border-2 ${
                                isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => toggleAllergy(allergy.icon)}
                        >
                            <Text className={`text-[15px] font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                                {allergy.icon} {allergy.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

            </View>

            <View className="mt-10">
                <Text className="text-lg font-bold text-gray-900 mb-2">직접 등록</Text>
                <Text className="text-sm text-gray-500 mb-2">
                    알러지를 직접 입력해서 추가할 수 있어요.
                </Text>

                <View className="flex-row items-center gap-2">
                    <TextInput
                        value={customAllergyInput}
                        onChangeText={setCustomAllergyInput}
                        placeholder="예: 사과, 복숭아"
                        autoCapitalize="none"
                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
                        returnKeyType="done"
                        onSubmitEditing={handleAddCustomAllergy}
                    />
                    <TouchableOpacity
                        className="rounded-2xl bg-black px-4 py-3"
                        onPress={handleAddCustomAllergy}
                    >
                        <Text className="text-white font-bold">등록</Text>
                    </TouchableOpacity>
                </View>

                {customAllergies.length > 0 ? (
                    <View className="mt-4">
                        <Text className="text-sm font-semibold text-gray-500 mb-2">등록된 알러지</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {customAllergies.map((allergy) => {
                                const isSelected = allergies.includes(allergy);

                                return (
                                    <TouchableOpacity
                                        key={allergy}
                                        className={`px-4 py-3 rounded-2xl border-2 ${
                                            isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                                        }`}
                                        onPress={() => toggleAllergy(allergy)}
                                    >
                                        <Text className={`font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                                            {allergy}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ) : null}
            </View>
        </View>
    );
}
