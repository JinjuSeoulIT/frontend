"use client";

import * as React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  IconButton,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import {
  addDiagnosisApi,
  removeDiagnosisApi,
  reorderDiagnosesApi,
  setDiagnosisMainApi,
  addPrescriptionApi,
  removePrescriptionApi,
  updatePrescriptionApi,
  type DiagnosisRes,
  type PrescriptionRes,
} from "@/lib/clinical/clinicalRecordApi";
import { searchMasterDiagnosesApi, type MasterDiagnosisItem } from "@/lib/clinical/diagnosisMasterApi";
import {
  drugSearchParamsFromQuery,
  searchDrugsForChoseongMatch,
  searchDrugsForVisit,
} from "@/lib/clinical/drugSearchApi";
import { isChoseongOnlyQuery } from "@/utils/koreanChoseong";

const DRUG_SEARCH_MIN_CHARS = 2;
const DRUG_SEARCH_DEBOUNCE_MS = 380;
const DRUG_SEARCH_PAGE_SIZE = 25;
const DRUG_SEARCH_CHOSEONG_DISPLAY_MAX = 80;
const MASTER_DIAG_DEBOUNCE_MS = 280;

type DrugSuggestOption = {
  key: string;
  itemSeq: string;
  itemName: string;
  entpName?: string;
};

type Props = {
  visitId: number | null;
  diagnoses: DiagnosisRes[];
  prescriptions: PrescriptionRes[];
  chiefComplaintText: string;
  onChiefComplaintTextChange: (v: string) => void;
  presentIllnessText: string;
  onPresentIllnessTextChange: (v: string) => void;
  prescriptionNameInput: string;
  onPrescriptionNameInputChange: (v: string) => void;
  prescriptionDosageInput: string;
  onPrescriptionDosageInputChange: (v: string) => void;
  prescriptionFrequencyInput: string;
  onPrescriptionFrequencyInputChange: (v: string) => void;
  prescriptionDaysInput: string;
  onPrescriptionDaysInputChange: (v: string) => void;
  additionalMemo: string;
  onAdditionalMemoChange: (v: string) => void;
  savingRecord: boolean;
  onDiagnosesReload: () => void;
  onPrescriptionsReload: () => void;
  onVisitCompleted: () => Promise<void>;
};

export function ClinicalSoapCard({
  visitId,
  diagnoses,
  prescriptions,
  chiefComplaintText,
  onChiefComplaintTextChange,
  presentIllnessText,
  onPresentIllnessTextChange,
  prescriptionNameInput,
  onPrescriptionNameInputChange,
  prescriptionDosageInput,
  onPrescriptionDosageInputChange,
  prescriptionFrequencyInput,
  onPrescriptionFrequencyInputChange,
  prescriptionDaysInput,
  onPrescriptionDaysInputChange,
  additionalMemo,
  onAdditionalMemoChange,
  savingRecord,
  onDiagnosesReload,
  onPrescriptionsReload,
  onVisitCompleted,
}: Props) {
  const [completingVisit, setCompletingVisit] = React.useState(false);
  const [drugOptions, setDrugOptions] = React.useState<DrugSuggestOption[]>([]);
  const [drugLoading, setDrugLoading] = React.useState(false);
  const [drugHint, setDrugHint] = React.useState<string | null>(null);
  const [masterInput, setMasterInput] = React.useState("");
  const [masterOptions, setMasterOptions] = React.useState<MasterDiagnosisItem[]>([]);
  const [masterLoading, setMasterLoading] = React.useState(false);
  const [rxEditOpen, setRxEditOpen] = React.useState(false);
  const [rxEditTarget, setRxEditTarget] = React.useState<PrescriptionRes | null>(null);
  const [rxEditName, setRxEditName] = React.useState("");
  const [rxEditDosage, setRxEditDosage] = React.useState("");
  const [rxEditFrequency, setRxEditFrequency] = React.useState("");
  const [rxEditDuration, setRxEditDuration] = React.useState("");

  const sortedDiagnoses = React.useMemo(
    () =>
      [...diagnoses].sort(
        (a, b) =>
          (a.sortOrder ?? a.diagnosisId) - (b.sortOrder ?? b.diagnosisId) ||
          a.diagnosisId - b.diagnosisId
      ),
    [diagnoses]
  );

  const moveDiagnosis = React.useCallback(
    async (fromIndex: number, dir: -1 | 1) => {
      if (visitId == null) return;
      const toIndex = fromIndex + dir;
      if (toIndex < 0 || toIndex >= sortedDiagnoses.length) return;
      const next = [...sortedDiagnoses];
      const tmp = next[fromIndex]!;
      next[fromIndex] = next[toIndex]!;
      next[toIndex] = tmp;
      try {
        await reorderDiagnosesApi(visitId, next.map((d) => d.diagnosisId));
        onDiagnosesReload();
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "순서 변경 실패");
      }
    },
    [visitId, sortedDiagnoses, onDiagnosesReload]
  );

  const tryAddDiagnosis = React.useCallback(
    async (code: string, name: string): Promise<boolean> => {
      if (visitId == null) {
        window.alert("방문을 선택한 뒤 상병을 등록할 수 있습니다.");
        return false;
      }
      const c = code.trim();
      const n = name.trim();
      if (!c || !n) return false;
      const addAsMain =
        diagnoses.length === 0 || !diagnoses.some((d) => d.mainYn === "Y");
      try {
        await addDiagnosisApi(visitId, {
          dxCode: c || null,
          dxName: n || null,
          dxSource: "PUBLIC_MASTER",
          main: addAsMain,
        });
        onDiagnosesReload();
        return true;
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "등록 실패");
        return false;
      }
    },
    [visitId, diagnoses, onDiagnosesReload]
  );

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      void (async () => {
        setMasterLoading(true);
        try {
          setMasterOptions(await searchMasterDiagnosesApi(masterInput));
        } catch {
          setMasterOptions([]);
        } finally {
          setMasterLoading(false);
        }
      })();
    }, MASTER_DIAG_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [masterInput]);

  React.useEffect(() => {
    if (visitId == null) {
      setDrugOptions([]);
      setDrugHint(null);
      return;
    }
    const q = prescriptionNameInput.trim();
    const compactChoseong = q.replace(/\s+/g, "");
    const digitsOnly = /^\d+$/.test(compactChoseong);
    if (compactChoseong.length < DRUG_SEARCH_MIN_CHARS) {
      setDrugOptions([]);
      setDrugHint(
        compactChoseong.length === 0
          ? null
          : digitsOnly
            ? "품목기준코드는 숫자 2자 이상 입력하세요."
            : `제품명·초성 ${DRUG_SEARCH_MIN_CHARS}자 이상 또는 품목코드(숫자 2자 이상)로 식약처 e약은요 검색합니다. (예: 타이, ㅌㅇ)`
      );
      return;
    }
    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      void (async () => {
        setDrugLoading(true);
        setDrugHint(null);
        try {
          const choseongMode =
            isChoseongOnlyQuery(compactChoseong) &&
            compactChoseong.length >= DRUG_SEARCH_MIN_CHARS;
          let mapped: DrugSuggestOption[];
          if (choseongMode) {
            const cho = await searchDrugsForChoseongMatch(visitId, {
              compactChoseong,
              signal: ac.signal,
            });
            if (cho.resultCode && cho.resultCode !== "00") {
              setDrugOptions([]);
              setDrugHint(cho.resultMsg || "공공데이터 응답 오류");
              return;
            }
            const raw = cho.items.filter((it) => (it.itemName ?? "").trim().length > 0);
            mapped = raw.slice(0, DRUG_SEARCH_CHOSEONG_DISPLAY_MAX).map((it, idx) => {
              const name = (it.itemName ?? "").trim();
              const seq = (it.itemSeq ?? "").trim();
              return {
                key: seq ? `${seq}-${idx}` : `${name}-${idx}`,
                itemSeq: seq,
                itemName: name,
                entpName: (it.entpName ?? "").trim() || undefined,
              };
            });
            setDrugOptions(mapped);
            if (mapped.length === 0) {
              setDrugHint(
                `초성 '${compactChoseong}'에 맞는 품목이 없습니다. 한글 제품명으로 검색해 보세요.`
              );
            } else if (raw.length > DRUG_SEARCH_CHOSEONG_DISPLAY_MAX) {
              setDrugHint(
                `초성 일치 ${raw.length.toLocaleString()}건 중 ${DRUG_SEARCH_CHOSEONG_DISPLAY_MAX}건만 표시`
              );
            } else if (cho.totalCountMain != null && cho.totalCountMain > raw.length) {
              setDrugHint(
                `‘${compactChoseong[0]}’로 시작하는 품목 약 ${cho.totalCountMain.toLocaleString()}건 중 초성 일치 ${raw.length.toLocaleString()}건`
              );
            }
          } else {
            const result = await searchDrugsForVisit(visitId, {
              ...drugSearchParamsFromQuery(q),
              numOfRows: DRUG_SEARCH_PAGE_SIZE,
              signal: ac.signal,
            });
            if (result.resultCode && result.resultCode !== "00") {
              setDrugOptions([]);
              setDrugHint(result.resultMsg || "공공데이터 응답 오류");
              return;
            }
            const raw = result.items ?? [];
            const items = raw.filter((it) => (it.itemName ?? "").trim().length > 0);
            mapped = items.map((it, idx) => {
              const name = (it.itemName ?? "").trim();
              const seq = (it.itemSeq ?? "").trim();
              return {
                key: seq ? `${seq}-${idx}` : `${name}-${idx}`,
                itemSeq: seq,
                itemName: name,
                entpName: (it.entpName ?? "").trim() || undefined,
              };
            });
            setDrugOptions(mapped);
            if (mapped.length === 0) {
              setDrugHint("검색 결과가 없습니다. 직접 입력 후 추가할 수 있습니다.");
            } else if (
              result.totalCount != null &&
              result.totalCount > mapped.length
            ) {
              setDrugHint(`전체 ${result.totalCount.toLocaleString()}건 중 상위 ${mapped.length}건`);
            }
          }
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
          setDrugOptions([]);
          setDrugHint(e instanceof Error ? e.message : "약품 검색에 실패했습니다.");
        } finally {
          setDrugLoading(false);
        }
      })();
    }, DRUG_SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      ac.abort();
    };
  }, [visitId, prescriptionNameInput]);

  return (
    <>
    <Card sx={{ borderRadius: 2, border: "1px solid var(--line)" }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography fontWeight={800} sx={{ fontSize: 15, mb: 0.5 }}>
          진료기록 작성 (SOAP)
        </Typography>
        <Typography sx={{ fontSize: 10, color: "var(--muted)", mb: 1.25 }}>
          S 주관적 · O 객관적(활력은 좌측 카드) · A 상병 · P 처방·오더·메모
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.25 }}>
          S 주관적 (Subjective)
        </Typography>
        <Typography sx={{ fontSize: 10, color: "var(--muted)", mb: 0.75 }}>
          과거 진료기록 표에서 「보기」로 확인하거나 「주·현·전」으로 주호소·현병력을 현재 차트에 반영할 수 있습니다.
        </Typography>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", mb: 0.35 }}>
          주호소 (Chief complaint)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          placeholder="예: 두통 3일"
          value={chiefComplaintText}
          onChange={(e) => onChiefComplaintTextChange(e.target.value)}
          sx={{ mb: 1.25, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", mb: 0.35 }}>
          현병력 (Present illness)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={5}
          size="small"
          placeholder="증상 시작·경과·동반 증상 등"
          value={presentIllnessText}
          onChange={(e) => onPresentIllnessTextChange(e.target.value)}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.25 }}>
          A 상병 (Assessment)
        </Typography>
        <Typography sx={{ fontSize: 11, color: "var(--muted)", mb: 0.75, lineHeight: 1.4 }}>
          표준 상병 검색에서 선택해 등록합니다.
        </Typography>
        <Autocomplete<MasterDiagnosisItem, false, false, false>
          size="small"
          value={null}
          options={masterOptions}
          loading={masterLoading}
          filterOptions={(opts) => opts}
          isOptionEqualToValue={(a, b) => a.code === b.code && a.name === b.name}
          getOptionLabel={(o) => `${o.code} ${o.name}`}
          inputValue={masterInput}
          onInputChange={(_, v) => setMasterInput(v)}
          onChange={(_, v) => {
            if (!v) return;
            void (async () => {
              const ok = await tryAddDiagnosis(v.code, v.name);
              if (ok) setMasterInput("");
            })();
          }}
          blurOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              label="표준 상병 검색"
              placeholder="질병명 입력 후 목록에서 선택"
            />
          )}
          sx={{ mb: 1.25, maxWidth: 560, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ width: 76, fontWeight: 700 }}>
                  순서
                </TableCell>
                <TableCell align="center" sx={{ width: 72, fontWeight: 700 }}>
                  주진단
                </TableCell>
                <TableCell>상병기호</TableCell>
                <TableCell>상병명</TableCell>
                <TableCell align="center" sx={{ minWidth: 72, fontWeight: 700 }}>
                  작업
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDiagnoses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: "var(--muted)", fontSize: 13 }}>
                    등록된 상병이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                sortedDiagnoses.map((d, index) => (
                  <TableRow key={d.diagnosisId}>
                    <TableCell align="center" sx={{ py: 0.25 }}>
                      <Stack direction="row" spacing={0} justifyContent="center" alignItems="center">
                        <IconButton
                          size="small"
                          aria-label="위로"
                          disabled={visitId == null || index === 0}
                          onClick={() => void moveDiagnosis(index, -1)}
                        >
                          <KeyboardArrowUp fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="아래로"
                          disabled={visitId == null || index === sortedDiagnoses.length - 1}
                          onClick={() => void moveDiagnosis(index, 1)}
                        >
                          <KeyboardArrowDown fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        size="small"
                        checked={d.mainYn === "Y"}
                        disabled={visitId == null}
                        name={visitId != null ? `soap-main-dx-${visitId}` : "soap-main-dx-none"}
                        onChange={() => {
                          if (d.mainYn === "Y" || visitId == null) return;
                          void (async () => {
                            try {
                              await setDiagnosisMainApi(visitId, d.diagnosisId);
                              onDiagnosesReload();
                            } catch (e) {
                              window.alert(
                                e instanceof Error ? e.message : "주진단 변경 실패"
                              );
                            }
                          })();
                        }}
                        inputProps={{
                          "aria-label": `주진단 ${d.dxCode ?? d.diagnosisId}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>{d.dxCode ?? "-"}</TableCell>
                    <TableCell>{d.dxName ?? "-"}</TableCell>
                    <TableCell align="center">
                      {visitId != null && (
                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            try {
                              await removeDiagnosisApi(visitId, d.diagnosisId);
                              onDiagnosesReload();
                            } catch (e) {
                              window.alert(e instanceof Error ? e.message : "삭제 실패");
                            }
                          }}
                        >
                          삭제
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography sx={{ fontSize: 11, color: "var(--muted)", mb: 1 }}>
          첫 등록이 주진단, 추가는 부상병. 변경은 표의 라디오.
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>
          P 처방·약품 (Plan)
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mb: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>약품명</TableCell>
                <TableCell>용량</TableCell>
                <TableCell>횟수</TableCell>
                <TableCell>기간</TableCell>
                <TableCell width={120}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ color: "var(--muted)", fontSize: 13 }}>
                    등록된 처방이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                prescriptions.map((p) => (
                  <TableRow key={p.orderItemId}>
                    <TableCell>{p.medicationName ?? "-"}</TableCell>
                    <TableCell>{p.dosage ?? "-"}</TableCell>
                    <TableCell>{p.frequency ?? "-"}</TableCell>
                    <TableCell>{p.days ?? "-"}</TableCell>
                    <TableCell>
                      {visitId != null && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          <Button
                            size="small"
                            onClick={() => {
                              setRxEditTarget(p);
                              setRxEditName(p.medicationName ?? "");
                              setRxEditDosage(p.dosage ?? "");
                              setRxEditFrequency(p.frequency ?? "");
                              setRxEditDuration(p.days ?? "");
                              setRxEditOpen(true);
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={async () => {
                              try {
                                await removePrescriptionApi(visitId, p.orderId, p.orderItemId);
                                onPrescriptionsReload();
                              } catch (e) {
                                window.alert(e instanceof Error ? e.message : "삭제 실패");
                              }
                            }}
                          >
                            삭제
                          </Button>
                        </Stack>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap">
          <Typography sx={{ fontSize: 12 }}>다음 추가할 약:</Typography>
          <TextField
            size="small"
            placeholder="용량"
            value={prescriptionDosageInput}
            onChange={(e) => onPrescriptionDosageInputChange(e.target.value)}
            sx={{ width: 70, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <TextField
            size="small"
            placeholder="횟수"
            value={prescriptionFrequencyInput}
            onChange={(e) => onPrescriptionFrequencyInputChange(e.target.value)}
            sx={{ width: 56, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <TextField
            size="small"
            placeholder="기간"
            value={prescriptionDaysInput}
            onChange={(e) => onPrescriptionDaysInputChange(e.target.value)}
            sx={{ width: 60, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
          />
          <Autocomplete
            size="small"
            sx={{ minWidth: 280, flex: "1 1 220px", "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
            options={drugOptions}
            loading={drugLoading}
            filterOptions={(opts) => opts}
            getOptionLabel={(opt) =>
              typeof opt === "string"
                ? opt
                : [opt.itemName, opt.entpName ? `(${opt.entpName})` : "", opt.itemSeq ? `#${opt.itemSeq}` : ""]
                    .filter(Boolean)
                    .join(" ")
            }
            isOptionEqualToValue={(a, b) =>
              typeof a === "object" &&
              typeof b === "object" &&
              "key" in a &&
              "key" in b &&
              a.key === b.key
            }
            inputValue={prescriptionNameInput}
            onInputChange={(_, value, reason) => {
              if (reason === "input" || reason === "clear" || reason === "reset") {
                onPrescriptionNameInputChange(value);
              }
            }}
            onChange={(_, value) => {
              if (value && typeof value === "object" && "itemName" in value) {
                const o = value as DrugSuggestOption;
                onPrescriptionNameInputChange(
                  o.itemSeq ? `${o.itemName} (${o.itemSeq})` : o.itemName
                );
              } else if (typeof value === "string") {
                onPrescriptionNameInputChange(value);
              } else {
                onPrescriptionNameInputChange("");
              }
            }}
            noOptionsText={
              visitId == null
                ? "진료(방문)을 선택한 뒤 검색할 수 있습니다."
                : drugLoading
                  ? "검색 중…"
                  : prescriptionNameInput.trim().length < DRUG_SEARCH_MIN_CHARS
                    ? `제품명 ${DRUG_SEARCH_MIN_CHARS}글자 이상 입력하세요.`
                    : "일치하는 품목이 없습니다."
            }
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="약품명 검색 (e약은요)"
                helperText={drugHint}
                FormHelperTextProps={{ sx: { mx: 0, fontSize: 11 } }}
              />
            )}
          />
          <Button
            size="small"
            variant="outlined"
            disabled={visitId == null}
            onClick={async () => {
              if (visitId == null || !prescriptionNameInput.trim()) return;
              try {
                await addPrescriptionApi(visitId, {
                  medicationName: prescriptionNameInput.trim(),
                  dosage: prescriptionDosageInput || null,
                  frequency: prescriptionFrequencyInput || null,
                  days: prescriptionDaysInput || null,
                });
                onPrescriptionsReload();
                onPrescriptionNameInputChange("");
                onPrescriptionDosageInputChange("");
                onPrescriptionFrequencyInputChange("");
                onPrescriptionDaysInputChange("");
              } catch (e) {
                window.alert(e instanceof Error ? e.message : "등록 실패");
              }
            }}
          >
            추가
          </Button>
        </Stack>
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", mb: 0.5 }}>
          추가 메모 (시술, 추후계획 등)
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={2}
          size="small"
          value={additionalMemo}
          onChange={(e) => onAdditionalMemoChange(e.target.value)}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
        <Stack direction="row-reverse" spacing={1} alignItems="center" flexWrap="wrap" sx={{ width: "100%" }}>
          {savingRecord ? (
            <Typography sx={{ fontSize: 12, color: "var(--muted)", mr: "auto" }}>
              노트 저장 중…
            </Typography>
          ) : null}
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>전달</InputLabel>
            <Select label="전달" value="수납실">
              <MenuItem value="수납실">수납실</MenuItem>
            </Select>
          </FormControl>
          <Button
            size="small"
            variant="contained"
            color="success"
            disabled={visitId == null || savingRecord || completingVisit}
            onClick={() => {
              void (async () => {
                if (visitId == null) return;
                if (!window.confirm("진료를 완료하고 수납 서비스에 청구 연동을 요청할까요?")) return;
                setCompletingVisit(true);
                try {
                  await onVisitCompleted();
                  window.alert(
                    "진료가 완료되었습니다. 진료 서버가 수납 서비스 API로 연동 요청을 보냈습니다."
                  );
                } catch (e) {
                  window.alert(e instanceof Error ? e.message : "진료 완료 처리 실패");
                } finally {
                  setCompletingVisit(false);
                }
              })();
            }}
          >
            {completingVisit ? "처리 중…" : "진료완료"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
    <Dialog open={rxEditOpen} onClose={() => setRxEditOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>처방 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          <TextField
            label="약품명"
            fullWidth
            size="small"
            value={rxEditName}
            onChange={(e) => setRxEditName(e.target.value)}
          />
          <TextField
            label="용량"
            fullWidth
            size="small"
            value={rxEditDosage}
            onChange={(e) => setRxEditDosage(e.target.value)}
          />
          <TextField
            label="복용 횟수"
            fullWidth
            size="small"
            value={rxEditFrequency}
            onChange={(e) => setRxEditFrequency(e.target.value)}
          />
          <TextField
            label="기간"
            fullWidth
            size="small"
            value={rxEditDuration}
            onChange={(e) => setRxEditDuration(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRxEditOpen(false)}>취소</Button>
        <Button
          variant="contained"
          disabled={visitId == null || rxEditTarget == null || !rxEditName.trim()}
          onClick={async () => {
            if (visitId == null || rxEditTarget == null) return;
            try {
              await updatePrescriptionApi(visitId, rxEditTarget.orderId, rxEditTarget.orderItemId, {
                medicationName: rxEditName.trim(),
                dosage: rxEditDosage || null,
                frequency: rxEditFrequency || null,
                days: rxEditDuration || null,
              });
              setRxEditOpen(false);
              setRxEditTarget(null);
              onPrescriptionsReload();
            } catch (e) {
              window.alert(e instanceof Error ? e.message : "수정 실패");
            }
          }}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
