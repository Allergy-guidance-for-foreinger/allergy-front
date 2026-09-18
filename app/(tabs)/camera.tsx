import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useAppStore } from '@/store/useAppStore';
import { analyzeFoodImage, normalizeFoodAnalysisResult } from '@/api/scan';
import { useTranslation, t as tFn } from '@/lib/i18n';
import { Alert } from '@/lib/alert';
import CameraPreview from '@/components/camera-preview';
import type { CameraPreviewHandle } from '@/components/camera-preview.types';

export default function CameraScreen() {
    const t = useTranslation();
    const isFocused = useIsFocused();
    const isLoggedIn = useAppStore(state => state.isLoggedIn);
    const hasCompletedOnboarding = useAppStore(state => state.hasCompletedOnboarding);
    const camera = useRef<CameraPreviewHandle>(null);
    const busy = useRef(false);
    const [facing, setFacing] = useState<'back' | 'front'>('back');
    const [ready, setReady] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const onReadyChange = useCallback((value: boolean) => setReady(value), []);
    const setCurrentScanResult = useAppStore(state => state.setCurrentScanResult);

    const analyze = async (imageUri: string) => {
        const response = await analyzeFoodImage(imageUri);
        setCurrentScanResult({ imageUri, response: { ...response, data: normalizeFoodAnalysisResult(response.data) } });
        router.push('/scan-result');
    };
    const perform = async (action: () => Promise<void>) => {
        if (busy.current) return;
        busy.current = true;
        setIsAnalyzing(true);
        try { await action(); }
        catch (error) { Alert.alert(tFn('camera.analyzeFailed'), error instanceof Error ? error.message : tFn('common.tryAgain')); }
        finally { busy.current = false; setIsAnalyzing(false); }
    };
    const capture = () => {
        if (!ready || !isFocused || !camera.current) return;
        void perform(async () => { await analyze(await camera.current!.capture()); });
    };
    const pick = () => {
        void perform(async () => {
            // On web, open the picker immediately within the user's click gesture.
            if (Platform.OS !== 'web') {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) throw new Error(tFn('camera.galleryPermission'));
            }
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
            if (!result.canceled && result.assets?.[0]?.uri) await analyze(result.assets[0].uri);
        });
    };
    return <View className="flex-1 bg-black">
        {isFocused && isLoggedIn && hasCompletedOnboarding && <CameraPreview ref={camera} facing={facing} onReadyChange={onReadyChange} />}
        <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0" pointerEvents="none">
            <View className="px-5 pt-2"><Text className="text-white text-xl font-bold">{t('camera.title')}</Text>
                <Text className="text-white/80 text-sm mt-1">{t('camera.subtitle')}</Text></View>
        </SafeAreaView>
        <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0">
            <View className="flex-row items-center justify-between px-10 pb-6 pt-4">
                <TouchableOpacity onPress={pick} disabled={isAnalyzing} accessibilityRole="button" accessibilityLabel={t('camera.pickFromGallery')} className="w-12 h-12 rounded-full bg-black/40 items-center justify-center">
                    <Ionicons name="images-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={capture} disabled={!ready || !isFocused || isAnalyzing} accessibilityRole="button" accessibilityLabel={t('camera.capture')} style={{ opacity: ready ? 1 : 0.4 }} className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
                    {isAnalyzing ? <ActivityIndicator size="large" color="white" /> : <View className="w-16 h-16 rounded-full bg-white" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setReady(false); setFacing(value => value === 'back' ? 'front' : 'back'); }} disabled={isAnalyzing} accessibilityRole="button" accessibilityLabel={t('camera.flipCamera')} className="w-12 h-12 rounded-full bg-black/40 items-center justify-center">
                    <Ionicons name="camera-reverse-outline" size={26} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
        {isAnalyzing && <View className="absolute inset-0 bg-black/50 items-center justify-center" pointerEvents="none">
            <ActivityIndicator size="large" color="white" /><Text className="text-white text-base font-semibold mt-3">{t('camera.analyzing')}</Text>
        </View>}
    </View>;
}
