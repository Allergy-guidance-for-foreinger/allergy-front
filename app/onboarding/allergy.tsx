import { router } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import AllergySettings from '../../components/settings/AllergySettings';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../components/ui/action-button';


export default function AllergyScreen() {
    const completeOnboarding = useAppStore((state) => state.completeOnboarding);
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <AllergySettings />
            </ScrollView>
            <View className="flex-row bg-white px-5 pt-4 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    이전으로
                </ActionButton>
                <ActionButton className="mb-5" onPress={() => completeOnboarding()}>
                    온보딩 완료
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
