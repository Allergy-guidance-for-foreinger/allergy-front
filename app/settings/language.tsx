import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSettings from '../../components/settings/LanguageSettings';
import { ScrollView } from 'react-native';
import ScreenHeader from '../../components/ui/screen-header';

export default function SettingsLanguageScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="Language Settings" />

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <LanguageSettings showHeader={false} />
            </ScrollView>
        </SafeAreaView>
    );
}
