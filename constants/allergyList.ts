export interface AllergyItem {
    id: string;
    label: string;        // canonical 영문 라벨 (store에는 항상 이 값으로 저장됨)
    labelKo: string;      // 한국어 표시용
    apiCode: string;
    keywords: string[];
    groupId: string;
}

export interface AllergyGroup {
    id: string;
    title: string;
    titleKo: string;      // 카테고리 제목 한국어
    subtitle: string;
    subtitleKo: string;   // 카테고리 부제 한국어
    items: AllergyItem[];
}

const ALLERGY_GROUPS_SOURCE: Array<Pick<AllergyGroup, 'id' | 'title' | 'titleKo' | 'subtitle' | 'subtitleKo'> & { items: Array<Omit<AllergyItem, 'groupId'>> }> = [
    {
        id: 'seafood',
        title: 'Seafood',
        titleKo: '해산물',
        subtitle: 'Fish and shellfish',
        subtitleKo: '생선과 갑각류',
        items: [
            { id: 'mackerel', label: 'Mackerel', labelKo: '고등어', apiCode: 'MACKEREL', keywords: ['고등어', 'mackerel'] },
            { id: 'crab', label: 'Crab', labelKo: '게', apiCode: 'CRAB', keywords: ['게', 'crab'] },
            { id: 'shrimp', label: 'Shrimp', labelKo: '새우', apiCode: 'SHRIMP', keywords: ['새우', 'shrimp'] },
            { id: 'squid', label: 'Squid', labelKo: '오징어', apiCode: 'SQUID', keywords: ['오징어', 'squid'] },
            { id: 'shellfish', label: 'Shellfish', labelKo: '조개류', apiCode: 'SHELLFISH', keywords: ['조개류', 'shellfish'] },
            { id: 'clam', label: 'Clam', labelKo: '조개', apiCode: 'CLAM', keywords: ['조개', 'clam'] },
            { id: 'mussel', label: 'Mussel', labelKo: '홍합', apiCode: 'MUSSEL', keywords: ['홍합', 'mussel'] },
            { id: 'oyster', label: 'Oyster', labelKo: '굴', apiCode: 'OYSTER', keywords: ['굴', 'oyster'] },
            { id: 'lobster', label: 'Lobster', labelKo: '랍스터', apiCode: 'LOBSTER', keywords: ['랍스터', 'lobster'] },
            { id: 'scallop', label: 'Scallop', labelKo: '가리비', apiCode: 'SCALLOP', keywords: ['가리비', 'scallop'] },
        ],
    },
    {
        id: 'meat',
        title: 'Meat',
        titleKo: '육류',
        subtitle: 'Pork, chicken, and beef',
        subtitleKo: '돼지, 닭, 소고기',
        items: [
            { id: 'pork', label: 'Pork', labelKo: '돼지고기', apiCode: 'PORK', keywords: ['돼지고기', '돼지', '제육', 'pork'] },
            { id: 'chicken', label: 'Chicken', labelKo: '닭고기', apiCode: 'CHICKEN', keywords: ['닭고기', '닭', '치킨', 'chicken'] },
            { id: 'beef', label: 'Beef', labelKo: '쇠고기', apiCode: 'BEEF', keywords: ['쇠고기', '소고기', 'beef'] },
        ],
    },
    {
        id: 'dairy-eggs',
        title: 'Dairy & Eggs',
        titleKo: '유제품·계란',
        subtitle: 'Milk and egg products',
        subtitleKo: '우유와 계란 관련',
        items: [
            { id: 'egg', label: 'Egg', labelKo: '계란', apiCode: 'EGG', keywords: ['난류', '계란', '달걀', 'egg'] },
            { id: 'milk', label: 'Milk', labelKo: '우유', apiCode: 'MILK', keywords: ['우유', '유제품', 'milk', 'dairy'] },
        ],
    },
    {
        id: 'grains-beans-nuts',
        title: 'Beans, Grains & Nuts',
        titleKo: '콩·곡물·견과류',
        subtitle: 'Common pantry allergens',
        subtitleKo: '주방에서 흔한 알러지 식재료',
        items: [
            { id: 'peanut', label: 'Peanut', labelKo: '땅콩', apiCode: 'PEANUT', keywords: ['땅콩', 'peanut'] },
            { id: 'soybean', label: 'Soybean', labelKo: '대두', apiCode: 'SOYBEAN', keywords: ['대두', 'soybean'] },
            { id: 'wheat', label: 'Wheat', labelKo: '밀', apiCode: 'WHEAT', keywords: ['밀', 'wheat'] },
            { id: 'buckwheat', label: 'Buckwheat', labelKo: '메밀', apiCode: 'BUCKWHEAT', keywords: ['메밀', 'buckwheat'] },
            { id: 'oats', label: 'Oats', labelKo: '귀리', apiCode: 'OATS', keywords: ['귀리', 'oats'] },
            { id: 'rye', label: 'Rye', labelKo: '호밀', apiCode: 'RYE', keywords: ['호밀', 'rye'] },
            { id: 'barley', label: 'Barley', labelKo: '보리', apiCode: 'BARLEY', keywords: ['보리', 'barley'] },
            { id: 'tree-nut', label: 'Tree Nut', labelKo: '견과류', apiCode: 'TREE_NUT', keywords: ['견과류', 'tree nut', 'tree nuts'] },
            { id: 'walnut', label: 'Walnut', labelKo: '호두', apiCode: 'WALNUT', keywords: ['호두', 'walnut'] },
            { id: 'almond', label: 'Almond', labelKo: '아몬드', apiCode: 'ALMOND', keywords: ['아몬드', 'almond'] },
            { id: 'hazelnut', label: 'Hazelnut', labelKo: '헤이즐넛', apiCode: 'HAZELNUT', keywords: ['헤이즐넛', 'hazelnut'] },
            { id: 'cashew', label: 'Cashew', labelKo: '캐슈너트', apiCode: 'CASHEW', keywords: ['캐슈너트', 'cashew'] },
            { id: 'pistachio', label: 'Pistachio', labelKo: '피스타치오', apiCode: 'PISTACHIO', keywords: ['피스타치오', 'pistachio'] },
            { id: 'pecan', label: 'Pecan', labelKo: '피칸', apiCode: 'PECAN', keywords: ['피칸', 'pecan'] },
            { id: 'brazil-nut', label: 'Brazil Nut', labelKo: '브라질너트', apiCode: 'BRAZIL_NUT', keywords: ['브라질너트', 'brazil nut'] },
            { id: 'macadamia', label: 'Macadamia', labelKo: '마카다미아', apiCode: 'MACADAMIA', keywords: ['마카다미아', 'macadamia'] },
            { id: 'pine-nut', label: 'Pine Nut', labelKo: '잣', apiCode: 'PINE_NUT', keywords: ['잣', 'pine nut'] },
        ],
    },
    {
        id: 'fruits',
        title: 'Fruits',
        titleKo: '과일',
        subtitle: 'Common fruit allergens',
        subtitleKo: '흔한 과일 알러지',
        items: [
            { id: 'peach', label: 'Peach', labelKo: '복숭아', apiCode: 'PEACH', keywords: ['복숭아', 'peach'] },
            { id: 'mango', label: 'Mango', labelKo: '망고', apiCode: 'MANGO', keywords: ['망고', 'mango'] },
            { id: 'avocado', label: 'Avocado', labelKo: '아보카도', apiCode: 'AVOCADO', keywords: ['아보카도', 'avocado'] },
            { id: 'banana', label: 'Banana', labelKo: '바나나', apiCode: 'BANANA', keywords: ['바나나', 'banana'] },
            { id: 'kiwi', label: 'Kiwi', labelKo: '키위', apiCode: 'KIWI', keywords: ['키위', 'kiwi'] },
        ],
    },
    {
        id: 'vegetables',
        title: 'Vegetables',
        titleKo: '채소',
        subtitle: 'Vegetables and plant condiments',
        subtitleKo: '채소와 식물성 조미료',
        items: [
            { id: 'tomato', label: 'Tomato', labelKo: '토마토', apiCode: 'TOMATO', keywords: ['토마토', 'tomato'] },
            { id: 'celery', label: 'Celery', labelKo: '셀러리', apiCode: 'CELERY', keywords: ['셀러리', 'celery'] },
            { id: 'mustard', label: 'Mustard', labelKo: '머스타드', apiCode: 'MUSTARD', keywords: ['머스타드', '겨자', 'mustard'] },
        ],
    },
    {
        id: 'additives',
        title: 'Additives',
        titleKo: '첨가물',
        subtitle: 'Processing and seasoning related allergens',
        subtitleKo: '가공·조미 관련 알러지',
        items: [
            { id: 'sulfites', label: 'Sulfites', labelKo: '아황산류', apiCode: 'SULFITES', keywords: ['아황산류', 'sulfites'] },
            { id: 'sesame', label: 'Sesame', labelKo: '참깨', apiCode: 'SESAME', keywords: ['참깨', 'sesame'] },
            { id: 'lupin', label: 'Lupin', labelKo: '루핀', apiCode: 'LUPIN', keywords: ['루핀', 'lupin'] },
        ],
    },
    {
        id: 'other',
        title: 'Other',
        titleKo: '기타',
        subtitle: 'Other allergens',
        subtitleKo: '기타 알러지',
        items: [
            { id: 'latex-related', label: 'Latex-related foods', labelKo: '라텍스 관련 식품', apiCode: 'LATEX_RELATED', keywords: ['라텍스', 'latex'] },
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

// 언어별 라벨 헬퍼 — 'ko'면 한국어, 그 외엔 영문 canonical 라벨.
export function getLocalizedAllergyLabel(item: AllergyItem, lang?: string): string {
    return lang === 'ko' ? item.labelKo : item.label;
}

// canonical 영문 라벨로부터 현재 언어에 맞는 표시 라벨 얻기.
// store에는 영문 라벨이 저장되므로 화면 표시 시 이 함수로 변환.
export function getLocalizedLabel(canonicalLabel: string, lang?: string): string {
    const item = ALLERGY_BY_LABEL.get(canonicalLabel);
    if (item) return getLocalizedAllergyLabel(item, lang);
    return canonicalLabel; // 매칭 안 되면 그대로 (서버 신규 코드 등)
}

// API 코드로부터 현재 언어에 맞는 표시 라벨 얻기 (메뉴 상세의 재료 칩에서 사용).
export function getLocalizedLabelByCode(code: string, lang?: string): string {
    const item = ALLERGY_BY_CODE.get(code);
    if (item) return getLocalizedAllergyLabel(item, lang);
    return code;
}

// 그룹 제목/부제 한국어 변환.
export function getLocalizedGroupTitle(group: AllergyGroup, lang?: string): string {
    return lang === 'ko' ? group.titleKo : group.title;
}
export function getLocalizedGroupSubtitle(group: AllergyGroup, lang?: string): string {
    return lang === 'ko' ? group.subtitleKo : group.subtitle;
}

// 그룹 안 아이템을 현재 언어 라벨 기준 사전순으로 정렬.
// 한국어는 'ko' 로케일로 정렬해야 가나다순(ㄱ→ㅎ) 정확함.
export function sortAllergyItemsByLocale(items: AllergyItem[], lang?: string): AllergyItem[] {
    const locale = lang === 'ko' ? 'ko' : 'en';
    return items.slice().sort((a, b) => {
        const aLabel = getLocalizedAllergyLabel(a, lang);
        const bLabel = getLocalizedAllergyLabel(b, lang);
        return aLabel.localeCompare(bLabel, locale);
    });
}

const OTHER_GROUP_TEMPLATE: Pick<AllergyGroup, 'id' | 'title' | 'titleKo' | 'subtitle' | 'subtitleKo'> = ALLERGY_GROUPS.find(
    (group) => group.id === 'other'
) ?? {
    id: 'other',
    title: 'Other',
    titleKo: '기타',
    subtitle: 'Other allergens',
    subtitleKo: '기타 알러지',
};

export interface ServerAllergyItem {
    code: string;
    name: string;
}

// 서버에서 받은 알러지 옵션을 로컬 그룹 정의에 맞춰 그룹화한다.
// 알려지지 않은 코드는 'Other' 그룹에 즉석 항목으로 추가된다.
export function buildAllergyGroupsFromServer(serverItems: ServerAllergyItem[]): AllergyGroup[] {
    const groupsMap = new Map<string, AllergyGroup>();

    const ensureGroup = (
        template: Pick<AllergyGroup, 'id' | 'title' | 'titleKo' | 'subtitle' | 'subtitleKo'>
    ): AllergyGroup => {
        let group = groupsMap.get(template.id);
        if (!group) {
            group = {
                id: template.id,
                title: template.title,
                titleKo: template.titleKo,
                subtitle: template.subtitle,
                subtitleKo: template.subtitleKo,
                items: [],
            };
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

        // 알려지지 않은 서버 코드 → Other 그룹에 즉석 항목 생성.
        // 서버가 한국어 라벨을 주지 않으므로 labelKo도 동일값으로 폴백.
        const fallbackName = serverItem.name ?? upper;
        const synthesized: AllergyItem = {
            id: upper.toLowerCase().replace(/_/g, '-'),
            label: fallbackName,
            labelKo: fallbackName,
            apiCode: upper,
            keywords: [fallbackName.toLowerCase(), upper.toLowerCase()],
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
