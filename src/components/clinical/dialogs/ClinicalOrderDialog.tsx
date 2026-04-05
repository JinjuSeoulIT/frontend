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
import { searchDrugsForVisit } from "@/lib/clinical/drugSearchApi";
import { searchProceduresForVisit } from "@/lib/clinical/procedureSearchApi";
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
};

export function ClinicalOrderDialog({ open, variant, onClose, visitId, onCreated }: Props) {
  const [newOrderType, setNewOrderType] = React.useState<LabOrderType>(() => defaultOrderType(variant));
  const [newOrderName, setNewOrderName] = React.useState("");
  const [treatmentPick, setTreatmentPick] = React.useState<TreatmentSuggestOption | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [treatmentOptions, setTreatmentOptions] = React.useState<TreatmentSuggestOption[]>([]);
  const [treatmentSuggestLoading, setTreatmentSuggestLoading] = React.useState(false);
  const suggestTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestAbortRef = React.useRef<AbortController | null>(null);

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
    }
  }, [open, variant]);

  React.useEffect(() => {
    setTreatmentPick(null);
  }, [newOrderType]);

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
              itemName: q,
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
          if (!ac.signal.aborted) {
            setTreatmentSuggestLoading(false);
          }
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
            <TextField
              fullWidth
              size="small"
              label={nameFieldLabel}
              value={newOrderName}
              onChange={(e) => setNewOrderName(e.target.value)}
              placeholder={namePlaceholder}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          sx={{ bgcolor: "var(--brand)" }}
          disabled={!newOrderName.trim() || creating || visitId == null}
          onClick={async () => {
            if (visitId == null || !newOrderName.trim()) return;
            setCreating(true);
            try {
              await createClinicalOrderApi(visitId, {
                orderType: newOrderType,
                orderCode: variant === "treatment" ? treatmentPick?.key ?? null : null,
                orderName: newOrderName.trim(),
              });
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
