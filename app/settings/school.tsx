import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import ScreenHeader from '../../components/ui/screen-header';
import SchoolSettings from '@/components/settings/SchoolSettings';

export default function SettingsSchoolScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="School Settings" />

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <SchoolSettings showHeader={false} />
            </ScrollView>
        </SafeAreaView>
    );
}
