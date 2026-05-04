import AllergySettings from '../../components/settings/AllergySettings';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/ui/screen-header';
export default function SettingsAllergy() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScreenHeader title="Allergy Settings" />

            <View className="flex-1">
                <AllergySettings showHeader={false} />
            </View>
        </SafeAreaView>
    );
}
