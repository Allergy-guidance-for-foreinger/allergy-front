import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { loginWithGoogleToken } from '@/api/auth';
import { useTranslation } from '@/lib/i18n';
import GoogleLoginButton from '@/components/google-login-button';

export default function LoginScreen() {
    const t = useTranslation();
    const handleLogin = async (idToken: string, deviceId: string) => {
        const auth = await loginWithGoogleToken(idToken, deviceId);
        const state = useAppStore.getState();
        state.setHasCompletedOnboarding(Boolean(auth.onboardingCompleted));
        state.setLoggedIn(true);
        if (auth.onboardingCompleted) await state.hydrateFromServerSettings();
    };
    return (
        <SafeAreaView className="flex-1 justify-center items-center bg-white px-8">
            <View className="items-center mb-16">
                <Text className="text-4xl font-bold text-gray-900 mb-2">{t('login.brand')}</Text>
                <Text className="text-gray-500 text-lg">{t('login.tagline')}</Text>
            </View>
            <View style={{ width: '100%', maxWidth: 360 }}><GoogleLoginButton onLogin={handleLogin} /></View>
        </SafeAreaView>
    );
}
