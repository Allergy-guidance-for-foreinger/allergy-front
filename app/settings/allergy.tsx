import { router } from 'expo-router';
import AllergySettings from '../../components/settings/AllergySettings';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../components/ui/action-button';
export default function SettingsAllergy() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24}}>
                <AllergySettings />
            </ScrollView>
            <View className="flex-row px-5 py-6 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    완료
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
