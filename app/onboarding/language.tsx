import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSettings from '../../components/settings/LanguageSettings';
import { View } from 'react-native';
import { ActionButton } from '../../components/ui/action-button';

export default function LanguageScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <LanguageSettings title="Welcome!" subtitle="사용하실 언어를 선택해 주세요." />
            <View className="flex-row bg-white px-5 pt-10 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    이전으로
                </ActionButton>
                <ActionButton className="mb-5" onPress={() => router.push('/onboarding/allergy' as any)}>
                    다음으로
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
