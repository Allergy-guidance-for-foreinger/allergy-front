import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { getCountryByCode } from '@/data/countryList';
import { mockTranslateQuestionToKorean } from '@/data/mockTranslation';
import { ActionButton } from '@/components/ui/action-button';

export default function TranslateScreen() {
    const country = useAppStore((state) => state.country);
    const countryMeta = useMemo(() => getCountryByCode(country), [country]);
    const [question, setQuestion] = useState('');
    const [translated, setTranslated] = useState('');

    const handleTranslate = () => {
        setTranslated(mockTranslateQuestionToKorean(question, countryMeta?.code));
    };

    const sourceLanguageLabel = countryMeta?.language ?? 'your language';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="pt-4 pb-6">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">Translate</Text>
                    <Text className="text-gray-500 text-lg">
                        Type your question in {sourceLanguageLabel}, then show the Korean result to staff.
                    </Text>
                </View>

                <View className="rounded-3xl bg-gray-50 px-5 py-4 mb-4">
                    <Text className="text-lg font-bold text-gray-900">Selected country</Text>
                    {countryMeta ? (
                        <>
                            <Text className="text-gray-600 mt-1">{countryMeta.label}</Text>
                            <Text className="text-gray-600">{countryMeta.language}</Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-gray-600 mt-1">No country selected yet.</Text>
                            <Text className="text-gray-600">Choose one in Settings to improve the translation hint.</Text>
                            <TouchableOpacity
                                className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3"
                                onPress={() => router.push('/settings/country' as any)}
                            >
                                <Text className="text-center font-semibold text-gray-900">Select country</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View className="rounded-3xl border border-gray-200 bg-white px-5 py-4 mb-4">
                    <Text className="text-sm font-semibold text-gray-500 mb-2">Question</Text>
                    <TextInput
                        value={question}
                        onChangeText={setQuestion}
                        placeholder={`Type your question in ${sourceLanguageLabel}`}
                        multiline
                        textAlignVertical="top"
                        className="min-h-[120px] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                    />
                    <View className="mt-4 items-center">
                        <ActionButton className="w-full" onPress={handleTranslate} disabled={!question.trim()}>
                            Translate to Korean
                        </ActionButton>
                    </View>
                </View>

                <View className="rounded-3xl border border-gray-200 bg-white px-5 py-4">
                    <Text className="text-sm font-semibold text-gray-500 mb-2">Korean result</Text>
                    <View className="rounded-2xl bg-gray-50 px-4 py-4 min-h-[120px]">
                        {translated ? (
                            <Text className="text-lg font-semibold text-gray-900">{translated}</Text>
                        ) : (
                            <Text className="text-gray-400">
                                Your translated message will appear here.
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
