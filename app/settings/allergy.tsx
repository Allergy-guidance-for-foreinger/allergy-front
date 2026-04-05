import { router } from 'expo-router';
import AllergySelector from '../../components/settings/AllergySetting';

export default function SettingsAllergy() {
    return (
        <AllergySelector
            buttonText="완료"
            onPress={() => {
                // 설정이니까 수정을 마치고 뒤로 돌려보냅니다!
                router.back();
            }}
        />
    );
}