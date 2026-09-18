import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '@/lib/i18n';
import type { GoogleLoginProps } from './google-login-button';

type GoogleIdentity = {
    initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
    renderButton: (element: HTMLElement, options: { theme: string; size: string; text: string }) => void;
};
const identity = () => (window as Window & { google?: { accounts: { id: GoogleIdentity } } }).google?.accounts.id;
let loading: Promise<GoogleIdentity> | undefined;
function loadIdentity(): Promise<GoogleIdentity> {
    const api = identity();
    if (api) return Promise.resolve(api);
    if (!loading) loading = new Promise<GoogleIdentity>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        const timer = setTimeout(() => fail(), 15000);
        const fail = () => {
            clearTimeout(timer);
            script.remove();
            reject(new Error('Google sign-in could not load. Check your connection and retry.'));
        };
        script.onload = () => {
            clearTimeout(timer);
            const loaded = identity();
            if (loaded) resolve(loaded); else fail();
        };
        script.onerror = fail;
        document.head.appendChild(script);
    }).catch(error => { loading = undefined; throw error; });
    return loading;
}

export default function GoogleLoginButton({ onLogin }: GoogleLoginProps) {
    const t = useTranslation();
    const target = useRef<HTMLDivElement>(null);
    const callback = useRef(onLogin);
    callback.current = onLogin;
    const pending = useRef(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let cancelled = false;
        setError('');
        const clientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
        if (!clientId) { setError('EXPO_PUBLIC_WEB_CLIENT_ID is required for Google sign-in.'); return; }
        void loadIdentity().then(api => {
            if (cancelled || !target.current) return;
            api.initialize({ client_id: clientId, callback: async ({ credential }) => {
                if (cancelled || pending.current) return;
                pending.current = true;
                setBusy(true);
                setError('');
                try {
                    let deviceId = await AsyncStorage.getItem('web-device-id');
                    if (!deviceId) {
                        deviceId = crypto.randomUUID();
                        await AsyncStorage.setItem('web-device-id', deviceId);
                    }
                    await callback.current(credential, deviceId);
                } catch (reason) {
                    if (!cancelled) setError(reason instanceof Error ? reason.message : 'Sign-in failed.');
                } finally {
                    pending.current = false;
                    if (!cancelled) setBusy(false);
                }
            } });
            target.current.replaceChildren();
            api.renderButton(target.current, { theme: 'outline', size: 'large', text: 'continue_with' });
        }).catch(reason => { if (!cancelled) setError(reason.message); });
        return () => { cancelled = true; };
    }, [attempt]);
    return <View className="items-center gap-3">
        <div ref={target} aria-label={t('login.continueWithGoogle')} style={{ pointerEvents: busy ? 'none' : 'auto' }} />
        {busy && <Text>{t('common.loading')}</Text>}
        {!!error && <><Text accessibilityRole="alert">{error}</Text><TouchableOpacity onPress={() => setAttempt(value => value + 1)}><Text>Retry</Text></TouchableOpacity></>}
    </View>;
}
