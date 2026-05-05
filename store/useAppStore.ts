import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeAllergies } from '@/constants/allergyList';
import { normalizeReligiousCode } from '@/data/religiousOptions';
import { normalizeSchoolId } from '@/data/schoolList';
import { normalizeCountryCode } from '@/data/countryList';
import { loadCurrentUserSettings } from '@/api/settings';

type AppState = {
    isLoggedIn: boolean;
    language: string;
    country: string;
    schoolId: number | null;
    religiousCode: string;
    allergies: string[];
    hasCompletedOnboarding: boolean;
    _hasHydrated: boolean;
}
type AppAction = {
    setLoggedIn: (status: boolean) => void;
    setLanguage: (lang: string) => void;
    setCountry: (country: string) => void;
    setSchoolId: (schoolId: number | null) => void;
    setReligiousCode: (religiousCode: string) => void;
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
            religiousCode: 'NONE',
            allergies: [],
            hasCompletedOnboarding: false,
            _hasHydrated: false,
            setLoggedIn: (status) => set({ isLoggedIn: status }),
            setLanguage: (lang) => set({ language: lang }),
            setCountry: (country) => set({ country: normalizeCountryCode(country) }),
            setSchoolId: (schoolId) => set({ schoolId }),
            setReligiousCode: (religiousCode) => set({ religiousCode: normalizeReligiousCode(religiousCode) }),
            setAllergies: (allergies) => set({ allergies: normalizeAllergies(allergies) }),
            resetProfile: () => set({
                language: 'en',
                country: '',
                schoolId: null,
                religiousCode: 'NONE',
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
                    if (settings.religiousCode) state.setReligiousCode(settings.religiousCode);
                    if (Array.isArray(settings.allergyCodes)) state.setAllergies(settings.allergyCodes);
                } catch (error) {
                    console.warn('Failed to hydrate settings from server:', error);
                }
            },
        }),
        {
            name: 'app-storage-b', // 기기에 저장될 파일명
            version: 5,
            storage: createJSONStorage(() => AsyncStorage), // AsyncStorage를 통해 영구 저장
            partialize: (state) => ({
                language: state.language,
                country: state.country,
                schoolId: state.schoolId,
                religiousCode: state.religiousCode,
                allergies: state.allergies,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),
            migrate: (persistedState) => {
                const state = persistedState as (Partial<AppState> & { school?: string }) | undefined;

                return {
                    ...(state ?? {}),
                    country: normalizeCountryCode(state?.country),
                    schoolId: normalizeSchoolId(state?.schoolId ?? state?.school ?? null),
                    religiousCode: normalizeReligiousCode(state?.religiousCode),
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
