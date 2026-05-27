import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeAllergies } from '@/constants/allergyList';
import { normalizeReligiousCodes, singleToReligiousCodes } from '@/data/religiousOptions';
import { normalizeSchoolId } from '@/data/schoolList';
import { normalizeCountryCode } from '@/data/countryList';
import { loadCurrentUserSettings } from '@/api/settings';

type AppState = {
    isLoggedIn: boolean;
    language: string;
    country: string;
    schoolId: number | null;
    // 종교 제한 — 다중 선택 지원 ([] = 제한 없음, ['HALAL', 'VEGAN'] = 복합)
    religiousCodes: string[];
    allergies: string[];
    hasCompletedOnboarding: boolean;
    _hasHydrated: boolean;
}
type AppAction = {
    setLoggedIn: (status: boolean) => void;
    setLanguage: (lang: string) => void;
    setCountry: (country: string) => void;
    setSchoolId: (schoolId: number | null) => void;
    setReligiousCodes: (religiousCodes: string[]) => void;
    setAllergies: (allergies: string[]) => void;
    resetProfile: () => void;
    completeOnboarding: () => void;
    setHasCompletedOnboarding: (status: boolean) => void;
    setHasHydrated: (status: boolean) => void;
    hydrateFromServerSettings: () => Promise<void>;
}

type AppStore = AppState & AppAction;

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
            isLoggedIn: false,
            language: 'en',
            country: '',
            schoolId: null,
            religiousCodes: [],
            allergies: [],
            hasCompletedOnboarding: false,
            _hasHydrated: false,
            setLoggedIn: (status) => set({ isLoggedIn: status }),
            setLanguage: (lang) => set({ language: lang }),
            setCountry: (country) => set({ country: normalizeCountryCode(country) }),
            setSchoolId: (schoolId) => set({ schoolId }),
            setReligiousCodes: (religiousCodes) => set({ religiousCodes: normalizeReligiousCodes(religiousCodes) }),
            setAllergies: (allergies) => set({ allergies: normalizeAllergies(allergies) }),
            resetProfile: () => set({
                language: 'en',
                country: '',
                schoolId: null,
                religiousCodes: [],
                allergies: [],
                hasCompletedOnboarding: false,
            }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            setHasCompletedOnboarding: (status) => set({ hasCompletedOnboarding: status }),
            setHasHydrated: (status) => set({ _hasHydrated: status }),
            hydrateFromServerSettings: async () => {
                try {
                    const settings = await loadCurrentUserSettings();
                    const state = get();
                    if (settings.languageCode) state.setLanguage(settings.languageCode);
                    if (settings.countryCode) state.setCountry(settings.countryCode);
                    if (typeof settings.schoolId === 'number') state.setSchoolId(settings.schoolId);
                    if (Array.isArray(settings.religiousCodes)) state.setReligiousCodes(settings.religiousCodes);
                    if (Array.isArray(settings.allergyCodes)) state.setAllergies(settings.allergyCodes);
                } catch (error) {
                    console.warn('Failed to hydrate settings from server:', error);
                }
            },
        }),
        {
            name: 'app-storage-b', // 기기에 저장될 파일명
            version: 6, // v5 → v6: religiousCode(단수) → religiousCodes(배열)
            storage: createJSONStorage(() => AsyncStorage), // AsyncStorage를 통해 영구 저장
            partialize: (state) => ({
                language: state.language,
                country: state.country,
                schoolId: state.schoolId,
                religiousCodes: state.religiousCodes,
                allergies: state.allergies,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),
            migrate: (persistedState) => {
                // 옛 버전엔 religiousCode: string 단수 필드가 있었음 → 배열로 변환.
                const state = persistedState as
                    | (Partial<AppState> & { school?: string; religiousCode?: string | null })
                    | undefined;

                const legacyReligious = state?.religiousCode;
                const religiousCodes = Array.isArray(state?.religiousCodes)
                    ? normalizeReligiousCodes(state.religiousCodes)
                    : singleToReligiousCodes(legacyReligious);

                return {
                    ...(state ?? {}),
                    country: normalizeCountryCode(state?.country),
                    schoolId: normalizeSchoolId(state?.schoolId ?? state?.school ?? null),
                    religiousCodes,
                    allergies: normalizeAllergies(state?.allergies ?? []),
                    hasCompletedOnboarding: state?.hasCompletedOnboarding ?? false,
                };
            },
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
