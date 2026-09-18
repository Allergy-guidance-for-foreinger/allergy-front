export type CameraPreviewHandle = { capture: () => Promise<string> };
export type CameraPreviewProps = {
    facing: 'front' | 'back';
    onReadyChange: (ready: boolean) => void;
};
