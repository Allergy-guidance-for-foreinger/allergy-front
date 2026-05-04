import { useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { COUNTRY_LIST, normalizeCountryQuery, getCountryByCode } from '@/data/countryList';
import { Ionicons } from '@expo/vector-icons';

interface CountrySettingsProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
}

export default function CountrySettings({
    title = 'Country / Region',
    subtitle = 'Choose your country or region.',
    showHeader = true,
}: CountrySettingsProps) {
    const country = useAppStore((state) => state.country);
    const setCountry = useAppStore((state) => state.setCountry);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const selectedCountry = useMemo(() => getCountryByCode(country), [country]);

    const filteredCountries = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        if (!query) return COUNTRY_LIST;

        return COUNTRY_LIST.filter((item) =>
            normalizeCountryQuery(item).some((value) => value.toLowerCase().includes(query))
        );
    }, [searchQuery]);

    const handleSelect = (code: string) => {
        setCountry(code);
        setIsPickerOpen(false);
    };

    return (
        <View className="px-5 pt-10">
            {showHeader ? (
                <>
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{title}</Text>
                    <Text className="text-gray-500 text-lg mb-6">{subtitle}</Text>
                </>
            ) : null}

            <TouchableOpacity
                className="flex-row items-center justify-between rounded-3xl border border-gray-200 bg-white px-4 py-4 active:bg-gray-50"
                onPress={() => setIsPickerOpen(true)}
            >
                <View className="flex-row items-center flex-1 pr-3">
                    <Text className="mr-3 text-xl">{selectedCountry?.flag ?? '🌍'}</Text>
                    <View className="flex-1">
                        <Text className="text-sm text-gray-500">Country / Region</Text>
                        <Text className="text-lg font-semibold text-gray-900">
                            {selectedCountry?.label ?? 'Select a country'}
                        </Text>
                    </View>
                </View>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            <Modal
                visible={isPickerOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsPickerOpen(false)}
            >
                <View className="flex-1">
                    <TouchableOpacity
                        activeOpacity={1}
                        className="absolute inset-0 bg-black/40"
                        onPress={() => setIsPickerOpen(false)}
                    />

                    <View className="absolute left-4 right-4 top-20 rounded-3xl bg-white p-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-semibold text-gray-900">Select country</Text>
                            <TouchableOpacity
                                onPress={() => setIsPickerOpen(false)}
                                className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
                            >
                                <Ionicons name="close" size={18} color="#111827" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search countries"
                            autoCapitalize="none"
                            className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                        />

                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            keyboardShouldPersistTaps="handled"
                            style={{ maxHeight: 420 }}
                            renderItem={({ item }) => {
                                const isSelected = item.code === country;

                                return (
                                    <TouchableOpacity
                                        className={`mb-2 flex-row items-center rounded-2xl px-4 py-4 ${
                                            isSelected ? 'bg-red-50' : 'bg-gray-50'
                                        }`}
                                        onPress={() => handleSelect(item.code)}
                                    >
                                        <Text className="mr-3 text-2xl">{item.flag}</Text>
                                        <View className="flex-1 pr-3">
                                            <Text className="text-base font-semibold text-gray-900">{item.label}</Text>
                                            <Text className="text-sm text-gray-500">{item.officialName}</Text>
                                        </View>
                                        {isSelected ? (
                                            <Ionicons name="checkmark" size={20} color="#dc2626" />
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View className="items-center rounded-2xl bg-gray-50 px-4 py-10">
                                    <Text className="text-gray-500">No countries match your search.</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
