export type ReligiousCode = 'NONE' | 'HALAL' | 'HINDU' | 'VEGAN' | 'VEGETARIAN';

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

const RELIGIOUS_BY_CODE = new Map(RELIGIOUS_OPTIONS.map((option) => [option.code, option] as const));

export function normalizeReligiousCode(value?: string | null): ReligiousCode {
    const upperValue = (value ?? '').trim().toUpperCase();
    return (RELIGIOUS_BY_CODE.get(upperValue as ReligiousCode)?.code ?? 'NONE') as ReligiousCode;
}

export function getReligiousOptionByCode(code?: string | null): ReligiousOption {
    return RELIGIOUS_BY_CODE.get(normalizeReligiousCode(code)) ?? RELIGIOUS_OPTIONS[0];
}

export function toServerReligiousCode(code?: string | null): ReligiousCode | null {
    const normalized = normalizeReligiousCode(code);
    return normalized === 'NONE' ? null : normalized;
}
