import { requestJson } from '@/api/client';

export interface FoodAnalysisResult {
    analysisLogId: number;
    resultSource: string; // "STORED_AI_ANALYSIS" 등
    identifiedFoodKoreanName: string;        // 한국어 음식명
    identifiedFoodTranslationName: string;   // 사용자 언어로 번역된 음식명
    identifiedFoodPronunciationName: string; // 발음 표기 (로마자 등)
    identifiedFoodNameReason: string;        // AI가 이 음식으로 판단한 근거
    imageConfidence: number;                 // 인식 신뢰도 (0~1 또는 0~100)
    spicyLevel: number;
    ingredients: string[];                   // 검출된 전체 재료
    allergies: string[];                     // 검출된 전체 알러지 항원
    matchedAllergies: string[];              // 사용자 알러지와 매칭된 것
    matchedReligiousIngredients: string[];   // 사용자 종교 제한과 매칭된 것
}

/**
 * 음식 사진을 업로드해 AI 분석 결과를 받는다.
 * multipart/form-data로 image 필드(바이너리)를 전송.
 *
 * @param imageUri  expo-camera의 takePictureAsync()가 반환한 로컬 파일 URI
 */
export async function analyzeFoodImage(imageUri: string) {
    const filename = imageUri.split('/').pop() ?? 'photo.jpg';
    const extMatch = /\.(\w+)$/.exec(filename);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

    const formData = new FormData();
    // React Native FormData 파일 업로드 규약: { uri, name, type }
    formData.append('image', {
        uri: imageUri,
        name: filename,
        type: mimeType,
    } as any);

    return requestJson<FoodAnalysisResult>('/api/v1/menus/analyze-image', {
        method: 'POST',
        body: formData,
    });
}
