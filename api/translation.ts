import { requestJson } from '@/api/client';

export interface TranslationResult {
    translatedText: string;
}

/**
 * 텍스트 번역.
 *
 * 백엔드 AI가 입력 언어를 자동 감지해 번역하므로 sourceLang은 형식상 값.
 * 어떤 언어를 입력해도 한국어로 번역됨 → sourceLang='en', targetLang='ko' 고정.
 *
 * @param text        사용자가 입력한 원문 (언어 무관)
 * @param sourceLang  원문 언어 코드 (기본 'en' — 서버가 실제 언어 자동 감지)
 * @param targetLang  번역 대상 언어 코드 (기본 'ko' — 직원에게 보여줄 언어)
 */
export async function translateText(
    text: string,
    sourceLang = 'en',
    targetLang = 'ko'
) {
    return requestJson<TranslationResult>('/api/v1/translations', {
        method: 'POST',
        body: JSON.stringify({ sourceLang, targetLang, text }),
    });
}
