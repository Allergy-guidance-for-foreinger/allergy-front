import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import AllergySettings from '../../components/settings/AllergySettings';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AllergyScreen() {
    const completeOnboarding = useAppStore((state) => state.completeOnboarding);
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <AllergySettings />
            </ScrollView>
            <View className="flex-row bg-white px-5 pt-4 gap-x-6 justify-center">
                <TouchableOpacity
                    className="w-44 bg-black py-4 rounded-3xl items-center mb-5"
                    onPress={() => router.back()}
                >
                    <Text className="text-white text-xl font-bold">이전으로</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="w-44 bg-pink-300 py-4 rounded-3xl items-center mb-5"
                    onPress={() => {
                        completeOnboarding();
                    }}
                >
                    <Text className="text-white text-lg font-bold">온보딩 완료 </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
