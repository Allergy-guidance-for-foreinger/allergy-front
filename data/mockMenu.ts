export type CafeteriaId = 'a1' | 'b2' | 'c3';
export type Weekday = '일' | '월' | '화' | '수' | '목' | '금' | '토';
export type MealKey = 'breakfast' | 'lunch' | 'dinner';

export type MealMenu = {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
};

export const cafeterias: { id: CafeteriaId; name: string }[] = [
    { name: '학생식당', id: 'a1' },
    { name: '교직원식당', id: 'b2' },
    { name: '분식당', id: 'c3' },
];

export const mealLabels = [
    { key: 'breakfast', label: '아침' },
    { key: 'lunch', label: '점심' },
    { key: 'dinner', label: '저녁' },
] as const;

type MenuItemDetail = {
    ingredients: string[];
    allergens: string[];
};

const menuDetailRules: Array<{
    match: RegExp;
    ingredients: string[];
    allergens: string[];
}> = [
    {
        match: /토스트|식빵|베이글|팬케이크|샌드위치|모닝빵/,
        ingredients: ['빵', '버터', '잼', '우유'],
        allergens: ['🌾', '🥚', '🥛'],
    },
    {
        match: /시리얼|그래놀라|오트밀/,
        ingredients: ['곡물', '우유', '견과류', '과일'],
        allergens: ['🥛', '🌰'],
    },
    {
        match: /우유|요거트|치즈|크림|스프/,
        ingredients: ['유제품', '과일', '시리얼'],
        allergens: ['🥛'],
    },
    {
        match: /계란|달걀|오믈렛|스크램블|계란찜|계란후라이|삶은 달걀/,
        ingredients: ['계란', '소금', '버터'],
        allergens: ['🥚', '🥛'],
    },
    {
        match: /김밥|주먹밥|유부초밥|비빔밥|덮밥|볶음밥|라이스|밥$/,
        ingredients: ['쌀', '채소', '양념', '김'],
        allergens: ['🫘'],
    },
    {
        match: /라면|우동|국수|쫄면|짬뽕|떡볶이|라볶이|떡라면/,
        ingredients: ['면', '양념장', '채소', '육수'],
        allergens: ['🌾', '🫘'],
    },
    {
        match: /만두|김말이|튀김|군만두|치킨너겟|돈까스/,
        ingredients: ['밀가루', '식용유', '소스', '고기'],
        allergens: ['🌾', '🥚', '🫘'],
    },
    {
        match: /닭|치킨/,
        ingredients: ['닭고기', '소금', '후추', '양념'],
        allergens: ['🐔', '🫘'],
    },
    {
        match: /돼지|제육|돈육|불고기|돈까스/,
        ingredients: ['돼지고기', '양념', '채소', '밥'],
        allergens: ['🐷', '🫘', '🌾'],
    },
    {
        match: /소고기|쇠고기|불고기|비프/,
        ingredients: ['쇠고기', '양념', '채소', '밥'],
        allergens: ['🐮', '🫘'],
    },
    {
        match: /고등어|생선|연어|삼치|멸치/,
        ingredients: ['생선', '소금', '레몬', '채소'],
        allergens: ['🐟'],
    },
    {
        match: /새우|해물|오징어|게|조개|굴/,
        ingredients: ['해산물', '양념', '채소', '면'],
        allergens: ['🦐', '🦀', '🦑', '🦪'],
    },
    {
        match: /견과|땅콩|호두/,
        ingredients: ['견과류', '과일', '곡물'],
        allergens: ['🥜', '🌰'],
    },
    {
        match: /토마토/,
        ingredients: ['토마토', '채소', '올리브오일'],
        allergens: ['🍅'],
    },
];

export function getMenuItemDetail(name: string): MenuItemDetail {
    const matchedRule = menuDetailRules.find((rule) => rule.match.test(name));

    if (matchedRule) {
        return {
            ingredients: matchedRule.ingredients,
            allergens: matchedRule.allergens,
        };
    }

    return {
        ingredients: [name, '채소', '기본 양념'],
        allergens: [],
    };
}

export function getWeekdayFromDateString(dateString: string): Weekday | null {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;

    return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] as Weekday;
}

export const mockMenuByWeekday: Record<Weekday, Record<CafeteriaId, MealMenu>> = {
    월: {
        a1: {
            breakfast: ['토스트', '삶은 달걀', '바나나', '우유'],
            lunch: ['김치볶음밥', '미소된장국', '닭강정', '샐러드'],
            dinner: ['제육덮밥', '어묵국', '깍두기', '요거트'],
        },
        b2: {
            breakfast: ['시리얼', '플레인 요거트', '사과', '두유'],
            lunch: ['소불고기정식', '북어국', '계란찜', '나물무침'],
            dinner: ['연어샐러드', '감자스프', '모닝빵', '과일컵'],
        },
        c3: {
            breakfast: ['참치김밥', '컵과일', '두유'],
            lunch: ['치즈돈까스', '양배추샐러드', '우동', '단무지'],
            dinner: ['라볶이', '순대', '튀김만두', '쿨피스'],
        },
    },
    화: {
        a1: {
            breakfast: ['밥', '계란후라이', '김구이', '콩나물국'],
            lunch: ['닭갈비', '상추쌈', '맑은국', '깍두기'],
            dinner: ['카레라이스', '미니돈까스', '콘샐러드', '배추김치'],
        },
        b2: {
            breakfast: ['베이글', '크림치즈', '오렌지', '아메리카노'],
            lunch: ['돈육김치찌개', '계란말이', '시금치나물', '밥'],
            dinner: ['두부스테이크', '브로콜리', '옥수수스프', '샐러드'],
        },
        c3: {
            breakfast: ['모닝빵', '딸기잼', '요거트', '바나나'],
            lunch: ['우동정식', '김말이', '만두튀김', '단무지'],
            dinner: ['비빔만두', '떡볶이', '오뎅탕', '쿨피스'],
        },
    },
    수: {
        a1: {
            breakfast: ['현미밥', '소고기미역국', '두부조림', '김치'],
            lunch: ['돈불고기', '감자채볶음', '미역국', '오이무침'],
            dinner: ['삼치구이', '호박볶음', '계란국', '깍두기'],
        },
        b2: {
            breakfast: ['콘프레이크', '우유', '귤', '삶은 달걀'],
            lunch: ['오므라이스', '크림스프', '치킨너겟', '샐러드'],
            dinner: ['제육쌈밥', '된장국', '버섯볶음', '배추김치'],
        },
        c3: {
            breakfast: ['유부초밥', '우유', '사과'],
            lunch: ['떡라면', '김밥', '만두', '단무지'],
            dinner: ['새우볶음밥', '계란국', '춘권', '샐러드'],
        },
    },
    목: {
        a1: {
            breakfast: ['식빵', '딸기잼', '계란스크램블', '우유'],
            lunch: ['오징어볶음', '콩나물국', '두부부침', '김치'],
            dinner: ['닭강정', '감자조림', '미역국', '과일'],
        },
        b2: {
            breakfast: ['그릭요거트', '그래놀라', '블루베리', '두유'],
            lunch: ['돈까스정식', '양배추샐러드', '우동국물', '단무지'],
            dinner: ['연두부샐러드', '소세지볶음', '야채스프', '모닝빵'],
        },
        c3: {
            breakfast: ['김밥', '바나나우유', '귤'],
            lunch: ['라면', '만두', '김말이', '단무지'],
            dinner: ['쫄면', '군만두', '삶은 계란', '오이무침'],
        },
    },
    금: {
        a1: {
            breakfast: ['밥', '소시지볶음', '계란국', '김치'],
            lunch: ['짜장덮밥', '짬뽕국물', '군만두', '단무지'],
            dinner: ['고등어구이', '무생채', '된장국', '과일컵'],
        },
        b2: {
            breakfast: ['팬케이크', '시럽', '우유', '사과'],
            lunch: ['닭개장', '계란말이', '나물무침', '밥'],
            dinner: ['치킨샐러드', '옥수수스프', '빵', '요거트'],
        },
        c3: {
            breakfast: ['토마토샌드위치', '우유', '바나나'],
            lunch: ['돈코츠라멘', '교자만두', '샐러드', '단무지'],
            dinner: ['김치볶음밥', '계란후라이', '미역국', '쿨피스'],
        },
    },
    토: {
        a1: {
            breakfast: ['시리얼', '우유', '바나나'],
            lunch: ['불고기비빔밥', '된장국', '계란찜', '김치'],
            dinner: ['돈까스', '양배추샐러드', '스프', '과일'],
        },
        b2: {
            breakfast: ['베이글', '크림치즈', '딸기', '두유'],
            lunch: ['카레우동', '감자튀김', '샐러드', '단무지'],
            dinner: ['소고기덮밥', '미소국', '나물무침', '요거트'],
        },
        c3: {
            breakfast: ['주먹밥', '두유', '귤'],
            lunch: ['떡볶이', '순대', '튀김', '오뎅'],
            dinner: ['김밥천국세트', '라면', '김말이', '단무지'],
        },
    },
    일: {
        a1: {
            breakfast: ['토스트', '잼', '우유', '삶은 달걀'],
            lunch: ['제육볶음', '콩나물국', '상추', '김치'],
            dinner: ['닭죽', '샐러드', '과일컵', '요거트'],
        },
        b2: {
            breakfast: ['오트밀', '견과류', '바나나', '두유'],
            lunch: ['생선까스', '타르타르소스', '수프', '샐러드'],
            dinner: ['불고기정식', '된장국', '계란찜', '나물무침'],
        },
        c3: {
            breakfast: ['샌드위치', '우유', '사과'],
            lunch: ['우동', '김밥', '군만두', '단무지'],
            dinner: ['라볶이', '김말이', '순대', '쿨피스'],
        },
    },
};
