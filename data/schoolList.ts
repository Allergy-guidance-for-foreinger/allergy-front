export interface SchoolItem {
    id: number;
    label: string;
    aliases: string[];
}

export const SCHOOL_LIST: SchoolItem[] = [
    {
        id: 1,
        label: 'Kumoh National Institute of Technology',
        aliases: ['kumoh', 'kit'],
    },
    {
        id: 2,
        label: 'Seoul National University',
        aliases: ['snu'],
    },
    {
        id: 3,
        label: 'Pusan National University',
        aliases: ['pnu', 'busan'],
    },
    {
        id: 4,
        label: 'Kyungpook National University',
        aliases: ['knu'],
    },
];

const SCHOOL_BY_ID = new Map(SCHOOL_LIST.map((school) => [school.id, school] as const));

export function getSchoolById(id?: number | null): SchoolItem | undefined {
    if (typeof id !== 'number') return undefined;
    return SCHOOL_BY_ID.get(id);
}

export function normalizeSchoolId(value?: number | string | null): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return SCHOOL_BY_ID.has(value) ? value : null;
    }

    if (typeof value !== 'string') return null;

    const query = value.trim().toLowerCase();
    if (!query) return null;

    const matchedSchool = SCHOOL_LIST.find((school) => {
        if (school.label.toLowerCase() === query) return true;
        return school.aliases.some((alias) => alias.toLowerCase() === query);
    });

    return matchedSchool?.id ?? null;
}
