import { requestJson } from '@/api/client';

export interface CafeteriasResponse {
    schoolId: number;
    cafeterias: string[];
}

export async function getCafeterias() {
    return requestJson<CafeteriasResponse>('/api/v1/mealcrawl/cafeterias', { method: 'GET' });
}

export interface WeeklyMealsResponse {
    schoolId: number;
    cafeteriaId: number;
    weekStartDate: string;
    weekEndDate: string;
    mealSchedules: unknown[];
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
