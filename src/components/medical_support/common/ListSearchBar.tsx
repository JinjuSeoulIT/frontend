"use client";

import * as React from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { DepartmentOption } from "@/features/Reservations/ReservationTypes";
import { fetchDepartmentsApi } from "@/lib/masterDataApi";
import { formatProgressStatus, formatYn } from "./ExamDisplay";

export type ListSearchFieldValue = string | Dayjs | null;
export type ListSearchCriteria = Record<string, ListSearchFieldValue>;

export type ListSearchOption = {
  value: string;
  label: string;
};

type BaseFieldConfig = {
  key: string;
  label: string;
};

export type ListSearchTextFieldConfig = BaseFieldConfig & {
  type: "text";
  placeholder?: string;
  inputLabel?: string;
};

export type ListSearchSelectFieldConfig = BaseFieldConfig & {
  type: "select";
  options?: ListSearchOption[];
  optionsSource?: "departments";
  emptyOptionLabel?: string;
  inputLabel?: string;
};

export type ListSearchDateRangeFieldConfig = BaseFieldConfig & {
  type: "dateTimeRange";
  startKey: string;
  endKey: string;
  startLabel?: string;
  endLabel?: string;
};

export type ListSearchFieldConfig =
  | ListSearchTextFieldConfig
  | ListSearchSelectFieldConfig
  | ListSearchDateRangeFieldConfig;

type ListSearchBarProps = {
  fields: ListSearchFieldConfig[];
  selectedFieldKey: string;
  criteria: ListSearchCriteria;
  onSelectedFieldKeyChange: (key: string) => void;
  onCriteriaChange: (key: string, value: ListSearchFieldValue) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
};

const DEFAULT_EMPTY_OPTION_LABEL = "선택";

const toDepartmentOptions = (
  departments: DepartmentOption[]
): ListSearchOption[] =>
  [...departments]
    .filter((department) => department.departmentName.trim().length > 0)
    .sort((left, right) =>
      left.departmentName.localeCompare(right.departmentName, "ko-KR")
    )
    .map((department) => ({
      value: department.departmentName,
      label: department.departmentName,
    }));

const normalizeOptionKey = (value: string) => value.trim().toUpperCase();

const asStringValue = (value: ListSearchFieldValue) =>
  typeof value === "string" ? value : "";

const asDayjsValue = (value: ListSearchFieldValue) =>
  dayjs.isDayjs(value) ? value : null;

const toDateInputValue = (value: ListSearchFieldValue) => {
  const dayjsValue = asDayjsValue(value);

  return dayjsValue?.isValid() ? dayjsValue.format("YYYY-MM-DD") : "";
};

export const ALL_EXAM_PROGRESS_STATUS_FILTER_OPTIONS: ListSearchOption[] = [
  { value: "WAITING", label: formatProgressStatus("WAITING") },
  { value: "IN_PROGRESS", label: formatProgressStatus("IN_PROGRESS") },
  { value: "COMPLETED", label: formatProgressStatus("COMPLETED") },
  { value: "CANCELLED", label: formatProgressStatus("CANCELLED") },
];

export const EXAM_PROGRESS_STATUS_FILTER_OPTIONS: ListSearchOption[] =
  ALL_EXAM_PROGRESS_STATUS_FILTER_OPTIONS.filter(
    (option) => option.value !== "CANCELLED"
  );

export const YES_NO_FILTER_OPTIONS: ListSearchOption[] = [
  { value: "Y", label: formatYn("Y") },
  { value: "N", label: formatYn("N") },
];

export const buildDistinctSelectOptions = (
  values: Array<string | null | undefined>
): ListSearchOption[] => {
  const uniqueOptions = new Map<string, ListSearchOption>();

  values.forEach((value) => {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      return;
    }

    const optionKey = normalizeOptionKey(normalizedValue);
    if (uniqueOptions.has(optionKey)) {
      return;
    }

    uniqueOptions.set(optionKey, {
      value: normalizedValue,
      label: normalizedValue,
    });
  });

  return [...uniqueOptions.values()].sort((left, right) =>
    left.label.localeCompare(right.label, "ko-KR")
  );
};

export const useListSearchCriteria = <T extends ListSearchCriteria>(
  initialFieldKey: string,
  initialCriteria: T
) => {
  const [selectedFieldKey, setSelectedFieldKey] =
    React.useState(initialFieldKey);
  const [criteria, setCriteria] = React.useState<T>(initialCriteria);

  React.useEffect(() => {
    setSelectedFieldKey(initialFieldKey);
    setCriteria(initialCriteria);
  }, [initialCriteria, initialFieldKey]);

  const setCriterion = React.useCallback(
    (key: string, value: ListSearchFieldValue) => {
      setCriteria((previousCriteria) => ({
        ...previousCriteria,
        [key]: value,
      }));
    },
    []
  );

  const selectField = React.useCallback(
    (fieldKey: string) => {
      setSelectedFieldKey(fieldKey);
      setCriteria(initialCriteria);
    },
    [initialCriteria]
  );

  const resetCriteria = React.useCallback(() => {
    setSelectedFieldKey(initialFieldKey);
    setCriteria(initialCriteria);
  }, [initialCriteria, initialFieldKey]);

  return {
    criteria,
    selectedFieldKey,
    setCriterion,
    selectField,
    resetCriteria,
  };
};

const getTextValidationMessage = (label: string) =>
  `${label} 값을 입력해주세요.`;

const getSelectValidationMessage = (label: string) =>
  `${label} 값을 선택해주세요.`;

const getDateRangeValidationMessage = (label: string) =>
  `${label}의 시작일과 종료일을 모두 선택해주세요.`;

export default function ListSearchBar({
  fields,
  selectedFieldKey,
  criteria,
  onSelectedFieldKeyChange,
  onCriteriaChange,
  onSearch,
  onReset,
  loading = false,
}: ListSearchBarProps) {
  const needsDepartmentOptions = React.useMemo(
    () =>
      fields.some(
        (field) =>
          field.type === "select" && field.optionsSource === "departments"
      ),
    [fields]
  );

  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = React.useState(false);
  const [departmentError, setDepartmentError] = React.useState<string | null>(
    null
  );
  const [searchError, setSearchError] = React.useState("");

  React.useEffect(() => {
    if (!needsDepartmentOptions) {
      return;
    }

    let active = true;

    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setDepartmentError(null);

        const nextDepartments = await fetchDepartmentsApi();

        if (!active) {
          return;
        }

        setDepartments(nextDepartments);
      } catch (error) {
        if (!active) {
          return;
        }

        const nextMessage =
          error instanceof Error && error.message
            ? error.message
            : "진료과 목록을 불러오지 못했습니다.";

        setDepartmentError(nextMessage);
      } finally {
        if (!active) {
          return;
        }

        setDepartmentsLoading(false);
      }
    };

    void loadDepartments();

    return () => {
      active = false;
    };
  }, [needsDepartmentOptions]);

  const departmentOptions = React.useMemo(
    () => toDepartmentOptions(departments),
    [departments]
  );

  const currentField = React.useMemo(
    () => fields.find((field) => field.key === selectedFieldKey) ?? fields[0] ?? null,
    [fields, selectedFieldKey]
  );

  const getSelectOptions = React.useCallback(
    (field: ListSearchSelectFieldConfig) => {
      if (field.optionsSource === "departments") {
        return departmentOptions;
      }

      return field.options ?? [];
    },
    [departmentOptions]
  );

  const handleCurrentFieldChange = (fieldKey: string) => {
    setSearchError("");
    onSelectedFieldKeyChange(fieldKey);
  };

  const handleSearch = () => {
    if (!currentField) {
      return;
    }

    if (currentField.type === "dateTimeRange") {
      const startDate = asDayjsValue(criteria[currentField.startKey]);
      const endDate = asDayjsValue(criteria[currentField.endKey]);

      if (!startDate || !endDate) {
        setSearchError(getDateRangeValidationMessage(currentField.label));
        return;
      }

      if (endDate.isBefore(startDate, "day")) {
        setSearchError("시작일이 종료일보다 늦을 수 없습니다.");
        return;
      }

      setSearchError("");
      onSearch();
      return;
    }

    const value = asStringValue(criteria[currentField.key]).trim();
    if (!value) {
      setSearchError(
        currentField.type === "select"
          ? getSelectValidationMessage(currentField.label)
          : getTextValidationMessage(currentField.label)
      );
      return;
    }

    setSearchError("");
    onSearch();
  };

  const handleReset = () => {
    setSearchError("");
    onReset();
  };

  const renderCurrentField = () => {
    if (!currentField) {
      return null;
    }

    if (currentField.type === "text") {
      return (
        <TextField
          size="small"
          label={currentField.inputLabel ?? `${currentField.label} 입력`}
          value={asStringValue(criteria[currentField.key])}
          placeholder={currentField.placeholder}
          onChange={(event) => {
            onCriteriaChange(currentField.key, event.target.value);
            setSearchError("");
          }}
          sx={{ minWidth: { xs: "100%", sm: 220 } }}
        />
      );
    }

    if (currentField.type === "select") {
      const options = getSelectOptions(currentField);
      const isDepartmentField = currentField.optionsSource === "departments";
      const isDisabled =
        loading || (isDepartmentField && (departmentsLoading || !!departmentError));

      return (
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id={`${currentField.key}-search-value-label`}>
            {currentField.inputLabel ?? `${currentField.label} 선택`}
          </InputLabel>
          <Select
            labelId={`${currentField.key}-search-value-label`}
            label={currentField.inputLabel ?? `${currentField.label} 선택`}
            value={asStringValue(criteria[currentField.key])}
            onChange={(event) => {
              onCriteriaChange(currentField.key, String(event.target.value));
              setSearchError("");
            }}
            disabled={isDisabled}
          >
            <MenuItem value="">
              {currentField.emptyOptionLabel ?? DEFAULT_EMPTY_OPTION_LABEL}
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={`${currentField.key}-${option.value}`} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        sx={{ width: { xs: "100%", lg: "auto" } }}
      >
        <TextField
          size="small"
          type="date"
          label={currentField.startLabel ?? "시작일"}
          value={toDateInputValue(criteria[currentField.startKey])}
          onChange={(event) => {
            const nextValue = event.target.value;
            onCriteriaChange(
              currentField.startKey,
              nextValue ? dayjs(nextValue) : null
            );
            setSearchError("");
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { xs: "100%", sm: 140 } }}
        />
        <TextField
          size="small"
          type="date"
          label={currentField.endLabel ?? "종료일"}
          value={toDateInputValue(criteria[currentField.endKey])}
          onChange={(event) => {
            const nextValue = event.target.value;
            onCriteriaChange(
              currentField.endKey,
              nextValue ? dayjs(nextValue) : null
            );
            setSearchError("");
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { xs: "100%", sm: 140 } }}
        />
      </Stack>
    );
  };

  const showDepartmentError =
    !!departmentError &&
    currentField?.type === "select" &&
    currentField.optionsSource === "departments";

  return (
    <Box
      sx={{
        mb: 2,
        pb: 2,
        borderBottom: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        useFlexGap
        flexWrap="wrap"
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
          <InputLabel id="list-search-field-label">검색 기준</InputLabel>
          <Select
            labelId="list-search-field-label"
            label="검색 기준"
            value={currentField?.key ?? ""}
            onChange={(event) => handleCurrentFieldChange(String(event.target.value))}
            disabled={loading || fields.length === 0}
          >
            {fields.map((field) => (
              <MenuItem key={field.key} value={field.key}>
                {field.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {renderCurrentField()}

        <Button
          variant="outlined"
          size="small"
          onClick={handleSearch}
          disabled={loading || !currentField}
        >
          검색
        </Button>

        <Button variant="text" size="small" onClick={handleReset} disabled={loading}>
          초기화
        </Button>
      </Stack>

      {showDepartmentError ? (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {departmentError}
        </Alert>
      ) : null}

      {searchError ? (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {searchError}
        </Alert>
      ) : null}
    </Box>
  );
}
