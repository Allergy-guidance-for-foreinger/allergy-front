import * as SecureStore from 'expo-secure-store';


const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

interface AuthData {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
    onboardingCompleted: boolean;
}

interface ErrorResponse {
    success: string;
    code: string;
    msg: string;
}

interface LoginResponse {
    success: string; // boolean 아님
    data: AuthData;
}

interface UserMeResponse {
    success?: string | boolean;
    data?: {
        onboardingCompleted?: boolean;
        [key: string]: unknown;
    };
    onboardingCompleted?: boolean;
}

export interface SessionRestoreResult {
    isValid: boolean;
    onboardingCompleted?: boolean;
}

export const loginWithGoogleToken = async (idToken: string, deviceId: string) => {

    // ⭐️ 토큰을 body에 담아 전송
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            idToken,
            deviceId,
        }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ErrorResponse;
        const baseMessage = errorData.msg ?? `서버 응답 오류: ${response.status}`;
        const errorMessage = errorData.code
            ? `[${errorData.code}] ${baseMessage}`
            : baseMessage;
        throw new Error(errorMessage);
    }

    // JWT 받기
    const result = await response.json() as LoginResponse;
    const { accessToken, refreshToken } = result.data;

    if (!accessToken) {
        throw new Error('서버에서 토큰을 받지 못했습니다. 다시 시도해 주세요');
    }

    await SecureStore.setItemAsync('accessToken', accessToken);
    if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
    }
    console.log('JWT 발급 완료');
    return result.data;
};

const extractOnboardingCompleted = (payload: UserMeResponse): boolean | undefined => {
    if (typeof payload?.data?.onboardingCompleted === 'boolean') {
        return payload.data.onboardingCompleted;
    }

    if (typeof payload?.onboardingCompleted === 'boolean') {
        return payload.onboardingCompleted;
    }

    return undefined;
};

const fetchUserMe = async (accessToken: string): Promise<SessionRestoreResult> => {
    const response = await fetch(`${API_URL}/api/user/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (response.ok) {
        const payload = await response.json().catch(() => ({})) as UserMeResponse;
        return {
            isValid: true,
            onboardingCompleted: extractOnboardingCompleted(payload),
        };
    }

    return { isValid: false };
};

export const verifyAndRestoreSession = async (): Promise<SessionRestoreResult> => {
    try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!accessToken) return { isValid: false }; // 토큰이 없으면 실패

        const initialSession = await fetchUserMe(accessToken);
        if (initialSession.isValid) {
            console.log('액세스 토큰이 아직 쌩쌩합니다!');
            return initialSession;
        }

        if (refreshToken) {
            console.log('액세스 토큰 만료됨. 리프레시 토큰으로 갱신을 시도합니다...');

            const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (refreshRes.ok) {
                const refreshPayload = await refreshRes.json().catch(() => ({}));
                const refreshedAccessToken = refreshPayload?.data?.accessToken ?? refreshPayload?.accessToken;
                const refreshedRefreshToken = refreshPayload?.data?.refreshToken ?? refreshPayload?.refreshToken;

                if (refreshedAccessToken) {
                    await SecureStore.setItemAsync('accessToken', refreshedAccessToken);
                    if (refreshedRefreshToken) {
                        await SecureStore.setItemAsync('refreshToken', refreshedRefreshToken);
                    }

                    console.log('토큰 갱신 성공! 유저 모르게 생명 연장 완료.');
                    return fetchUserMe(refreshedAccessToken);
                }
            }
        }

        console.log('세션이 완전히 만료되었습니다. 로그아웃 처리합니다.');
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        return { isValid: false };

    } catch (error) {

        console.warn('네트워크 에러로 검증 불가:', error);
        return { isValid: false };
    }
};
