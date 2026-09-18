import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

// Preferences may remain usable in memory when browser storage is blocked/full.
// Do not use this fallback for auth tokens: login must report persistence failures.
const memory = new Map<string, string>();
let unavailable = false;
export const profileStorage: StateStorage = {
    async getItem(key) {
        if (unavailable) return memory.get(key) ?? null;
        try {
            const value = await AsyncStorage.getItem(key);
            if (value !== null) memory.set(key, value);
            return value;
        } catch (error) {
            unavailable = true;
            console.warn('Preferences are available for this session only:', error);
            return memory.get(key) ?? null;
        }
    },
    async setItem(key, value) {
        memory.set(key, value);
        if (unavailable) return;
        try { await AsyncStorage.setItem(key, value); }
        catch (error) {
            unavailable = true;
            console.warn('Preferences are available for this session only:', error);
        }
    },
    async removeItem(key) {
        memory.delete(key);
        if (!unavailable) {
            try { await AsyncStorage.removeItem(key); }
            catch { unavailable = true; }
        }
    },
};
