import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import type { CameraPreviewHandle, CameraPreviewProps } from './camera-preview.types';

function cameraMessage(reason: unknown): string {
    const name = reason instanceof DOMException ? reason.name : '';
    if (name === 'NotAllowedError') return 'Camera access was denied. Allow camera access in your browser site settings and retry.';
    if (name === 'NotFoundError') return 'No camera was found. Connect a camera or choose a photo below.';
    if (name === 'NotReadableError') return 'The camera is busy or unavailable. Close other camera apps and retry.';
    return reason instanceof Error ? reason.message : 'Could not start the camera. You can also choose a photo below.';
}

export default forwardRef<CameraPreviewHandle, CameraPreviewProps>(function CameraPreview({ facing, onReadyChange }, ref) {
    const video = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');
    const [attempt, setAttempt] = useState(0);
    useImperativeHandle(ref, () => ({ capture: async () => {
        const element = video.current;
        if (!element || element.readyState < 2 || !element.videoWidth) throw new Error('The camera is not ready yet.');
        const canvas = document.createElement('canvas');
        canvas.width = element.videoWidth;
        canvas.height = element.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not capture the photo.');
        context.drawImage(element, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.7);
    } }));
    useEffect(() => {
        let disposed = false;
        let generation = 0;
        let stream: MediaStream | null = null;
        const element = video.current;
        const stop = () => {
            generation += 1;
            stream?.getTracks().forEach(track => track.stop());
            stream = null;
            if (element) element.srcObject = null;
            onReadyChange(false);
        };
        const start = async () => {
            stop();
            if (disposed || document.hidden) return;
            const current = generation;
            setError('');
            try {
                if (!window.isSecureContext) throw new Error('Camera access requires HTTPS or localhost. You can still choose a photo below.');
                if (!navigator.mediaDevices?.getUserMedia) throw new Error('This browser does not support camera access. Choose a photo below.');
                const acquired = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: facing === 'back' ? 'environment' : 'user' } } });
                // Permission may resolve after switching tabs/unmounting; release that stream too.
                if (disposed || current !== generation) {
                    acquired.getTracks().forEach(track => track.stop());
                    return;
                }
                stream = acquired;
                if (element) {
                    element.srcObject = acquired;
                    await element.play();
                }
            } catch (reason) {
                if (!disposed && current === generation) {
                    stop();
                    setError(cameraMessage(reason));
                }
            }
        };
        const visibility = () => { if (document.hidden) stop(); else void start(); };
        document.addEventListener('visibilitychange', visibility);
        void start();
        return () => {
            disposed = true;
            document.removeEventListener('visibilitychange', visibility);
            stop();
        };
    }, [facing, attempt, onReadyChange]);
    return <View style={{ flex: 1 }}>
        <video ref={video} autoPlay playsInline muted aria-label="Camera preview"
            onLoadedData={() => onReadyChange(true)}
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', transform: facing === 'front' ? 'scaleX(-1)' : undefined }} />
        {!!error && <View className="flex-1 items-center justify-center px-8 bg-black">
            <Text accessibilityRole="alert" className="text-white text-center mb-4">{error}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => setAttempt(value => value + 1)}><Text className="text-orange-400">Retry camera</Text></TouchableOpacity>
        </View>}
    </View>;
});
