import { Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';

const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
    { code: 'zh', label: '中文' },
];

export default function LanguageScreen() {
    const { language, setLanguage } = useAppStore();

    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome!</Text>
                <Text className="text-gray-500 text-lg mb-10">사용하실 언어를 선택해 주세요.</Text>

                <View className="gap-y-4">
                    {LANGUAGES.map((lang) => (
                        <TouchableOpacity
                            key={lang.code}
                            // 선택된 언어면 까만 테두리, 아니면 회색 테두리
                            className={`py-5 px-6 rounded-2xl border-2 ${
                                language === lang.code ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'
                            }`}
                            onPress={() => setLanguage(lang.code)}
                        >
                            <Text className={`text-xl font-semibold ${language === lang.code ? 'text-black' : 'text-gray-600'}`}>
                                {lang.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 학교 선택으로 넘어가는 스택 push */}
            <TouchableOpacity
                className="w-full bg-black py-4 rounded-xl items-center mb-5"
                onPress={() => router.push('/onboarding/school' as any)}
            >
                <Text className="text-white text-lg font-bold">다음으로 (Next)</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}