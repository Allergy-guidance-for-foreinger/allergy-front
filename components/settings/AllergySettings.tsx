import { useMemo, useState } from 'react';
import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { ALLERGY_LIST, normalizeAllergyValue } from '@/constants/allergyList';

interface AllergySettingsProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
}

export default function AllergySettings({
    title = 'Allergies',
    subtitle = 'Select every ingredient you need to avoid.',
    showHeader = true,
}: AllergySettingsProps) {
    const allergies = useAppStore((state) => state.allergies);
    const setAllergies = useAppStore((state) => state.setAllergies);
    const [customAllergyInput, setCustomAllergyInput] = useState('');
    const normalizedAllergies = useMemo(
        () => Array.from(new Set(allergies.map((allergy) => normalizeAllergyValue(allergy)))),
        [allergies]
    );

    const presetAllergySet = useMemo(() => new Set(ALLERGY_LIST.map((allergy) => allergy.label)), []);
    const customAllergies = useMemo(
        () => normalizedAllergies.filter((allergy) => !presetAllergySet.has(allergy)),
        [normalizedAllergies, presetAllergySet]
    );

    const toggleAllergy = (selectedLabel: string) => {
        if (normalizedAllergies.includes(selectedLabel)) {
            setAllergies(normalizedAllergies.filter((a) => a !== selectedLabel));
        } else {
            setAllergies([...normalizedAllergies, selectedLabel]);
        }
    };

    const handleAddCustomAllergy = () => {
        const nextAllergy = customAllergyInput.trim();

        if (!nextAllergy || normalizedAllergies.includes(nextAllergy)) {
            setCustomAllergyInput('');
            return;
        }

        setAllergies([...normalizedAllergies, nextAllergy]);
        setCustomAllergyInput('');
    };

    return (
        <View className="px-5 pt-10 ">
            {showHeader ? (
                <>
                    <Text className="text-3xl font-bold text-red-500 mb-2">{title}</Text>
                    <Text className="text-gray-600 text-lg mb-10">{subtitle}</Text>
                </>
            ) : null}

            <View className="flex-row flex-wrap gap-x-3 gap-y-3 mb-2">
                {ALLERGY_LIST.map((allergy) => {
                    const isSelected = normalizedAllergies.includes(allergy.label);
                    return (
                        <TouchableOpacity
                            key={allergy.id}
                            className={`w-[31%] min-h-[54px] flex-row items-center justify-center px-3 py-2 rounded-2xl border-2 ${
                                isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => toggleAllergy(allergy.label)}
                        >
                            <Text className={`text-[15px] font-medium text-center ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                                {allergy.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

            </View>

            <View className="mt-10">
                <Text className="text-lg font-bold text-gray-900 mb-2">Custom Allergy</Text>
                <Text className="text-sm text-gray-500 mb-2">You can type an allergy name to add it directly.</Text>

                <View className="flex-row items-center gap-2">
                    <TextInput
                        value={customAllergyInput}
                        onChangeText={setCustomAllergyInput}
                        placeholder="e.g. Apple, Peach"
                        autoCapitalize="none"
                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
                        returnKeyType="done"
                        onSubmitEditing={handleAddCustomAllergy}
                    />
                    <TouchableOpacity
                        className="rounded-2xl bg-black px-4 py-3"
                        onPress={handleAddCustomAllergy}
                    >
                        <Text className="text-white font-bold">Add</Text>
                    </TouchableOpacity>
                </View>

                {customAllergies.length > 0 ? (
                    <View className="mt-4">
                        <Text className="text-sm font-semibold text-gray-500 mb-2">Saved Allergies</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {customAllergies.map((allergy) => {
                                const isSelected = normalizedAllergies.includes(allergy);

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
