import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import * as SplashScreen from 'expo-splash-screen';
import { verifyAndRestoreSession } from '@/api/auth';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
    const isLoggedIn = useAppStore((state) => state.isLoggedIn);
    const setLoggedIn = useAppStore((state) => state.setLoggedIn);
    const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);
    const resetProfile = useAppStore((state) => state.resetProfile);
    const hydrateFromServerSettings = useAppStore((state) => state.hydrateFromServerSettings);
    const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
    const hasHydrated = useAppStore((state) => state._hasHydrated);
    const router = useRouter();
    const segments = useSegments();
    const rootNavigationState = useRootNavigationState();

    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {

        async function prepare() {
            try {
                console.log('자동 로그인 검사 시작');
                const session = await verifyAndRestoreSession();

                setLoggedIn(session.isValid);
                if (typeof session.onboardingCompleted === 'boolean') {
                    setHasCompletedOnboarding(session.onboardingCompleted);
                }

                if (session.isValid && session.onboardingCompleted) {
                    await hydrateFromServerSettings();
                }

                if (!session.isValid) {
                    resetProfile();
                }
            } catch (error) {
                console.warn('자동 로그인 에러:', error);
                setLoggedIn(false);
                resetProfile();
            } finally {
                setIsAppReady(true);
            }
        }
        // 함수 호출
        prepare();
    }, [hydrateFromServerSettings, resetProfile, setHasCompletedOnboarding, setLoggedIn]);

    useEffect(() => {
        // 네비게이션이 준비되지 않았거나, 토큰 검사가 아직 안 끝났다면 리턴
        if (!rootNavigationState?.key || !isAppReady || !hasHydrated) return;

        const inAuthGroup = segments[0] === 'onboarding';
        const inTabsGroup = segments[0] === '(tabs)' || segments[0] === 'main';
        const inSettingsGroup = segments[0] === 'settings';
        const inMealDetailGroup = segments[0] === 'meal-detail';
        if (!isLoggedIn && segments.length > 0) {
            router.replace('/');
        } else if (isLoggedIn && !hasCompletedOnboarding && !inAuthGroup) {
            router.replace('/onboarding/language');
        } else if (isLoggedIn && hasCompletedOnboarding && !inTabsGroup && !inSettingsGroup && !inMealDetailGroup) {
            router.replace('/main');
        }

        // 라우팅 결정이 끝났으니 스플래시 화면 치우기
        SplashScreen.hideAsync();

    }, [hasCompletedOnboarding, hasHydrated, isAppReady, isLoggedIn, rootNavigationState?.key, router, segments]);

    return (
        <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="meal-detail" options={{ animation: 'slide_from_right' }} />
            </Stack>
        </QueryClientProvider>
    );
}
