"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { DepartmentOption } from "@/features/Reservations/ReservationTypes";
import { fetchDepartmentsApi } from "@/lib/masterDataApi";
import { MEDICATION_RECORD_PROGRESS_STATUS_OPTIONS } from "./medicationRecordDisplay";

export type MedicationSearchType =
  | "patientName"
  | "departmentName"
  | "progressStatus"
  | "administeredAt";

export type MedicationSearchCriteria = {
  searchType: MedicationSearchType;
  searchValue: string;
  startDate: string;
  endDate: string;
};

type MedicationSearchProps = {
  loading?: boolean;
  onSearch: (criteria: MedicationSearchCriteria) => void;
  onReset: () => void;
};

const DEFAULT_SEARCH_TYPE: MedicationSearchType = "patientName";

const SEARCH_TYPE_OPTIONS: Array<{
  value: MedicationSearchType;
  label: string;
}> = [
  { value: "patientName", label: "\uD658\uC790\uBA85" },
  { value: "departmentName", label: "\uC9C4\uB8CC\uACFC" },
  { value: "progressStatus", label: "\uC9C4\uD589\uC0C1\uD0DC" },
  { value: "administeredAt", label: "\uD22C\uC57D\uC77C\uC2DC" },
];

const TEXT_SEARCH_LABELS = {
  patientName: "\uD658\uC790\uBA85 \uC785\uB825",
} as const;

const TEXT_SEARCH_ERROR_MESSAGES = {
  patientName: "\uD658\uC790\uBA85\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.",
} as const;

const SEARCH_TYPE_LABEL = "\uAC80\uC0C9\uAD6C\uBD84";
const START_DATE_LABEL = "\uC2DC\uC791\uC77C";
const END_DATE_LABEL = "\uC885\uB8CC\uC77C";
const DEPARTMENT_LABEL = "\uC9C4\uB8CC\uACFC \uC120\uD0DD";
const PROGRESS_STATUS_LABEL = "\uC9C4\uD589\uC0C1\uD0DC \uC120\uD0DD";
const SELECT_LABEL = "\uC120\uD0DD";
const SEARCH_BUTTON_LABEL = "\uC870\uD68C";
const RESET_BUTTON_LABEL = "\uCD08\uAE30\uD654";

export default function MedicationSearch({
  loading = false,
  onSearch,
  onReset,
}: MedicationSearchProps) {
  const [searchType, setSearchType] =
    useState<MedicationSearchType>(DEFAULT_SEARCH_TYPE);
  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchError, setSearchError] = useState("");
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const departmentOptions = useMemo(() => {
    return [...departments]
      .filter((department) => department.departmentName.trim().length > 0)
      .sort((a, b) =>
        a.departmentName.localeCompare(b.departmentName, "ko-KR")
      );
  }, [departments]);

  useEffect(() => {
    if (searchType !== "departmentName" || departments.length > 0) {
      return;
    }

    let active = true;

    const loadDepartments = async () => {
      try {
        setDepartmentsLoading(true);
        setDepartmentError(null);
        const departmentList = await fetchDepartmentsApi();

        if (!active) return;
        setDepartments(departmentList);
      } catch (err: unknown) {
        if (!active) return;

        const message =
          err instanceof Error && err.message
            ? err.message
            : "\uC9C4\uB8CC\uACFC \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
        setDepartmentError(message);
      } finally {
        if (!active) return;
        setDepartmentsLoading(false);
      }
    };

    void loadDepartments();

    return () => {
      active = false;
    };
  }, [departments.length, searchType]);

  const resetSearchFields = (nextSearchType: MedicationSearchType) => {
    setSearchType(nextSearchType);
    setSearchValue("");
    setStartDate("");
    setEndDate("");
    setSearchError("");
    setDepartmentError(null);
  };

  const handleSearch = () => {
    setSearchError("");

    if (searchType === "administeredAt") {
      if (!startDate || !endDate) {
        setSearchError(
          "\uC2DC\uC791\uC77C\uACFC \uC885\uB8CC\uC77C\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694."
        );
        return;
      }

      if (startDate > endDate) {
        setSearchError(
          "\uC2DC\uC791\uC77C\uC740 \uC885\uB8CC\uC77C\uBCF4\uB2E4 \uB2A6\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."
        );
        return;
      }

      onSearch({
        searchType,
        searchValue: "",
        startDate,
        endDate,
      });
      return;
    }

    if (searchType === "departmentName") {
      if (departmentsLoading) {
        setSearchError(
          "\uC9C4\uB8CC\uACFC \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4."
        );
        return;
      }

      if (departmentError) {
        setSearchError(
          "\uC9C4\uB8CC\uACFC \uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694."
        );
        return;
      }
    }

    const normalizedValue = searchValue.trim();
    if (!normalizedValue) {
      if (searchType === "departmentName") {
        setSearchError("\uC9C4\uB8CC\uACFC\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
      } else if (searchType === "progressStatus") {
        setSearchError(
          "\uC9C4\uD589\uC0C1\uD0DC\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694."
        );
      } else {
        setSearchError(TEXT_SEARCH_ERROR_MESSAGES.patientName);
      }
      return;
    }

    onSearch({
      searchType,
      searchValue: normalizedValue,
      startDate: "",
      endDate: "",
    });
  };

  const handleReset = () => {
    resetSearchFields(DEFAULT_SEARCH_TYPE);
    onReset();
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="medication-search-type-label">
          {SEARCH_TYPE_LABEL}
        </InputLabel>
        <Select
          labelId="medication-search-type-label"
          label={SEARCH_TYPE_LABEL}
          value={searchType}
          onChange={(event) =>
            resetSearchFields(event.target.value as MedicationSearchType)
          }
        >
          {SEARCH_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {searchType === "administeredAt" ? (
        <>
          <TextField
            size="small"
            type="date"
            label={START_DATE_LABEL}
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value);
              setSearchError("");
            }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            type="date"
            label={END_DATE_LABEL}
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value);
              setSearchError("");
            }}
            InputLabelProps={{ shrink: true }}
          />
        </>
      ) : searchType === "departmentName" ? (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="medication-search-value-label">
            {DEPARTMENT_LABEL}
          </InputLabel>
          <Select
            labelId="medication-search-value-label"
            label={DEPARTMENT_LABEL}
            value={searchValue}
            onChange={(event) => {
              setSearchValue(String(event.target.value));
              setSearchError("");
            }}
            disabled={departmentsLoading || Boolean(departmentError)}
          >
            <MenuItem value="">{SELECT_LABEL}</MenuItem>
            {departmentOptions.map((department) => (
              <MenuItem
                key={department.departmentId}
                value={department.departmentName}
              >
                {department.departmentName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : searchType === "progressStatus" ? (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="medication-progress-status-label">
            {PROGRESS_STATUS_LABEL}
          </InputLabel>
          <Select
            labelId="medication-progress-status-label"
            label={PROGRESS_STATUS_LABEL}
            value={searchValue}
            onChange={(event) => {
              setSearchValue(String(event.target.value));
              setSearchError("");
            }}
          >
            <MenuItem value="">{SELECT_LABEL}</MenuItem>
            {MEDICATION_RECORD_PROGRESS_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          size="small"
          label={TEXT_SEARCH_LABELS.patientName}
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.target.value);
            setSearchError("");
          }}
        />
      )}

      <Button
        variant="outlined"
        size="small"
        onClick={handleSearch}
        disabled={loading}
      >
        {SEARCH_BUTTON_LABEL}
      </Button>

      <Button
        variant="text"
        size="small"
        onClick={handleReset}
        disabled={loading}
      >
        {RESET_BUTTON_LABEL}
      </Button>

      {searchError ? (
        <Alert severity="error" sx={{ width: "100%" }}>
          {searchError}
        </Alert>
      ) : null}
    </Box>
  );
}
