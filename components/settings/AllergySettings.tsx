import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import {
    ALLERGY_GROUPS,
    buildAllergyGroupsFromServer,
    getAllergyByCode,
    getLocalizedAllergyLabel,
    getLocalizedGroupSubtitle,
    getLocalizedGroupTitle,
    normalizeAllergies,
    sortAllergyItemsByLocale,
    toAllergyCodes,
} from '@/constants/allergyList';
import {
    SELECTABLE_RELIGIOUS_OPTIONS,
    normalizeReligiousCodes,
    toServerReligiousCodes,
} from '@/data/religiousOptions';
import {
    getAllergySetting,
    updateAllergySetting,
    getReligionSetting,
    updateReligionSetting,
    getReligionOptions,
    getAllergyOptions,
} from '@/api/settings';
import { useTranslation, t as tFn } from '@/lib/i18n';

type ReligionChoice = { code: string; label: string };

// 사용자에게 보여줄 토글 옵션 ('NONE' 제외 — 선택 해제가 곧 '제한 없음').
const FALLBACK_RELIGION_CHOICES: ReligionChoice[] = SELECTABLE_RELIGIOUS_OPTIONS.map((option) => ({
    code: option.code,
    label: option.label,
}));

interface AllergySettingsProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    persistToServer?: boolean;
}

export default function AllergySettings({
    title,
    subtitle,
    showHeader = true,
    persistToServer = true,
}: AllergySettingsProps) {
    const t = useTranslation();
    const queryClient = useQueryClient();
    const language = useAppStore((state) => state.language);
    const allergies = useAppStore((state) => state.allergies);
    const setAllergies = useAppStore((state) => state.setAllergies);
    const religiousCodes = useAppStore((state) => state.religiousCodes);
    const setReligiousCodes = useAppStore((state) => state.setReligiousCodes);
    const [isSyncingAllergies, setIsSyncingAllergies] = useState(false);
    const [isSyncingReligion, setIsSyncingReligion] = useState(false);

    // 알러지/종교 변경 후 메뉴 캐시 무효화 — 서버가 새 설정 기준으로
    // matchedAllergies/risk를 재계산한 응답을 다시 가져오게 함.
    const invalidateMenuCaches = () => {
        queryClient.invalidateQueries({ queryKey: ['weeklyMeals'] });
        queryClient.invalidateQueries({ queryKey: ['menuDetail'] });
    };
    const resolvedTitle = title ?? t('allergy.title');
    const resolvedSubtitle = subtitle ?? t('allergy.subtitle');

    const normalizedAllergies = useMemo(() => normalizeAllergies(allergies), [allergies]);
    // 다중 종교 — 모든 입력은 normalizeReligiousCodes로 깨끗하게 (대문자/중복 제거).
    const normalizedReligiousCodes = useMemo(
        () => normalizeReligiousCodes(religiousCodes),
        [religiousCodes]
    );

    const { data: religionOptionsResponse } = useQuery({
        queryKey: ['religionOptions'],
        queryFn: getReligionOptions,
        staleTime: 1000 * 60 * 60, // 1h — 옵션은 거의 안 바뀜
    });

    const religionChoices: ReligionChoice[] = useMemo(() => {
        const serverOptions = religionOptionsResponse?.data?.religions;
        if (serverOptions && serverOptions.length > 0) {
            // 서버가 'NONE' 옵션을 줘도 사용자 UI에선 제외 (선택 해제가 곧 NONE).
            return serverOptions
                .filter((option) => option.code !== 'NONE')
                .map((option) => ({ code: option.code, label: option.name }));
        }
        return FALLBACK_RELIGION_CHOICES;
    }, [religionOptionsResponse]);

    const { data: allergyOptionsResponse } = useQuery({
        queryKey: ['allergyOptions'],
        queryFn: getAllergyOptions,
        staleTime: 1000 * 60 * 60,
    });

    const displayedAllergyGroups = useMemo(() => {
        const serverItems = allergyOptionsResponse?.data?.allergies;
        if (serverItems && serverItems.length > 0) {
            return buildAllergyGroupsFromServer(serverItems);
        }
        return ALLERGY_GROUPS;
    }, [allergyOptionsResponse]);

    // 현재 언어 기준으로 각 그룹의 아이템을 사전순으로 정렬.
    // 'en'은 알파벳, 'ko'는 가나다순 — localeCompare가 자동 처리.
    const sortedAllergyGroups = useMemo(
        () =>
            displayedAllergyGroups.map((group) => ({
                ...group,
                items: sortAllergyItemsByLocale(group.items, language),
            })),
        [displayedAllergyGroups, language]
    );

    // 서버가 지원하지 않는 라벨이 zustand에 남아있으면 자동 제거.
    // (이전 버전의 클라이언트가 저장해둔 Clam/Sesame 같은 deprecated 항목 정리)
    useEffect(() => {
        const serverItems = allergyOptionsResponse?.data?.allergies;
        if (!serverItems || serverItems.length === 0) return;
        if (normalizedAllergies.length === 0) return;

        const supportedLabels = new Set<string>();
        for (const item of serverItems) {
            const upper = (item?.code ?? '').trim().toUpperCase();
            if (!upper) continue;
            const local = getAllergyByCode(upper);
            if (local) {
                supportedLabels.add(local.label);
            } else if (item.name) {
                // 서버에만 있는 신규 코드 — buildAllergyGroupsFromServer가 만드는 라벨과 일치시킴
                supportedLabels.add(item.name);
            }
        }

        const filtered = normalizedAllergies.filter((label) => supportedLabels.has(label));
        if (filtered.length !== normalizedAllergies.length) {
            setAllergies(filtered);
        }
    }, [allergyOptionsResponse, normalizedAllergies, setAllergies]);

    useEffect(() => {
        if (!persistToServer) return;

        let mounted = true;

        const loadSettings = async () => {
            try {
                const [allergyResult, religionResult] = await Promise.all([
                    getAllergySetting(),
                    getReligionSetting(),
                ]);

                if (!mounted) return;

                if (Array.isArray(allergyResult?.data?.allergyCodes)) {
                    setAllergies(allergyResult.data.allergyCodes);
                }

                if (Array.isArray(religionResult?.data?.religiousCodes)) {
                    setReligiousCodes(religionResult.data.religiousCodes);
                }
            } catch (error) {
                console.warn('Failed to load allergy/religion settings:', error);
            }
        };

        loadSettings();

        return () => {
            mounted = false;
        };
    }, [persistToServer, setAllergies, setReligiousCodes]);

    const toggleAllergy = async (selectedLabel: string) => {
        const nextAllergies = normalizedAllergies.includes(selectedLabel)
            ? normalizedAllergies.filter((item) => item !== selectedLabel)
            : [...normalizedAllergies, selectedLabel];

        setAllergies(nextAllergies);

        if (!persistToServer) return;

        try {
            setIsSyncingAllergies(true);
            await updateAllergySetting(toAllergyCodes(nextAllergies));
            // 서버 PATCH 성공 → 메뉴 캐시 무효화 (matchedAllergies/risk 재계산)
            invalidateMenuCaches();
        } catch (error: any) {
            setAllergies(normalizedAllergies);
            Alert.alert(tFn('allergy.updateFailed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsSyncingAllergies(false);
        }
    };

    // 종교 다중 토글 — 알러지와 동일한 패턴. 빈 배열은 "제한 없음".
    const handleReligiousSelect = async (code: string) => {
        const nextCodes = normalizedReligiousCodes.includes(code)
            ? normalizedReligiousCodes.filter((c) => c !== code)
            : [...normalizedReligiousCodes, code];

        const previousCodes = normalizedReligiousCodes;
        setReligiousCodes(nextCodes);

        if (!persistToServer) return;

        try {
            setIsSyncingReligion(true);
            await updateReligionSetting(toServerReligiousCodes(nextCodes));
            // 종교 변경도 위험도 계산에 영향 → 메뉴 캐시 무효화
            invalidateMenuCaches();
        } catch (error: any) {
            setReligiousCodes(previousCodes);
            Alert.alert(tFn('allergy.religionUpdateFailed'), error?.message ?? tFn('common.tryAgain'));
        } finally {
            setIsSyncingReligion(false);
        }
    };

    return (
        <ScrollView className="flex-1 px-5 pt-8">
            {showHeader ? (
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">{resolvedTitle}</Text>
                    <Text className="text-gray-500 text-lg">{resolvedSubtitle}</Text>
                </View>
            ) : null}

            <View
                className={`mb-6 rounded-[28px] border px-4 py-4 ${
                    normalizedReligiousCodes.length > 0
                        ? 'border-blue-200 bg-blue-50/40'
                        : 'border-gray-200 bg-white'
                }`}
            >
                <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-900">{t('allergy.religious')}</Text>
                    <Text className="mt-1 text-sm text-gray-500">{t('allergy.religiousChoose')}</Text>
                </View>

                <View className="flex-row flex-wrap gap-3">
                    {religionChoices.map((option) => {
                        const isSelected = normalizedReligiousCodes.includes(option.code);

                        return (
                            <TouchableOpacity
                                key={option.code}
                                disabled={isSyncingReligion}
                                className={`min-h-[46px] rounded-full border px-4 py-3 ${
                                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white'
                                }`}
                                onPress={() => handleReligiousSelect(option.code)}
                            >
                                <Text className={`text-[15px] font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {sortedAllergyGroups.map((group) => {
                const groupHasSelection = group.items.some((item) =>
                    normalizedAllergies.includes(item.label)
                );

                return (
                    <View
                        key={group.id}
                        className={`mb-6 rounded-[28px] border px-4 py-4 ${
                            groupHasSelection ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-white'
                        }`}
                    >
                        <View className="mb-4">
                            <Text className="text-lg font-bold text-gray-900">
                                {getLocalizedGroupTitle(group, language)}
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1">
                                {getLocalizedGroupSubtitle(group, language)}
                            </Text>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {group.items.map((item) => {
                                // store에는 canonical 영문 라벨만 저장. 화면 표시는 언어별로 변환.
                                const isSelected = normalizedAllergies.includes(item.label);
                                const displayLabel = getLocalizedAllergyLabel(item, language);

                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        disabled={isSyncingAllergies}
                                        className={`min-h-[46px] rounded-full border px-4 py-3 ${
                                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-200 bg-white'
                                        }`}
                                        onPress={() => toggleAllergy(item.label)}
                                    >
                                        <Text
                                            className={`text-[15px] font-semibold ${
                                                isSelected ? 'text-white' : 'text-gray-700'
                                            }`}
                                        >
                                            {displayLabel}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}
