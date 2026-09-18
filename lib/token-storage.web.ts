import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage uses localStorage on web. Fail explicitly if persistence is blocked.
// These values are not encrypted; an HttpOnly cookie requires a backend change.
export const tokenStorage = {
    getItem: (key: string): Promise<string | null> =>
        typeof window === 'undefined' ? Promise.resolve(null) : AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
    removeItem: (key: string) => AsyncStorage.removeItem(key),
};
