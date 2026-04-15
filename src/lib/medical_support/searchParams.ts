import dayjs, { type Dayjs } from "dayjs";

type SearchParamValue = string | boolean | undefined;

export const toDateOnlySearchParam = (
  value?: string | Dayjs | null
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const parsedValue = dayjs.isDayjs(value) ? value : dayjs(value);

  if (!parsedValue.isValid()) {
    return undefined;
  }

  return parsedValue.format("YYYY-MM-DD");
};

export const cleanSearchParams = <T extends object>(
  params?: T
): Partial<T> | undefined => {
  if (!params) {
    return undefined;
  }

  const cleanedEntries = Object.entries(
    params as Record<string, SearchParamValue>
  ).flatMap(([key, value]) => {
    if (typeof value === "boolean") {
      return value ? [[key, value]] : [];
    }

    const normalizedValue = value?.trim();

    return normalizedValue ? [[key, normalizedValue]] : [];
  });

  if (cleanedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(cleanedEntries) as Partial<T>;
};
