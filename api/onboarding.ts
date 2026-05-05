import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface OnboardingPayload {
    languageCode: string;
    schoolId: number;
    allergyCodes: string[];
    religiousCode: string | null;
    countryCode: string;
}

interface ErrorResponse {
    success: string;
    code: string;
    msg: string;
}

interface OnboardingResponse {
    success: string;
    data: OnboardingPayload & {
        onboardingCompleted: boolean;
    };
}

export const saveOnboardingProfile = async (payload: OnboardingPayload) => {
    const accessToken = await SecureStore.getItemAsync('accessToken');

    if (!accessToken) {
        throw new Error('Missing access token. Please log in again.');
    }

    const response = await fetch(`${API_URL}/api/v1/onboarding/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as ErrorResponse;
        const baseMessage = errorData.msg ?? `Server responded with ${response.status}`;
        const errorMessage = errorData.code ? `[${errorData.code}] ${baseMessage}` : baseMessage;
        throw new Error(errorMessage);
    }

    const result = await response.json().catch(() => ({})) as OnboardingResponse;
    return result.data;
};
