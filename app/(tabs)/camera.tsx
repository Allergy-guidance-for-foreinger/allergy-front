import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import ScanResultSheet from '@/components/scan-result-sheet';
import { analyzeFoodImage, type FoodAnalysisResult } from '@/api/scan';
import { useTranslation, t as tFn } from '@/lib/i18n';

export default function CameraScreen() {
    const t = useTranslation();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);

    const [facing, setFacing] = useState<CameraType>('back');
    // 탭에서 벗어나면 카메라 unmount (배터리/프라이버시), 다시 들어오면 mount.
    const [isActive, setIsActive] = useState(true);

    // AI 분석 상태 + 결과 시트
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<FoodAnalysisResult | null>(null);
    const scanResultRef = useRef<BottomSheetModal>(null);

    useFocusEffect(
        useCallback(() => {
            setIsActive(true);
            return () => setIsActive(false);
        }, [])
    );

    // 촬영/갤러리 공통 분석 흐름: URI → 업로드 → 결과 시트.
    // ⚠️ 훅(useCallback)이므로 반드시 early return보다 위에 선언 (Rules of Hooks).
    const runAnalysis = useCallback(async (imageUri: string) => {
        try {
            setIsAnalyzing(true);
            const response = await analyzeFoodImage(imageUri);
            setAnalysis(response.data);
            scanResultRef.current?.present();
        } catch (error: any) {
            Alert.alert(
                tFn('camera.analyzeFailed'),
                error?.message ?? tFn('common.tryAgain')
            );
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    // ─── 권한 미결정 ───
    if (!permission) {
        return (
            <SafeAreaView className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">···</Text>
            </SafeAreaView>
        );
    }

    // ─── 권한 거부 상태 UI ───
    if (!permission.granted) {
        const handleGrant = async () => {
            const next = await requestPermission();
            if (!next.granted && !next.canAskAgain) {
                // 두 번 거부 → 설정 앱으로 유도
                Alert.alert(
                    tFn('camera.permission.title'),
                    tFn('camera.permission.message'),
                    [
                        { text: tFn('common.cancel'), style: 'cancel' },
                        {
                            text: tFn('camera.permission.openSettings'),
                            onPress: () => Linking.openSettings(),
                        },
                    ]
                );
            }
        };

        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-6">
                        <Ionicons name="camera-outline" size={40} color="#6B7280" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                        {t('camera.permission.title')}
                    </Text>
                    <Text className="text-base text-gray-600 text-center leading-6 mb-8">
                        {t('camera.permission.message')}
                    </Text>
                    <TouchableOpacity
                        onPress={handleGrant}
                        className="bg-orange-500 rounded-full px-8 py-3"
                    >
                        <Text className="text-white font-semibold text-base">
                            {t('camera.permission.grant')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // ─── 정상 카메라 미리보기 ───
    const handleCapture = async () => {
        if (!cameraRef.current || isAnalyzing) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                skipProcessing: Platform.OS === 'android',
            });
            if (!photo?.uri) throw new Error(tFn('camera.analyzeFailed'));
            await runAnalysis(photo.uri);
        } catch (error: any) {
            Alert.alert(tFn('camera.analyzeFailed'), error?.message ?? tFn('common.tryAgain'));
        }
    };

    // 갤러리에서 기존 사진 선택 → 분석. (시뮬레이터에서도 동작!)
    const handlePickFromGallery = async () => {
        if (isAnalyzing) return;
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert(t('camera.title'), tFn('camera.galleryPermission'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
        });

        if (result.canceled) return;
        const uri = result.assets?.[0]?.uri;
        if (uri) await runAnalysis(uri);
    };

    const toggleFacing = () =>
        setFacing((prev) => (prev === 'back' ? 'front' : 'back'));

    return (
        <View className="flex-1 bg-black">
            {isActive ? (
                <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing={facing}
                    // 추후 AI 연동 시 onBarcodeScanned 등 props 추가 예정.
                />
            ) : (
                <View className="flex-1 bg-black" />
            )}

            {/* 상단 안내 */}
            <SafeAreaView
                edges={['top']}
                className="absolute top-0 left-0 right-0"
                pointerEvents="none"
            >
                <View className="px-5 pt-2">
                    <Text className="text-white text-xl font-bold">
                        {t('camera.title')}
                    </Text>
                    <Text className="text-white/80 text-sm mt-1">
                        {t('camera.subtitle')}
                    </Text>
                </View>
            </SafeAreaView>

            {/* 하단 컨트롤 */}
            <SafeAreaView
                edges={['bottom']}
                className="absolute bottom-0 left-0 right-0"
            >
                <View className="flex-row items-center justify-between px-10 pb-6 pt-4">
                    {/* 갤러리에서 선택 (좌측) */}
                    <TouchableOpacity
                        onPress={handlePickFromGallery}
                        disabled={isAnalyzing}
                        accessibilityLabel={t('camera.pickFromGallery')}
                        className="w-12 h-12 rounded-full bg-black/40 items-center justify-center"
                    >
                        <Ionicons name="images-outline" size={24} color="white" />
                    </TouchableOpacity>

                    {/* 촬영 버튼 (분석 중엔 스피너) */}
                    <TouchableOpacity
                        onPress={handleCapture}
                        disabled={isAnalyzing}
                        activeOpacity={0.7}
                        accessibilityLabel={t('camera.capture')}
                        className="w-20 h-20 rounded-full border-4 border-white items-center justify-center"
                    >
                        {isAnalyzing ? (
                            <ActivityIndicator size="large" color="white" />
                        ) : (
                            <View className="w-16 h-16 rounded-full bg-white" />
                        )}
                    </TouchableOpacity>

                    {/* 전후면 전환 */}
                    <TouchableOpacity
                        onPress={toggleFacing}
                        disabled={isAnalyzing}
                        accessibilityLabel={t('camera.flipCamera')}
                        className="w-12 h-12 rounded-full bg-black/40 items-center justify-center"
                    >
                        <Ionicons name="camera-reverse-outline" size={26} color="white" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* 분석 중 전체 오버레이 */}
            {isAnalyzing ? (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <ActivityIndicator size="large" color="white" />
                    <Text className="text-white text-base font-semibold mt-3">
                        {t('camera.analyzing')}
                    </Text>
                </View>
            ) : null}

            {/* 분석 결과 바텀시트 */}
            <ScanResultSheet ref={scanResultRef} result={analysis} />
        </View>
    );
}
