import { router } from 'expo-router';
import AllergySettings from '../../components/settings/AllergySettings';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function SettingsAllergy() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24}}>
                <AllergySettings />
            </ScrollView>
            <View className="flex-row px-5 py-6 justify-center">
                <TouchableOpacity
                    className="w-44 bg-black rounded-3xl   items-center mb-5 content-center py-4"
                    onPress={() => router.back()}
                >
                    <Text className="text-white text-xl font-bold">완료</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
