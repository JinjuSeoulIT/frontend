"use client";

import * as React from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  createClinicalOrderApi,
  type LabOrderType,
} from "@/lib/clinical/clinicalOrderApi";
import {
  createVisitMedicationRecordApi,
  createVisitTreatmentResultApi,
} from "@/lib/clinical/visitMedicationTreatmentApi";
import {
  drugSearchParamsFromQuery,
  searchDrugsForVisit,
} from "@/lib/clinical/drugSearchApi";
import {
  inferMedicationDoseProfile,
  parsePositiveDoseAmount,
} from "@/lib/clinical/medicationDoseProfile";
import { searchProceduresForVisit } from "@/lib/clinical/procedureSearchApi";
import {
  fetchExamCodesForOrderType,
  type ExamCodeOption,
} from "@/lib/clinical/examCodesFromPatientService";
import { ORDER_TYPE_LABELS } from "../clinicalDocumentation";

export type ClinicalOrderDialogVariant = "exam" | "treatment";

const EXAM_ORDER_TYPES: LabOrderType[] = [
  "IMAGING",
  "PATHOLOGY",
  "SPECIMEN",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
];

const TREATMENT_ORDER_TYPES: LabOrderType[] = ["PROCEDURE", "MEDICATION"];

const TREATMENT_SUGGEST_FETCH_MS = 20000;

function defaultOrderType(variant: ClinicalOrderDialogVariant): LabOrderType {
  return variant === "exam" ? "IMAGING" : "PROCEDURE";
}

type TreatmentSuggestOption = { key: string; label: string; orderName: string };

function toProcedureOptions(items: { mdfeeCd?: string | null; korNm?: string | null }[]): TreatmentSuggestOption[] {
  const out: TreatmentSuggestOption[] = [];
  for (const it of items) {
    const name = (it.korNm ?? "").trim();
    const cd = (it.mdfeeCd ?? "").trim();
    if (!name && !cd) continue;
    const key = cd || name;
    const label = cd ? `${name || cd} (${cd})` : name;
    out.push({ key, label, orderName: name || cd });
  }
  return out;
}

function toDrugOptions(items: { itemSeq?: string | null; itemName?: string | null }[]): TreatmentSuggestOption[] {
  const out: TreatmentSuggestOption[] = [];
  for (const it of items) {
    const name = (it.itemName ?? "").trim();
    if (!name) continue;
    const seq = (it.itemSeq ?? "").trim();
    out.push({
      key: seq || name,
      label: seq ? `${name} (${seq})` : name,
      orderName: name,
    });
  }
  return out;
}

type Props = {
  open: boolean;
  variant: ClinicalOrderDialogVariant;
  onClose: () => void;
  visitId: number | null;
  onCreated: () => void | Promise<void>;
  contextPatientName?: string | null;
  contextDepartmentName?: string | null;
  contextDoctorId?: string | null;
};

export function ClinicalOrderDialog({
  open,
  variant,
  onClose,
  visitId,
  onCreated,
  contextPatientName,
  contextDepartmentName,
  contextDoctorId,
}: Props) {
  const [newOrderType, setNewOrderType] = React.useState<LabOrderType>(() => defaultOrderType(variant));
  const [newOrderName, setNewOrderName] = React.useState("");
  const [treatmentPick, setTreatmentPick] = React.useState<TreatmentSuggestOption | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [treatmentOptions, setTreatmentOptions] = React.useState<TreatmentSuggestOption[]>([]);
  const [treatmentSuggestLoading, setTreatmentSuggestLoading] = React.useState(false);
  const [medicationDoseText, setMedicationDoseText] = React.useState("1");
  const [examOptions, setExamOptions] = React.useState<ExamCodeOption[]>([]);
  const [examPick, setExamPick] = React.useState<ExamCodeOption | null>(null);
  const [examLoading, setExamLoading] = React.useState(false);
  const suggestTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestAbortRef = React.useRef<AbortController | null>(null);
  const examFetchSeqRef = React.useRef(0);

  const allowedTypes = variant === "exam" ? EXAM_ORDER_TYPES : TREATMENT_ORDER_TYPES;
  const typeLabel = variant === "exam" ? "검사 유형" : "치료 유형";
  const title = variant === "exam" ? "검사 오더 등록" : "치료 오더 등록";
  const nameFieldLabel = variant === "exam" ? "검사 명" : "처치·약물 명";
  const namePlaceholder =
    variant === "exam" ? "예: CBC, 흉부 X-ray" : "예: 상처 드레싱, 타세틀 시럽";
  const failMessage = variant === "exam" ? "검사 오더 등록에 실패했습니다." : "치료 오더 등록에 실패했습니다.";

  React.useEffect(() => {
    if (open) {
      setNewOrderType(defaultOrderType(variant));
      setNewOrderName("");
      setTreatmentPick(null);
      setTreatmentOptions([]);
      setTreatmentSuggestLoading(false);
      setMedicationDoseText("1");
      setExamOptions([]);
      setExamPick(null);
      setExamLoading(false);
    }
  }, [open, variant]);

  React.useEffect(() => {
    setTreatmentPick(null);
    if (variant === "exam") {
      setExamPick(null);
      setNewOrderName("");
    }
    if (newOrderType === "MEDICATION") {
      setMedicationDoseText("1");
    }
  }, [newOrderType, variant]);

  React.useEffect(() => {
    if (!open || variant !== "exam") {
      return;
    }
    const seq = ++examFetchSeqRef.current;
    setExamLoading(true);
    void fetchExamCodesForOrderType(newOrderType)
      .then((list) => {
        if (seq !== examFetchSeqRef.current) return;
        setExamOptions(list);
      })
      .catch((e) => {
        if (seq !== examFetchSeqRef.current) return;
        setExamOptions([]);
        window.alert(e instanceof Error ? e.message : "검사 코드를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (seq !== examFetchSeqRef.current) return;
        setExamLoading(false);
      });
  }, [open, variant, newOrderType]);

  React.useEffect(() => {
    if (!open || variant !== "treatment" || visitId == null) {
      return;
    }
    const q = newOrderName.trim();
    if (suggestTimerRef.current != null) {
      clearTimeout(suggestTimerRef.current);
      suggestTimerRef.current = null;
    }
    suggestAbortRef.current?.abort();
    if (q.length < 2) {
      setTreatmentOptions([]);
      setTreatmentSuggestLoading(false);
      return;
    }
    setTreatmentSuggestLoading(true);
    suggestTimerRef.current = setTimeout(() => {
      suggestAbortRef.current?.abort();
      const ac = new AbortController();
      suggestAbortRef.current = ac;
      const run = async () => {
        const timeoutId = window.setTimeout(() => ac.abort(), TREATMENT_SUGGEST_FETCH_MS);
        try {
          if (newOrderType === "PROCEDURE") {
            const data = await searchProceduresForVisit(visitId, {
              q,
              pageNo: 1,
              numOfRows: 30,
              signal: ac.signal,
            });
            setTreatmentOptions(toProcedureOptions(data.items ?? []));
          } else {
            const data = await searchDrugsForVisit(visitId, {
              ...drugSearchParamsFromQuery(q),
              pageNo: 1,
              numOfRows: 30,
              signal: ac.signal,
            });
            setTreatmentOptions(toDrugOptions(data.items ?? []));
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
          setTreatmentOptions([]);
        } finally {
          window.clearTimeout(timeoutId);
          setTreatmentSuggestLoading(false);
        }
      };
      void run();
    }, 300);
    return () => {
      if (suggestTimerRef.current != null) {
        clearTimeout(suggestTimerRef.current);
        suggestTimerRef.current = null;
      }
      suggestAbortRef.current?.abort();
    };
  }, [open, variant, visitId, newOrderName, newOrderType]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{typeLabel}</InputLabel>
            <Select
              value={newOrderType}
              label={typeLabel}
              onChange={(e) => setNewOrderType(e.target.value as LabOrderType)}
            >
              {allowedTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {ORDER_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {variant === "treatment" ? (
            <Autocomplete<TreatmentSuggestOption, false, false, true>
              freeSolo
              options={treatmentOptions}
              filterOptions={(o) => o}
              getOptionLabel={(o) => (typeof o === "string" ? o : o.label)}
              isOptionEqualToValue={(a, b) => a.key === b.key}
              loading={treatmentSuggestLoading}
              inputValue={newOrderName}
              onInputChange={(_, v) => {
                setNewOrderName(v);
                setTreatmentPick(null);
              }}
              onChange={(_, v) => {
                if (typeof v === "string") {
                  setNewOrderName(v);
                  setTreatmentPick(null);
                } else if (v && typeof v === "object" && "orderName" in v) {
                  setNewOrderName(v.orderName);
                  setTreatmentPick(v);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={nameFieldLabel}
                  placeholder={namePlaceholder}
                  size="small"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {treatmentSuggestLoading ? (
                            <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
          ) : (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl fullWidth size="small" disabled={visitId == null || examLoading}>
                  <InputLabel>{nameFieldLabel}</InputLabel>
                  <Select
                    label={nameFieldLabel}
                    value={examPick?.code ?? ""}
                    onChange={(e) => {
                      const code = String(e.target.value ?? "");
                      const op = examOptions.find((x) => x.code === code) ?? null;
                      setExamPick(op);
                      setNewOrderName((op?.codeName ?? "").trim());
                    }}
                  >
                    <MenuItem value="">
                      <em>선택</em>
                    </MenuItem>
                    {examOptions.map((o) => (
                      <MenuItem key={o.code} value={o.code}>
                        {o.codeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {examLoading ? <CircularProgress size={22} /> : null}
              </Stack>
              {!examLoading && visitId != null && examOptions.length === 0 ? (
                <FormHelperText sx={{ mx: 0 }}>
                  코드가 없습니다. 관리자 코드 화면의 GROUP_CODE(IMAGING, PATHOLOGY 등)와 검사 유형 매핑을
                  확인하거나, .env에 NEXT_PUBLIC_EXAM_CODE_GROUP_PHYSIOLOGICAL=PHYSIOLOGICAL 처럼 지정하세요.
                </FormHelperText>
              ) : null}
            </>
          )}
          {variant === "treatment" && newOrderType === "MEDICATION" ? (
            <TextField
              fullWidth
              size="small"
              label="용량"
              value={medicationDoseText}
              onChange={(e) => setMedicationDoseText(e.target.value)}
              placeholder="예: 1, 0.5, 2.5"
              inputProps={{ inputMode: "decimal" }}
              helperText={(() => {
                const label =
                  (treatmentPick?.orderName ?? "").trim() || newOrderName.trim();
                const p = inferMedicationDoseProfile(label);
                return `품명(저장): ${label.slice(0, 80)}${label.length > 80 ? "…" : ""} · 단위(자동): ${p.doseUnit}`;
              })()}
            />
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "var(--brand)" }}
          disabled={
            (variant === "exam" ? examPick == null : !newOrderName.trim()) ||
            creating ||
            visitId == null ||
            (variant === "treatment" &&
              newOrderType === "MEDICATION" &&
              parsePositiveDoseAmount(medicationDoseText) == null)
          }
          onClick={async () => {
            if (visitId == null) return;
            if (variant === "exam") {
              if (examPick == null || !newOrderName.trim()) return;
            } else if (!newOrderName.trim()) {
              return;
            }
            if (
              variant === "treatment" &&
              newOrderType === "MEDICATION" &&
              parsePositiveDoseAmount(medicationDoseText) == null
            ) {
              return;
            }
            setCreating(true);
            try {
              await createClinicalOrderApi(visitId, {
                orderType: newOrderType,
                orderCode:
                  variant === "treatment" ? treatmentPick?.key ?? null : examPick?.code ?? null,
                orderName: newOrderName.trim(),
                doctorId: contextDoctorId?.trim() || null,
              });
              if (variant === "treatment") {
                try {
                  if (newOrderType === "MEDICATION") {
                    const medicationName =
                      (treatmentPick?.orderName ?? "").trim() || newOrderName.trim();
                    const prof = inferMedicationDoseProfile(medicationName);
                    const doseAmt = parsePositiveDoseAmount(medicationDoseText)!;
                    await createVisitMedicationRecordApi(visitId, {
                      doseNumber: doseAmt,
                      doseUnit: prof.doseUnit,
                      doseKind: medicationName.slice(0, 100),
                      status: "REQUESTED",
                      patientName: contextPatientName?.trim() || undefined,
                      departmentName: contextDepartmentName?.trim() || undefined,
                    });
                  } else if (newOrderType === "PROCEDURE") {
                    const procedureLabel =
                      (treatmentPick?.orderName ?? "").trim() || newOrderName.trim();
                    await createVisitTreatmentResultApi(visitId, {
                      detail: procedureLabel,
                      status: "REQUESTED",
                      patientName: contextPatientName?.trim() || undefined,
                      departmentName: contextDepartmentName?.trim() || undefined,
                    });
                  }
                } catch (syncErr) {
                  window.alert(
                    `오더는 등록되었으나 투약·처치 기록(진료 DB·진료지원 연동) 반영에 실패했습니다.\n${
                      syncErr instanceof Error ? syncErr.message : String(syncErr)
                    }`
                  );
                }
              }
              await onCreated();
              onClose();
              setNewOrderName("");
            } catch (err) {
              window.alert(err instanceof Error ? err.message : failMessage);
            } finally {
              setCreating(false);
            }
          }}
        >
          {creating ? "등록 중…" : "등록"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
