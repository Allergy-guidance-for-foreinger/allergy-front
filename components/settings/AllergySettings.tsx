import { Text, View, TouchableOpacity } from 'react-native';
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

    const toggleAllergy = (selectedIcon: string) => {
        if (allergies.includes(selectedIcon)) {
            setAllergies(allergies.filter((a) => a !== selectedIcon));
        } else {
            setAllergies([...allergies, selectedIcon]);
        }
    };
    return (
        <View className="px-5 pt-10">
            <Text className="text-3xl font-bold text-red-500 mb-2">{title}</Text>
            <Text className="text-gray-600 text-lg mb-10">{subtitle}</Text>

            <View className="flex-row flex-wrap gap-3">
                {ALLERGY_LIST.map((allergy) => {
                    const isSelected = allergies.includes(allergy.icon);
                    return (
                        <TouchableOpacity
                            key={allergy.icon}
                            className={`w-[30%] aspect-square flex-row items-center justify-center p-2 rounded-2xl border-2 relative ${
                                isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => toggleAllergy(allergy.icon)}
                        >
                            <Text className={`text-lg font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                                {allergy.icon} {allergy.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
