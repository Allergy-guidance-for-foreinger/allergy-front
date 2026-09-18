import { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import DeviceInfo from 'react-native-device-info';
import { Alert } from '@/lib/alert';
import { useTranslation, t as tFn } from '@/lib/i18n';
export type GoogleLoginProps = { onLogin: (idToken: string, deviceId: string) => Promise<void> };
export default function GoogleLoginButton({ onLogin }: GoogleLoginProps) {
    const t = useTranslation();
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID, iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID });
    }, []);
    const login = async () => {
        if (busy) return;
        setBusy(true);
        try {
            await GoogleSignin.hasPlayServices();
            const result = await GoogleSignin.signIn();
            if (result.data?.idToken) await onLogin(result.data.idToken, await DeviceInfo.getUniqueId());
        } catch (error: any) {
            if (error.code !== statusCodes.SIGN_IN_CANCELLED) Alert.alert(tFn('login.failedTitle'), error.message || tFn('login.failedMessage'));
        } finally { setBusy(false); }
    };
    return <TouchableOpacity onPress={login} disabled={busy} className="w-full h-[50px] bg-white border border-gray-300 rounded-2xl items-center justify-center">
        <Text className="text-gray-900 font-semibold text-base">{busy ? t('common.loading') : t('login.continueWithGoogle')}</Text>
    </TouchableOpacity>;
}
