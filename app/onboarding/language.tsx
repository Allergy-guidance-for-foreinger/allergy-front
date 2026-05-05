import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSettings from '../../components/settings/LanguageSettings';
import { View } from 'react-native';
import { ActionButton } from '../../components/ui/action-button';

export default function LanguageScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <LanguageSettings
                title="Welcome!"
                subtitle="Select the language you want to use."
                persistToServer={false}
            />
            <View className="flex-row bg-white px-5 pt-10 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    Back
                </ActionButton>
                <ActionButton className="mb-5" onPress={() => router.push('/onboarding/country' as any)}>
                    Next
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
