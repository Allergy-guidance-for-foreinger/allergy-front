import { requestJson } from '@/api/client';

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'danger';

export interface ServerCafeteria {
    cafeteriaId: number;
    name: string;
}

export interface CafeteriasResponse {
    schoolId: number;
    cafeterias: ServerCafeteria[];
}

export async function getCafeterias() {
    return requestJson<CafeteriasResponse>('/api/v1/mealcrawl/cafeterias', { method: 'GET' });
}

export interface ServerMenuRisk {
    riskLevel: string; // HIGH | MEDIUM | LOW | UNKNOWN
}

export interface ServerMenu {
    mealMenuId: number;
    menuName: string;
    cornerName: string;
    displayOrder: number;
    spicyLevel: number;
    aiAnalyzed: boolean;
    risk: ServerMenuRisk;
}

export interface ServerMealSchedule {
    mealDate: string;
    mealType: string; // BREAKFAST | LUNCH | DINNER
    menus: ServerMenu[];
}

export interface WeeklyMealsResponse {
    schoolId: number;
    cafeteriaId: number;
    weekStartDate: string;
    weekEndDate: string;
    mealSchedules: ServerMealSchedule[];
}

export async function getWeeklyMeals(cafeteriaId: number, weekStartDate: string) {
    const params = new URLSearchParams({
        cafeteriaId: String(cafeteriaId),
        weekStartDate,
    });
    return requestJson<WeeklyMealsResponse>(
        `/api/v1/mealcrawl/weekly-meals?${params.toString()}`,
        { method: 'GET' }
    );
}

// 서버의 riskLevel(대문자) → 로컬 RiskLevel(소문자). UNKNOWN/없음은 null.
// risk가 평탄 문자열("HIGH") 또는 객체({ riskLevel: "HIGH" }) 어느 형식이어도 처리.
export function mapServerRiskLevel(risk?: unknown): RiskLevel | null {
    let level: string | undefined;
    if (typeof risk === 'string') {
        level = risk;
    } else if (risk && typeof risk === 'object' && 'riskLevel' in risk) {
        const inner = (risk as { riskLevel?: unknown }).riskLevel;
        if (typeof inner === 'string') level = inner;
    }

    if (!level) return null;

    switch (level.toUpperCase()) {
        case 'DANGER':
            return 'danger';
        case 'HIGH':
            return 'high';
        case 'MEDIUM':
            return 'medium';
        case 'LOW':
            return 'low';
        case 'SAFE':
            return 'safe';
        default:
            return null;
    }
}

export const MEAL_TYPE_LABEL: Record<string, string> = {
    BREAKFAST: 'Breakfast',
    LUNCH: 'Lunch',
    DINNER: 'Dinner',
};

export const MEAL_TYPE_ORDER: Record<string, number> = {
    BREAKFAST: 1,
    LUNCH: 2,
    DINNER: 3,
};

export interface MenuLikeResponse {
    mealMenuId: number;
    cafeteriaId: number;
    menuId: number;
    likeCount: number;
    likedByMe: boolean;
}

// 메뉴 좋아요 토글
export async function toggleMenuLike(mealMenuId: number) {
    return requestJson<MenuLikeResponse>(
        `/api/v1/meal-menus/${mealMenuId}/like`,
        { method: 'POST' }
    );
}

export interface ServerMenuLike {
    count: number;
    likedByMe: boolean;
}

export interface ServerMenuReview {
    count: number;
}

export interface ServerMenuIngredient {
    code: string; // e.g., "AI_B72D4A4794833847", "EGG"
    name: string;
    source: string; // "AI" | (향후 다른 값)
}

export interface ServerMatchedAllergy {
    code: string; // 매칭된 알러지 코드 (e.g., "TOMATO")
    name: string; // 표시용 이름 (e.g., "토마토")
    riskLevel: string; // DANGER | HIGH | MEDIUM | LOW | SAFE
    confidence: number;
}

export interface ServerMenuAllergy {
    code: string;
    name: string;
    source: string;
}

export interface ServerMatchedReligiousRestriction {
    religiousRestrictionCode: string;
    religiousRestrictionName: string;
    riskLevel: string;
}

export interface ServerMatchedReligiousIngredient {
    ingredientCode: string;
    ingredientName: string;
    confidence: number;
    matchedReligiousRestrictions: ServerMatchedReligiousRestriction[];
}

export interface ServerMenuDetail {
    mealMenuId: number;
    menuName: string;
    description: string;
    cornerName: string;
    displayOrder: number;
    spicyLevel: number;
    aiAnalyzed: boolean;
    risk?: ServerMenuRisk; // { riskLevel: "DANGER"|"HIGH"|"MEDIUM"|"LOW"|"SAFE"|"UNKNOWN" }
    allergies: ServerMenuAllergy[];
    ingredients: ServerMenuIngredient[];
    matchedAllergies: ServerMatchedAllergy[];
    matchedReligiousIngredients: ServerMatchedReligiousIngredient[];
    like: ServerMenuLike;
    review: ServerMenuReview;
}

export async function getMenuDetail(mealMenuId: number) {
    return requestJson<ServerMenuDetail>(
        `/api/v1/mealcrawl/menus/${mealMenuId}`,
        { method: 'GET' }
    );
}
