export type ReligiousCode = 'NONE' | 'HALAL' | 'HINDU' | 'VEGAN' | 'VEGETARIAN';

// 서버는 'NONE'을 모르고, 빈 배열을 "제한 없음"으로 해석한다.
// 그래서 서버 전송용 코드는 NONE을 제외한 실제 종교 코드들만 사용.
export type ServerReligiousCode = Exclude<ReligiousCode, 'NONE'>;

export interface ReligiousOption {
    code: ReligiousCode;
    label: string;
    description: string;
}

export const RELIGIOUS_OPTIONS: ReligiousOption[] = [
    {
        code: 'NONE',
        label: 'No restriction',
        description: 'No religious dietary restriction',
    },
    {
        code: 'HALAL',
        label: 'Halal',
        description: 'Halal-friendly meals only',
    },
    {
        code: 'HINDU',
        label: 'Hindu',
        description: 'Avoids beef and related ingredients',
    },
    {
        code: 'VEGAN',
        label: 'Vegan',
        description: 'No animal products at all',
    },
    {
        code: 'VEGETARIAN',
        label: 'Vegetarian',
        description: 'No meat or seafood',
    },
];

// 사용자에게 보여주는 토글 가능 옵션 (NONE 제외 — 빈 선택이 곧 NONE).
export const SELECTABLE_RELIGIOUS_OPTIONS: ReligiousOption[] = RELIGIOUS_OPTIONS.filter(
    (option) => option.code !== 'NONE'
);

const RELIGIOUS_BY_CODE = new Map(RELIGIOUS_OPTIONS.map((option) => [option.code, option] as const));

export function normalizeReligiousCode(value?: string | null): ReligiousCode {
    const upperValue = (value ?? '').trim().toUpperCase();
    return (RELIGIOUS_BY_CODE.get(upperValue as ReligiousCode)?.code ?? 'NONE') as ReligiousCode;
}

export function getReligiousOptionByCode(code?: string | null): ReligiousOption {
    return RELIGIOUS_BY_CODE.get(normalizeReligiousCode(code)) ?? RELIGIOUS_OPTIONS[0];
}

// ─── 배열 버전 (다중 선택 대응) ─────────────────────────────
// 어떤 입력이 와도 깨끗한 배열로 정리:
//  - 'NONE'은 자동 제거 (빈 배열이 곧 제한 없음)
//  - 알 수 없는 코드는 제거
//  - 중복 제거
//  - 대문자/trim 정규화
//
// 반환은 string[]으로 두어 소비자(store, UI)가 자유롭게 다룸.
// 값은 항상 ServerReligiousCode 중 하나임이 보장됨 (런타임 검증).
export function normalizeReligiousCodes(values?: readonly (string | null | undefined)[] | null): string[] {
    if (!values) return [];
    const seen = new Set<string>();
    for (const raw of values) {
        const normalized = normalizeReligiousCode(raw);
        if (normalized !== 'NONE') {
            seen.add(normalized);
        }
    }
    return Array.from(seen);
}

// 서버 전송용: 항상 배열 (빈 배열도 유효 — "제한 없음").
export function toServerReligiousCodes(values?: readonly (string | null | undefined)[] | null): string[] {
    return normalizeReligiousCodes(values);
}

// ─── 레거시 호환 (단일 코드 → 배열로 변환) ───────────────────
// persist 마이그레이션에서 옛 single religiousCode 값을 배열로 변환할 때 사용.
export function singleToReligiousCodes(value?: string | null): string[] {
    const normalized = normalizeReligiousCode(value);
    return normalized === 'NONE' ? [] : [normalized];
}
