import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import CountrySettings from '../../components/settings/CountrySettings';
import ScreenHeader from '../../components/ui/screen-header';

export default function SettingsCountryScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="Country Settings" />

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <CountrySettings showHeader={false} />
            </ScrollView>
        </SafeAreaView>
    );
}
