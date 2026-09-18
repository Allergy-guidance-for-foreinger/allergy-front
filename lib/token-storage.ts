import * as SecureStore from 'expo-secure-store';

// Keep native credentials in the OS keychain. Metro selects .web.ts in browsers.
export const tokenStorage = {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync,
};
