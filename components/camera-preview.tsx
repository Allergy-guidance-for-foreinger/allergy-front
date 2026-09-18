import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Linking, Platform, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from '@/lib/i18n';
import type { CameraPreviewHandle, CameraPreviewProps } from './camera-preview.types';

export default forwardRef<CameraPreviewHandle, CameraPreviewProps>(function CameraPreview({ facing, onReadyChange }, ref) {
    const t = useTranslation();
    const camera = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [error, setError] = useState('');
    useImperativeHandle(ref, () => ({ capture: async () => {
        const photo = await camera.current?.takePictureAsync({ quality: 0.7, skipProcessing: Platform.OS === 'android' });
        if (!photo?.uri) throw new Error(t('camera.analyzeFailed'));
        return photo.uri;
    } }));
    if (!permission?.granted) return <View className="flex-1 items-center justify-center px-8">
        <Text className="text-white text-center mb-4">{t('camera.permission.message')}</Text>
        <TouchableOpacity onPress={() => {
            void (permission?.canAskAgain === false ? Linking.openSettings() : requestPermission()).catch(reason => setError(String(reason)));
        }}><Text className="text-orange-400">{t(permission?.canAskAgain === false ? 'camera.permission.openSettings' : 'camera.permission.grant')}</Text></TouchableOpacity>
        {!!error && <Text className="text-white">{error}</Text>}
    </View>;
    return <View style={{ flex: 1 }}>
        <CameraView key={facing} ref={camera} style={{ flex: 1 }} facing={facing}
            onCameraReady={() => onReadyChange(true)}
            onMountError={({ message }) => { onReadyChange(false); setError(message); }} />
        {!!error && <Text className="text-white" accessibilityRole="alert">{error}</Text>}
    </View>;
});
