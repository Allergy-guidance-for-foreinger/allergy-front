import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeAllergies } from '@/constants/allergyList';

type AppState = {
    isLoggedIn: boolean;
    language: string;
    country: string;
    school: string;
    allergies: string[];
    hasCompletedOnboarding: boolean;
    _hasHydrated: boolean;
}
type AppAction = {
    setLoggedIn: (status: boolean) => void;
    setLanguage: (lang: string) => void;
    setCountry: (country: string) => void;
    setSchool: (school: string) => void;
    setAllergies: (allergies: string[]) => void;
    completeOnboarding: () => void;
    setHasHydrated: (status: boolean) => void;
}

type AppStore = AppState & AppAction;

export const useAppStore = create<AppStore>()(
    persist(
        (set) => ({
            isLoggedIn: false,
            language: 'en',
            country: '',
            school: '',
            allergies: [],
            hasCompletedOnboarding: false,
            _hasHydrated: false,
            setLoggedIn: (status) => set({ isLoggedIn: status }),
            setLanguage: (lang) => set({ language: lang }),
            setCountry: (country) => set({ country }),
            setSchool: (school) => set({ school }),
            setAllergies: (allergies) => set({ allergies: normalizeAllergies(allergies) }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            setHasHydrated: (status) => set({ _hasHydrated: status }),
        }),
        {
            name: 'app-storage-b', // 기기에 저장될 파일명
            version: 2,
            storage: createJSONStorage(() => AsyncStorage), // AsyncStorage를 통해 영구 저장
            partialize: (state) => ({
                language: state.language,
                country: state.country,
                school: state.school,
                allergies: state.allergies,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),
            migrate: (persistedState) => {
                const state = persistedState as Partial<AppState> | undefined;

                return {
                    ...(state ?? {}),
                    allergies: normalizeAllergies(state?.allergies ?? []),
                };
            },
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
