export interface AllergyItem {
    id: string;
    label: string;
    keywords: string[];
    groupId: string;
}

export interface AllergyGroup {
    id: string;
    title: string;
    subtitle: string;
    items: AllergyItem[];
}

const ALLERGY_GROUPS_SOURCE: Array<Pick<AllergyGroup, 'id' | 'title' | 'subtitle'> & { items: Array<Omit<AllergyItem, 'groupId'>> }> = [
    {
        id: 'seafood',
        title: 'Seafood',
        subtitle: 'Fish and shellfish',
        items: [
            { id: 'mackerel', label: 'Mackerel', keywords: ['고등어', 'mackerel'] },
            { id: 'crab', label: 'Crab', keywords: ['게', 'crab'] },
            { id: 'shrimp', label: 'Shrimp', keywords: ['새우', 'shrimp'] },
            { id: 'squid', label: 'Squid', keywords: ['오징어', 'squid'] },
            { id: 'shellfish', label: 'Shellfish', keywords: ['조개류', 'shellfish'] },
            { id: 'clam', label: 'Clam', keywords: ['조개', 'clam'] },
            { id: 'mussel', label: 'Mussel', keywords: ['홍합', 'mussel'] },
            { id: 'oyster', label: 'Oyster', keywords: ['굴', 'oyster'] },
            { id: 'lobster', label: 'Lobster', keywords: ['랍스터', 'lobster'] },
            { id: 'scallop', label: 'Scallop', keywords: ['가리비', 'scallop'] },
        ],
    },
    {
        id: 'meat',
        title: 'Meat',
        subtitle: 'Pork, chicken, and beef',
        items: [
            { id: 'pork', label: 'Pork', keywords: ['돼지고기', 'pork'] },
            { id: 'chicken', label: 'Chicken', keywords: ['닭고기', 'chicken'] },
            { id: 'beef', label: 'Beef', keywords: ['쇠고기', 'beef'] },
        ],
    },
    {
        id: 'dairy-eggs',
        title: 'Dairy & Eggs',
        subtitle: 'Milk and egg products',
        items: [
            { id: 'egg', label: 'Egg', keywords: ['난류', 'egg'] },
            { id: 'milk', label: 'Milk', keywords: ['우유', 'milk'] },
        ],
    },
    {
        id: 'grains-beans-nuts',
        title: 'Beans, Grains & Nuts',
        subtitle: 'Common pantry allergens',
        items: [
            { id: 'peanut', label: 'Peanut', keywords: ['땅콩', 'peanut'] },
            { id: 'soybean', label: 'Soybean', keywords: ['대두', 'soybean'] },
            { id: 'walnut', label: 'Walnut', keywords: ['호두', 'walnut'] },
            { id: 'wheat', label: 'Wheat', keywords: ['밀', 'wheat'] },
            { id: 'buckwheat', label: 'Buckwheat', keywords: ['메밀', 'buckwheat'] },
            { id: 'almond', label: 'Almond', keywords: ['아몬드', 'almond'] },
            { id: 'hazelnut', label: 'Hazelnut', keywords: ['헤이즐넛', 'hazelnut'] },
            { id: 'cashew', label: 'Cashew', keywords: ['캐슈너트', 'cashew'] },
            { id: 'pistachio', label: 'Pistachio', keywords: ['피스타치오', 'pistachio'] },
            { id: 'pecan', label: 'Pecan', keywords: ['피칸', 'pecan'] },
            { id: 'brazil-nut', label: 'Brazil Nut', keywords: ['브라질너트', 'brazil nut'] },
            { id: 'macadamia', label: 'Macadamia', keywords: ['마카다미아', 'macadamia'] },
            { id: 'pine-nut', label: 'Pine Nut', keywords: ['잣', 'pine nut'] },
            { id: 'oats', label: 'Oats', keywords: ['귀리', 'oats'] },
            { id: 'rye', label: 'Rye', keywords: ['호밀', 'rye'] },
            { id: 'barley', label: 'Barley', keywords: ['보리', 'barley'] },
        ],
    },
    {
        id: 'produce',
        title: 'Produce',
        subtitle: 'Fruits and vegetables',
        items: [
            { id: 'peach', label: 'Peach', keywords: ['복숭아', 'peach'] },
            { id: 'tomato', label: 'Tomato', keywords: ['토마토', 'tomato'] },
            { id: 'celery', label: 'Celery', keywords: ['셀러리', 'celery'] },
            { id: 'mustard', label: 'Mustard', keywords: ['머스타드', 'mustard'] },
        ],
    },
    {
        id: 'additives',
        title: 'Additives',
        subtitle: 'Processing and seasoning related allergens',
        items: [
            { id: 'sulfites', label: 'Sulfites', keywords: ['아황산류', 'sulfites'] },
            { id: 'sesame', label: 'Sesame', keywords: ['참깨', 'sesame'] },
            { id: 'lupin', label: 'Lupin', keywords: ['루핀', 'lupin'] },
        ],
    },
];

export const ALLERGY_GROUPS: AllergyGroup[] = ALLERGY_GROUPS_SOURCE.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
        ...item,
        groupId: group.id,
    })),
}));

export const ALLERGY_LIST = ALLERGY_GROUPS.flatMap((group) => group.items);

const ALLERGY_BY_LABEL = new Map(ALLERGY_LIST.map((item) => [item.label, item] as const));

const LEGACY_ALLERGY_VALUES: Record<string, string> = {
    '🥜': 'Peanut',
    '🫘': 'Soybean',
    '🌰': 'Walnut',
    '🌾': 'Wheat',
    '🌿': 'Buckwheat',
    '🧪': 'Sulfites',
    '🥚': 'Egg',
    '🥛': 'Milk',
    '🐟': 'Mackerel',
    '🦀': 'Crab',
    '🦐': 'Shrimp',
    '🦑': 'Squid',
    '🦪': 'Shellfish',
    '🍑': 'Peach',
    '🍅': 'Tomato',
    '🐷': 'Pork',
    '🐔': 'Chicken',
    '🐮': 'Beef',
    땅콩: 'Peanut',
    대두: 'Soybean',
    호두: 'Walnut',
    밀: 'Wheat',
    메밀: 'Buckwheat',
    아황산류: 'Sulfites',
    난류: 'Egg',
    우유: 'Milk',
    고등어: 'Mackerel',
    게: 'Crab',
    새우: 'Shrimp',
    오징어: 'Squid',
    조개류: 'Shellfish',
    복숭아: 'Peach',
    토마토: 'Tomato',
    돼지고기: 'Pork',
    닭고기: 'Chicken',
    쇠고기: 'Beef',
};

function toCanonicalAllergyLabel(value: string): string {
    const legacyMapped = LEGACY_ALLERGY_VALUES[value];
    if (legacyMapped) return legacyMapped;

    const directMatch = ALLERGY_BY_LABEL.get(value);
    if (directMatch) return directMatch.label;

    const lowerValue = value.toLowerCase();
    const caseInsensitiveMatch = ALLERGY_LIST.find((item) => item.label.toLowerCase() === lowerValue);
    return caseInsensitiveMatch?.label ?? value.trim();
}

export function normalizeAllergyValue(value: string): string {
    return toCanonicalAllergyLabel(value);
}

export function normalizeAllergies(values: string[]): string[] {
    return Array.from(new Set(values.map((value) => normalizeAllergyValue(value)).filter(Boolean)));
}

export function getAllergyGroupByItemLabel(label: string): AllergyGroup | undefined {
    const item = ALLERGY_BY_LABEL.get(label);
    return item ? ALLERGY_GROUPS.find((group) => group.id === item.groupId) : undefined;
}
