import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSettings from '../../components/settings/LanguageSettings';
import { View } from 'react-native';
import { ActionButton } from '../../components/ui/action-button';

export default function SettingsLanguageScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <LanguageSettings title="언어 설정" subtitle="사용하실 언어를 선택해 주세요." />
            <View className="px-5 pb-5 items-center">
                <ActionButton onPress={() => router.back()}>
                    완료
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
