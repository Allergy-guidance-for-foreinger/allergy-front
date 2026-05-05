export interface AllergyItem {
    id: string;
    label: string;
    apiCode: string;
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
            { id: 'mackerel', label: 'Mackerel', apiCode: 'MACKEREL', keywords: ['고등어', 'mackerel'] },
            { id: 'crab', label: 'Crab', apiCode: 'CRAB', keywords: ['게', 'crab'] },
            { id: 'shrimp', label: 'Shrimp', apiCode: 'SHRIMP', keywords: ['새우', 'shrimp'] },
            { id: 'squid', label: 'Squid', apiCode: 'SQUID', keywords: ['오징어', 'squid'] },
            { id: 'shellfish', label: 'Shellfish', apiCode: 'SHELLFISH', keywords: ['조개류', 'shellfish'] },
            { id: 'clam', label: 'Clam', apiCode: 'CLAM', keywords: ['조개', 'clam'] },
            { id: 'mussel', label: 'Mussel', apiCode: 'MUSSEL', keywords: ['홍합', 'mussel'] },
            { id: 'oyster', label: 'Oyster', apiCode: 'OYSTER', keywords: ['굴', 'oyster'] },
            { id: 'lobster', label: 'Lobster', apiCode: 'LOBSTER', keywords: ['랍스터', 'lobster'] },
            { id: 'scallop', label: 'Scallop', apiCode: 'SCALLOP', keywords: ['가리비', 'scallop'] },
        ],
    },
    {
        id: 'meat',
        title: 'Meat',
        subtitle: 'Pork, chicken, and beef',
        items: [
            { id: 'pork', label: 'Pork', apiCode: 'PORK', keywords: ['돼지고기', 'pork'] },
            { id: 'chicken', label: 'Chicken', apiCode: 'CHICKEN', keywords: ['닭고기', 'chicken'] },
            { id: 'beef', label: 'Beef', apiCode: 'BEEF', keywords: ['쇠고기', 'beef'] },
        ],
    },
    {
        id: 'dairy-eggs',
        title: 'Dairy & Eggs',
        subtitle: 'Milk and egg products',
        items: [
            { id: 'egg', label: 'Egg', apiCode: 'EGG', keywords: ['난류', 'egg'] },
            { id: 'milk', label: 'Milk', apiCode: 'MILK', keywords: ['우유', 'milk'] },
        ],
    },
    {
        id: 'grains-beans-nuts',
        title: 'Beans, Grains & Nuts',
        subtitle: 'Common pantry allergens',
        items: [
            { id: 'peanut', label: 'Peanut', apiCode: 'PEANUT', keywords: ['땅콩', 'peanut'] },
            { id: 'soybean', label: 'Soybean', apiCode: 'SOYBEAN', keywords: ['대두', 'soybean'] },
            { id: 'wheat', label: 'Wheat', apiCode: 'WHEAT', keywords: ['밀', 'wheat'] },
            { id: 'buckwheat', label: 'Buckwheat', apiCode: 'BUCKWHEAT', keywords: ['메밀', 'buckwheat'] },
            { id: 'oats', label: 'Oats', apiCode: 'OATS', keywords: ['귀리', 'oats'] },
            { id: 'rye', label: 'Rye', apiCode: 'RYE', keywords: ['호밀', 'rye'] },
            { id: 'barley', label: 'Barley', apiCode: 'BARLEY', keywords: ['보리', 'barley'] },
            { id: 'tree-nut', label: 'Tree Nut', apiCode: 'TREE_NUT', keywords: ['견과류', 'tree nut', 'tree nuts'] },
            { id: 'walnut', label: 'Walnut', apiCode: 'WALNUT', keywords: ['호두', 'walnut'] },
            { id: 'almond', label: 'Almond', apiCode: 'ALMOND', keywords: ['아몬드', 'almond'] },
            { id: 'hazelnut', label: 'Hazelnut', apiCode: 'HAZELNUT', keywords: ['헤이즐넛', 'hazelnut'] },
            { id: 'cashew', label: 'Cashew', apiCode: 'CASHEW', keywords: ['캐슈너트', 'cashew'] },
            { id: 'pistachio', label: 'Pistachio', apiCode: 'PISTACHIO', keywords: ['피스타치오', 'pistachio'] },
            { id: 'pecan', label: 'Pecan', apiCode: 'PECAN', keywords: ['피칸', 'pecan'] },
            { id: 'brazil-nut', label: 'Brazil Nut', apiCode: 'BRAZIL_NUT', keywords: ['브라질너트', 'brazil nut'] },
            { id: 'macadamia', label: 'Macadamia', apiCode: 'MACADAMIA', keywords: ['마카다미아', 'macadamia'] },
            { id: 'pine-nut', label: 'Pine Nut', apiCode: 'PINE_NUT', keywords: ['잣', 'pine nut'] },
        ],
    },
    {
        id: 'fruits',
        title: 'Fruits',
        subtitle: 'Common fruit allergens',
        items: [
            { id: 'peach', label: 'Peach', apiCode: 'PEACH', keywords: ['복숭아', 'peach'] },
            { id: 'mango', label: 'Mango', apiCode: 'MANGO', keywords: ['망고', 'mango'] },
            { id: 'avocado', label: 'Avocado', apiCode: 'AVOCADO', keywords: ['아보카도', 'avocado'] },
            { id: 'banana', label: 'Banana', apiCode: 'BANANA', keywords: ['바나나', 'banana'] },
            { id: 'kiwi', label: 'Kiwi', apiCode: 'KIWI', keywords: ['키위', 'kiwi'] },
        ],
    },
    {
        id: 'vegetables',
        title: 'Vegetables',
        subtitle: 'Vegetables and plant condiments',
        items: [
            { id: 'tomato', label: 'Tomato', apiCode: 'TOMATO', keywords: ['토마토', 'tomato'] },
            { id: 'celery', label: 'Celery', apiCode: 'CELERY', keywords: ['셀러리', 'celery'] },
            { id: 'mustard', label: 'Mustard', apiCode: 'MUSTARD', keywords: ['머스타드', 'mustard'] },
        ],
    },
    {
        id: 'additives',
        title: 'Additives',
        subtitle: 'Processing and seasoning related allergens',
        items: [
            { id: 'sulfites', label: 'Sulfites', apiCode: 'SULFITES', keywords: ['아황산류', 'sulfites'] },
            { id: 'sesame', label: 'Sesame', apiCode: 'SESAME', keywords: ['참깨', 'sesame'] },
            { id: 'lupin', label: 'Lupin', apiCode: 'LUPIN', keywords: ['루핀', 'lupin'] },
        ],
    },
    {
        id: 'other',
        title: 'Other',
        subtitle: 'Other allergens',
        items: [
            { id: 'latex-related', label: 'Latex-related foods', apiCode: 'LATEX_RELATED', keywords: ['라텍스', 'latex'] },
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
const ALLERGY_BY_CODE = new Map(ALLERGY_LIST.map((item) => [item.apiCode, item] as const));

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

    const codeMatch = ALLERGY_BY_CODE.get(value.toUpperCase());
    if (codeMatch) return codeMatch.label;

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

export function toAllergyCodes(values: string[]): string[] {
    return Array.from(
        new Set(
            normalizeAllergies(values)
                .map((value) => ALLERGY_BY_LABEL.get(value)?.apiCode)
                .filter((value): value is string => Boolean(value))
        )
    );
}

export function getAllergyByCode(code: string): AllergyItem | undefined {
    return ALLERGY_BY_CODE.get(code);
}

const OTHER_GROUP_TEMPLATE: Pick<AllergyGroup, 'id' | 'title' | 'subtitle'> = ALLERGY_GROUPS.find(
    (group) => group.id === 'other'
) ?? {
    id: 'other',
    title: 'Other',
    subtitle: 'Other allergens',
};

export interface ServerAllergyItem {
    code: string;
    name: string;
}

// 서버에서 받은 알러지 옵션을 로컬 그룹 정의에 맞춰 그룹화한다.
// 알려지지 않은 코드는 'Other' 그룹에 즉석 항목으로 추가된다.
export function buildAllergyGroupsFromServer(serverItems: ServerAllergyItem[]): AllergyGroup[] {
    const groupsMap = new Map<string, AllergyGroup>();

    const ensureGroup = (template: Pick<AllergyGroup, 'id' | 'title' | 'subtitle'>): AllergyGroup => {
        let group = groupsMap.get(template.id);
        if (!group) {
            group = { id: template.id, title: template.title, subtitle: template.subtitle, items: [] };
            groupsMap.set(template.id, group);
        }
        return group;
    };

    for (const serverItem of serverItems) {
        const upper = (serverItem?.code ?? '').trim().toUpperCase();
        if (!upper) continue;

        const local = ALLERGY_BY_CODE.get(upper);

        if (local) {
            const groupTemplate = ALLERGY_GROUPS.find((group) => group.id === local.groupId);
            if (groupTemplate) {
                ensureGroup(groupTemplate).items.push(local);
                continue;
            }
        }

        // 알려지지 않은 서버 코드 → Other 그룹에 즉석 항목 생성
        const synthesized: AllergyItem = {
            id: upper.toLowerCase().replace(/_/g, '-'),
            label: serverItem.name ?? upper,
            apiCode: upper,
            keywords: [(serverItem.name ?? upper).toLowerCase(), upper.toLowerCase()],
            groupId: OTHER_GROUP_TEMPLATE.id,
        };
        ensureGroup(OTHER_GROUP_TEMPLATE).items.push(synthesized);
    }

    const orderedIds = ALLERGY_GROUPS.map((group) => group.id);
    return Array.from(groupsMap.values()).sort(
        (a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
    );
}

export function getAllergyGroupByItemLabel(label: string): AllergyGroup | undefined {
    const item = ALLERGY_BY_LABEL.get(label);
    return item ? ALLERGY_GROUPS.find((group) => group.id === item.groupId) : undefined;
}
