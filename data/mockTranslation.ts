import { getCountryByCode, type CountryCode } from '@/data/countryList';

type LanguageName = 'English' | 'Japanese' | 'Chinese';

type TranslationDictionary = Record<string, string>;

const LANGUAGE_DICTIONARIES: Record<LanguageName, TranslationDictionary> = {
    English: {
        water: '물',
        rice: '밥',
        pork: '돼지고기',
        beef: '소고기',
        chicken: '닭고기',
        egg: '계란',
        eggs: '계란',
        milk: '우유',
        allergy: '알러지',
        cafeteria: '식당',
        menu: '메뉴',
        soup: '국',
        noodles: '면',
        please: '주세요',
        spicy: '매운',
        fish: '생선',
        shrimp: '새우',
        peanut: '땅콩',
        peanuts: '땅콩',
        soybean: '대두',
        soy: '대두',
        shellfish: '조개류',
        crab: '게',
        tomato: '토마토',
        vegetarian: '채식',
        no: '안 먹어요',
    },
    Japanese: {
        水: '물',
        ご飯: '밥',
        豚肉: '돼지고기',
        牛肉: '소고기',
        鶏肉: '닭고기',
        卵: '계란',
        牛乳: '우유',
        アレルギー: '알러지',
        食堂: '식당',
        メニュー: '메뉴',
        ください: '주세요',
        入っていますか: '들어가 있나요?',
        ありますか: '있나요?',
        豆: '콩',
        海老: '새우',
        ピーナッツ: '땅콩',
        トマト: '토마토',
    },
    Chinese: {
        水: '물',
        米饭: '밥',
        猪肉: '돼지고기',
        牛肉: '소고기',
        鸡肉: '닭고기',
        鸡蛋: '계란',
        牛奶: '우유',
        过敏: '알러지',
        食堂: '식당',
        菜单: '메뉴',
        请: '주세요',
        有吗: '있나요?',
        有: '있어요',
        花生: '땅콩',
        大豆: '대두',
        海鲜: '해산물',
        番茄: '토마토',
    },
};

const ENGLISH_PHRASES: Array<[RegExp, string | ((match: string, allergen?: string) => string)]> = [
    [/\bwhere is the cafeteria\??/i, '식당이 어디에 있나요?'],
    [/\bcan i get water\??/i, '물 좀 주실 수 있나요?'],
    [/\bcould i get water\??/i, '물 좀 주실 수 있나요?'],
    [/\bplease remove ([a-z\s]+)\b/i, (_, allergen) => `${translateFragment(allergen ?? '', 'English')}는 빼주세요.`],
    [/\bi am allergic to ([a-z\s]+)\b/i, (_, allergen) => `${translateFragment(allergen ?? '', 'English')} 알러지가 있어요.`],
    [/\bi can't eat ([a-z\s]+)\b/i, (_, allergen) => `${translateFragment(allergen ?? '', 'English')}를 못 먹어요.`],
    [/\bis there ([a-z\s]+) in this\??/i, (_, allergen) => `이 음식에 ${translateFragment(allergen ?? '', 'English')}가 들어가 있나요?`],
];

const JAPANESE_PHRASES: Array<[RegExp, string | ((match: string, allergen?: string) => string)]> = [
    [/食堂はどこですか[？\?]?/, '식당이 어디에 있나요?'],
    [/水をください[。\.]?[？\?]?/, '물 좀 주실 수 있나요?'],
    [/([^\s]+)は入っていますか[？\?]?/, (_, allergen) => `${translateFragment(allergen ?? '', 'Japanese')}가 들어가 있나요?`],
];

const CHINESE_PHRASES: Array<[RegExp, string | ((match: string, allergen?: string) => string)]> = [
    [/食堂在哪里[？\?]?/, '식당이 어디에 있나요?'],
    [/请给我水[。\.]?[？\?]?/, '물 좀 주실 수 있나요?'],
    [/有([^？\?]+)吗[？\?]?/, (_, allergen) => `${translateFragment(allergen ?? '', 'Chinese')}가 들어가 있나요?`],
];

function translateFragment(fragment: string, language: LanguageName): string {
    const dictionary = LANGUAGE_DICTIONARIES[language];
    let translated = fragment;
    const entries = Object.entries(dictionary).sort((a, b) => b[0].length - a[0].length);

    for (const [source, target] of entries) {
        if (language === 'English') {
            translated = translated.replace(new RegExp(`\\b${escapeRegExp(source)}\\b`, 'gi'), target);
        } else {
            translated = translated.split(source).join(target);
        }
    }

    return translated.trim() || fragment.trim();
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyPhraseRules(input: string, rules: Array<[RegExp, string | ((match: string, allergen?: string) => string)]>): string {
    let result = input;

    for (const [pattern, replacement] of rules) {
        result = result.replace(pattern, (...args: unknown[]) => {
            const match = String(args[0] ?? '');
            const groups = args.slice(1, -2).map(String);
            if (typeof replacement === 'function') {
                return replacement(match, groups[0]);
            }
            return replacement;
        });
    }

    return result;
}

function resolveLanguageName(language?: string): LanguageName {
    if (language === 'Japanese' || language === 'Chinese') {
        return language;
    }

    return 'English';
}

export function mockTranslateQuestionToKorean(input: string, countryCode?: CountryCode): string {
    const trimmed = input.trim();
    if (!trimmed) return '';

    const country = getCountryByCode(countryCode);
    const language = resolveLanguageName(country?.language);
    const phraseRules =
        language === 'Japanese'
            ? JAPANESE_PHRASES
            : language === 'Chinese'
                ? CHINESE_PHRASES
                : ENGLISH_PHRASES;

    const withPhrases = applyPhraseRules(trimmed, phraseRules);
    const withDictionary = translateFragment(withPhrases, language);

    if (withDictionary !== trimmed) {
        return withDictionary;
    }

    return `한국어 번역: ${trimmed}`;
}
