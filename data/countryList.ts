import countries from 'world-countries';

export type CountryCode = string;

export type CountryOption = {
    code: string;
    label: string;
    officialName: string;
    flag: string;
    language: string;
    aliases: string[];
    searchTerms: string[];
};

function getPrimaryLanguage(country: (typeof countries)[number]): string {
    const values = Object.values(country.languages ?? {});
    return values[0] ?? 'English';
}

function getAliases(country: (typeof countries)[number]): string[] {
    const korTranslation = country.translations?.kor?.common;
    const officialTranslation = country.translations?.kor?.official;

    return Array.from(
        new Set(
            [
                country.name.common,
                country.name.official,
                korTranslation,
                officialTranslation,
                country.cca2,
                country.cca3,
                ...Object.values(country.languages ?? {}),
            ].filter((value): value is string => Boolean(value))
        )
    );
}

export const COUNTRY_LIST: CountryOption[] = countries
    .map((country) => {
        const label = country.name.common;
        const officialName = country.name.official;
        const flag = country.flag ?? '🏳️';
        const language = getPrimaryLanguage(country);
        const aliases = getAliases(country);

        return {
            code: country.cca2.toUpperCase(),
            label,
            officialName,
            flag,
            language,
            aliases,
            searchTerms: [label, officialName, language, ...aliases],
        };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

const COUNTRY_BY_CODE = new Map(COUNTRY_LIST.map((country) => [country.code, country] as const));

export function normalizeCountryCode(value?: string | null): string {
    return (value ?? '').trim().toUpperCase();
}

export function getCountryByCode(code?: string): CountryOption | undefined {
    return COUNTRY_BY_CODE.get(normalizeCountryCode(code));
}

export function normalizeCountryQuery(country: CountryOption): string[] {
    return country.searchTerms;
}
