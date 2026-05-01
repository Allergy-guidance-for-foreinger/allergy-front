import AllergySettings from '../../components/settings/AllergySettings';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ui/screen-header';
export default function SettingsAllergy() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="Allergy Settings" />

            <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
                <AllergySettings showHeader={false} />
            </ScrollView>
        </SafeAreaView>
    );
}
