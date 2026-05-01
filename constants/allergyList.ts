export interface AllergyItem {
    id: string;
    label: string;
    keywords: string[];
}

export const ALLERGY_LIST = [
    { id: 'peanut', label: 'Peanut', keywords: ['땅콩', 'peanut'] },
    { id: 'soybean', label: 'Soybean', keywords: ['대두', 'soybean'] },
    { id: 'walnut', label: 'Walnut', keywords: ['호두', 'walnut'] },
    { id: 'wheat', label: 'Wheat', keywords: ['밀', 'wheat'] },
    { id: 'buckwheat', label: 'Buckwheat', keywords: ['메밀', 'buckwheat'] },
    { id: 'sulfites', label: 'Sulfites', keywords: ['아황산류', 'sulfites'] },
    { id: 'egg', label: 'Egg', keywords: ['난류', 'egg'] },
    { id: 'milk', label: 'Milk', keywords: ['우유', 'milk'] },
    { id: 'mackerel', label: 'Mackerel', keywords: ['고등어', 'mackerel'] },
    { id: 'crab', label: 'Crab', keywords: ['게', 'crab'] },
    { id: 'shrimp', label: 'Shrimp', keywords: ['새우', 'shrimp'] },
    { id: 'squid', label: 'Squid', keywords: ['오징어', 'squid'] },
    { id: 'shellfish', label: 'Shellfish', keywords: ['조개류', 'shellfish'] },
    { id: 'peach', label: 'Peach', keywords: ['복숭아', 'peach'] },
    { id: 'tomato', label: 'Tomato', keywords: ['토마토', 'tomato'] },
    { id: 'pork', label: 'Pork', keywords: ['돼지고기', 'pork'] },
    { id: 'chicken', label: 'Chicken', keywords: ['닭고기', 'chicken'] },
    { id: 'beef', label: 'Beef', keywords: ['쇠고기', 'beef'] },
];

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

export function normalizeAllergyValue(value: string): string {
    return LEGACY_ALLERGY_VALUES[value] ?? value;
}
