import * as SecureStore from 'expo-secure-store';
import { refreshAccessToken } from '@/api/auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export type SuccessResponse<T> = {
    success: string | boolean;
    data: T;
};

type ErrorResponse = {
    success?: string;
    code?: string;
    msg?: string;
};

// 인증이 완전히 만료됐을 때(=토큰도 없거나 refresh도 실패) 호출되는 콜백.
// app/_layout.tsx에서 등록 → zustand 초기화 + setLoggedIn(false) 수행.
let onAuthExpired: (() => void) | null = null;

export function setOnAuthExpired(callback: (() => void) | null) {
    onAuthExpired = callback;
}

// 401 발생 시 refresh 후 1회만 재시도. refresh도 실패하면 onAuthExpired 트리거.
export async function authedFetch(
    path: string,
    init?: RequestInit,
    isRetry = false
): Promise<Response> {
    const accessToken = await SecureStore.getItemAsync('accessToken');

    if (!accessToken) {
        onAuthExpired?.();
        throw new Error('Missing access token. Please log in again.');
    }

    // FormData(이미지 업로드 등)는 fetch가 boundary 포함 Content-Type을 자동 생성하므로,
    // 'application/json'을 강제하면 안 됨. body가 FormData면 Content-Type을 직접 지정하지 않는다.
    const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        ...((init?.headers as Record<string, string>) ?? {}),
    };
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...init,
        headers,
    });

    if (response.status === 401 && !isRetry) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            return authedFetch(path, init, true);
        }
        onAuthExpired?.();
    }

    return response;
}

export async function parseError(response: Response): Promise<string> {
    const errorData = (await response.json().catch(() => ({}))) as ErrorResponse;
    const baseMessage = errorData.msg ?? `Server responded with ${response.status}`;
    return errorData.code ? `[${errorData.code}] ${baseMessage}` : baseMessage;
}

export async function requestJson<T>(
    path: string,
    init?: RequestInit
): Promise<SuccessResponse<T>> {
    const response = await authedFetch(path, init);

    if (!response.ok) {
        throw new Error(await parseError(response));
    }

    return (await response.json().catch(() => ({}))) as SuccessResponse<T>;
}
