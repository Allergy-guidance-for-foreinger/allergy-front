import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';

const SCHOOLS = [
    'Kumoh National Institute of Technology',
    'Seoul National University',
    'Pusan National University',
    'Kyungpook National University',
];

export default function SchoolScreen() {
    const school = useAppStore((state) => state.school);
    const setSchool = useAppStore((state) => state.setSchool);

    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-2">University</Text>
                <Text className="text-gray-500 text-lg mb-10">Select the university you attend.</Text>

                <View className="flex-row flex-wrap gap-3">
                    {SCHOOLS.map((s) => (
                        <TouchableOpacity
                            key={s}
                            className={`py-3 px-5 rounded-full border-2 ${
                                school === s ? 'border-black bg-black' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => setSchool(s)}
                        >
                            <Text className={`text-base font-semibold ${school === s ? 'text-white' : 'text-gray-600'}`}>
                                {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="flex-row gap-x-3 mb-5">
                {/* 뒤로 가기 버튼 (스택의 맨 위 종이 버리기) */}
                <TouchableOpacity
                    className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
                    onPress={() => router.back()}
                >
                    <Text className="text-gray-700 text-lg font-bold">Back</Text>
                </TouchableOpacity>

                {/* 학교가 선택되어야만 넘어갈 수 있게 막아둡니다 */}
                <TouchableOpacity
                    className={`flex-[2] py-4 rounded-xl items-center ${school ? 'bg-black' : 'bg-gray-300'}`}
                    disabled={!school}
                    onPress={() => router.push('/onboarding/allergy' as any)}
                >
                    <Text className="text-white text-lg font-bold">Next</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
