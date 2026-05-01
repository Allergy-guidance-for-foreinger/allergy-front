import { useEffect, useMemo } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/store/useAppStore';

type LanguageOption = {
    code: string;
    label: string;
};

interface LanguageSettingsProps {
    title?: string;
    subtitle?: string;
    options?: LanguageOption[];
}

const DEFAULT_OPTIONS: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
];

export default function LanguageSettings({
    title = 'Language',
    subtitle = '사용하실 언어를 선택해 주세요.',
    options = DEFAULT_OPTIONS,
}: LanguageSettingsProps) {
    const language = useAppStore((state) => state.language);
    const setLanguage = useAppStore((state) => state.setLanguage);
    const selectedLanguage = useMemo(() => {
        return options.some((option) => option.code === language) ? language : options[0]?.code ?? 'en';
    }, [language, options]);

    useEffect(() => {
        if (options.length > 0 && !options.some((option) => option.code === language)) {
            setLanguage(options[0].code);
        }
    }, [language, options, setLanguage]);

    return (
        <View className="px-5 pt-10">
            <Text className="text-3xl font-bold text-gray-900 mb-2">{title}</Text>
            <Text className="text-gray-500 text-lg mb-10">{subtitle}</Text>

            <View className="gap-y-4">
                {options.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        className={`py-5 px-5 rounded-3xl border-2 ${
                            selectedLanguage === lang.code ? 'border-black bg-pink-100' : 'border-gray-200 bg-white'
                        }`}
                        onPress={() => setLanguage(lang.code)}
                    >
                        <Text className={`text-xl font-semibold ${selectedLanguage === lang.code ? 'text-black' : 'text-gray-400'}`}>
                            {lang.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
