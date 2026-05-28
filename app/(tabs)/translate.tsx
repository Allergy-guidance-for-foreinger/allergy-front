import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { translateText } from '@/api/translation';
import { ActionButton } from '@/components/ui/action-button';
import { useTranslation, t as tFn } from '@/lib/i18n';

export default function TranslateScreen() {
    const t = useTranslation();
    const [question, setQuestion] = useState('');
    const [translated, setTranslated] = useState('');

    const translateMutation = useMutation({
        // AI가 입력 언어를 자동 감지해 한국어로 번역
        // sourceLang='en' / targetLang='ko'는 고정으로 할 것
        mutationFn: (text: string) => translateText(text),
        onSuccess: (response) => {
            setTranslated(response?.data?.translatedText ?? '');
        },
        onError: (error: any) => {
            Alert.alert(tFn('translate.failed'), error?.message ?? tFn('common.tryAgain'));
        },
    });

    const handleTranslate = () => {
        const trimmed = question.trim();
        if (!trimmed || translateMutation.isPending) return;
        translateMutation.mutate(trimmed);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="pt-4 pb-6">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{t('translate.title')}</Text>
                    <Text className="text-gray-500 text-lg">{t('translate.description')}</Text>
                </View>

                <View className="rounded-3xl border border-gray-200 bg-white px-5 py-4 mb-4">
                    <Text className="text-sm font-semibold text-gray-500 mb-2">{t('translate.question')}</Text>
                    <TextInput
                        value={question}
                        onChangeText={setQuestion}
                        placeholder={t('translate.placeholder')}
                        multiline
                        textAlignVertical="top"
                        className="min-h-[120px] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                    />
                    <View className="mt-4 items-center">
                        <ActionButton
                            className="w-full"
                            onPress={handleTranslate}
                            disabled={!question.trim() || translateMutation.isPending}
                        >
                            {translateMutation.isPending
                                ? t('translate.translating')
                                : t('translate.button')}
                        </ActionButton>
                    </View>
                </View>

                <View className="rounded-3xl border border-gray-200 bg-white px-5 py-4">
                    <Text className="text-sm font-semibold text-gray-500 mb-2">{t('translate.koreanResult')}</Text>
                    <View className="rounded-2xl bg-gray-50 px-4 py-4 min-h-[120px]">
                        {translateMutation.isPending ? (
                            <Text className="text-gray-400">{t('translate.translating')}</Text>
                        ) : translated ? (
                            <Text className="text-lg font-semibold text-gray-900">{translated}</Text>
                        ) : (
                            <Text className="text-gray-400">
                                {t('translate.translatedPlaceholder')}
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
