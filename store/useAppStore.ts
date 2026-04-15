import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = {
    isLoggedIn: boolean;
    language: string;
    school: string;
    allergies: string[];
    hasCompletedOnboarding: boolean;
    _hasHydrated: boolean;
}
type AppAction = {
    setLoggedIn: (status: boolean) => void;
    setLanguage: (lang: string) => void;
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
            school: '',
            allergies: [],
            hasCompletedOnboarding: false,
            _hasHydrated: false,
            setLoggedIn: (status) => set({ isLoggedIn: status }),
            setLanguage: (lang) => set({ language: lang }),
            setSchool: (school) => set({ school }),
            setAllergies: (allergies) => set({ allergies }),
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            setHasHydrated: (status) => set({ _hasHydrated: status }),
        }),
        {
            name: 'app-storage-b', // 기기에 저장될 파일명
            storage: createJSONStorage(() => AsyncStorage), // AsyncStorage를 통해 영구 저장
            partialize: (state) => ({
                language: state.language,
                school: state.school,
                allergies: state.allergies,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);