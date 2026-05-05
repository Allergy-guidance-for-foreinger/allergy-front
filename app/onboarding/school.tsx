import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import SchoolSettings from '@/components/settings/SchoolSettings';
import { ActionButton } from '@/components/ui/action-button';

export default function SchoolScreen() {
    const schoolId = useAppStore((state) => state.schoolId);

    return (
            <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <SchoolSettings title="School" subtitle="Select your school." persistToServer={false} />
            </ScrollView>

            <View className="flex-row bg-white px-5 pt-6 gap-x-4 justify-center">
                <ActionButton className="mb-5" onPress={() => router.back()}>
                    Back
                </ActionButton>
                <ActionButton
                    className="mb-5"
                    disabled={schoolId === null}
                    onPress={() => router.push('/onboarding/allergy' as any)}
                >
                    Next
                </ActionButton>
            </View>
        </SafeAreaView>
    );
}
