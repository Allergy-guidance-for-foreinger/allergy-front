import { requestJson } from '@/api/client';

export interface OnboardingPayload {
    languageCode: string;
    schoolId: number;
    allergyCodes: string[];
    // 다중 종교 제한 — 빈 배열은 "제한 없음"으로 해석됨.
    religiousCodes: string[];
    countryCode: string;
}

type OnboardingResponseData = OnboardingPayload & {
    onboardingCompleted: boolean;
};

export const saveOnboardingProfile = async (payload: OnboardingPayload) => {
    const result = await requestJson<OnboardingResponseData>('/api/v1/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return result.data;
};
