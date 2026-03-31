import { Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';

const ALLERGY_LIST = [
    { id: 'crustacean', name: '갑각류 (Crustacean)', emoji: '🦐' },
    { id: 'nut', name: '견과류 (Nuts)', emoji: '🥜' },
    { id: 'pork', name: '돼지고기 (Pork)', emoji: '🐷' },
    { id: 'dairy', name: '유제품 (Dairy)', emoji: '🥛' },
];

export default function AllergyScreen() {
    const { allergies, setAllergies, completeOnboarding } = useAppStore();

    const toggleAllergy = (id: string) => {
        if (allergies.includes(id)) {
            setAllergies(allergies.filter((a) => a !== id)); // 이미 있으면 뺌
        } else {
            setAllergies([...allergies, id]); // 없으면 추가
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-red-500 mb-2">Allergies</Text>
                <Text className="text-gray-500 text-lg mb-10">피해야 할 식재료를 모두 골라주세요.</Text>

                <View className="gap-y-3">
                    {ALLERGY_LIST.map((item) => {
                        const isSelected = allergies.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                className={`flex-row items-center justify-between py-4 px-5 rounded-2xl border-2 ${
                                    isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                                }`}
                                onPress={() => toggleAllergy(item.id)}
                            >
                                <Text className={`text-lg font-medium ${isSelected ? 'text-red-600' : 'text-gray-700'}`}>
                                    {item.emoji} {item.name}
                                </Text>
                                {isSelected && <Text className="text-red-500 font-bold text-xl">✓</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <TouchableOpacity
                className="w-full bg-red-500 py-4 rounded-xl items-center mb-5"
                onPress={() => completeOnboarding()}
            >
                <Text className="text-white text-lg font-bold">완료하고 식단 보러가기 ✨</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}