"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "@/components/layout/MainLayout";
import { Alert, Box, Snackbar, Stack } from "@mui/material";
import type { Patient } from "@/features/patients/patientTypes";
import { clinicalActions } from "@/features/clinical/clinicalSlice";
import type { RootState } from "@/store/store";
import { deletePastHistoryApi } from "@/lib/clinical/clinicalPastHistoryApi";
import { fetchClinicalOrdersApi, type ClinicalOrder } from "@/lib/clinical/clinicalOrderApi";
import {
  fetchVitalsApi,
  fetchAssessmentApi,
  type VitalSignsRes,
  type AssessmentRes,
} from "@/lib/clinical/clinicalVitalsApi";
import {
  fetchPastHistoryApi,
  type PastHistoryItem,
} from "@/lib/clinical/clinicalPastHistoryApi";
import {
  isNetworkError,
  clinicalConnectionMessage,
  type ReceptionQueueItem,
} from "@/lib/clinical/visitApi";
import { resolveClinicalStatus } from "./clinicalDocumentation";
import { ClinicalToolbar } from "./ClinicalEncounter";
import { ClinicalPatientList } from "./ClinicalList";
import { ClinicalRightPanel } from "./ClinicalOrder";
import { ClinicalChartCenter } from "./chart/ClinicalChartCenter";
import type { PriorSubjectiveApplyMode } from "./chart/ClinicalPastVisitsCard";
import {
  ClinicalOrderDialog,
  type ClinicalOrderDialogVariant,
} from "./dialogs/ClinicalOrderDialog";
import {
  ClinicalPastHistoryDialog,
  type PastHistoryFormState,
} from "./dialogs/ClinicalPastHistoryDialog";
import {
  ClinicalVitalAssessmentDialog,
  type VitalsFormState,
  type AssessmentFormState,
} from "./dialogs/ClinicalVitalAssessmentDialog";
import { addPrescriptionApi, DoctorNoteRes, fetchDiagnosesApi, fetchDoctorNoteApi, fetchPrescriptionsApi } from "@/lib/clinical/clinicalRecordApi";

const NOTE_AUTOSAVE_MS = 750;

export default function ClinicalPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const LEFT_LIST_PAGE_SIZE = 10;
  const PAST_CLINICAL_PAGE_SIZE = 10;

  const patients = useSelector((s: RootState) => s.clinical.patients);
  const clinicals = useSelector((s: RootState) => s.clinical.clinicals);
  const receptions = useSelector((s: RootState) => s.clinical.receptions);
  const receptionLoading = useSelector((s: RootState) => s.clinical.receptionLoading);
  const errorMessage = useSelector((s: RootState) => s.clinical.errorMessage);
  const noteSaveInflight = useSelector((s: RootState) => s.clinical.noteSaveInflight);
  const persistNoteError = useSelector((s: RootState) => s.clinical.persistNoteError);
  const startVisitPhase = useSelector((s: RootState) => s.clinical.startVisitPhase);
  const startVisitError = useSelector((s: RootState) => s.clinical.startVisitError);
  const endVisitPhase = useSelector((s: RootState) => s.clinical.endVisitPhase);
  const endVisitError = useSelector((s: RootState) => s.clinical.endVisitError);

  const [selectedReception, setSelectedReception] = React.useState<ReceptionQueueItem | null>(null);
  const [leftPage, setLeftPage] = React.useState(1);
  const [selectedPatientId, setSelectedPatientId] = React.useState<number | null>(null);
  const [creatingClinical, setCreatingClinical] = React.useState(false);
  const creatingClinicalRef = React.useRef(false);

  const [orders, setOrders] = React.useState<ClinicalOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = React.useState(false);
  const [orderDialogVariant, setOrderDialogVariant] =
    React.useState<ClinicalOrderDialogVariant>("exam");
  const [updatingOrderId, setUpdatingOrderId] = React.useState<number | null>(null);

  const [vitals, setVitals] = React.useState<VitalSignsRes | null>(null);
  const [assessment, setAssessment] = React.useState<AssessmentRes | null>(null);
  const [vitalsLoading, setVitalsLoading] = React.useState(false);
  const [assessmentLoading, setAssessmentLoading] = React.useState(false);
  const [vitalAssessmentDialogOpen, setVitalAssessmentDialogOpen] = React.useState(false);
  const [vitalsForm, setVitalsForm] = React.useState<VitalsFormState>({
    temperature: "",
    pulse: "",
    bpSystolic: "",
    bpDiastolic: "",
    respiratoryRate: "",
    measuredAt: "",
  });
  const [assessmentForm, setAssessmentForm] = React.useState<AssessmentFormState>({
    chiefComplaint: "",
    visitReason: "",
    historyPresentIllness: "",
    pastHistory: "",
    familyHistory: "",
    allergy: "",
    currentMedication: "",
  });

  const [department, setDepartment] = React.useState("");
  const [diagnoses, setDiagnoses] = React.useState<
    Awaited<ReturnType<typeof fetchDiagnosesApi>>
  >([]);
  const [prescriptions, setPrescriptions] = React.useState<
    Awaited<ReturnType<typeof fetchPrescriptionsApi>>
  >([]);
  const [chiefComplaintText, setChiefComplaintText] = React.useState("");
  const [presentIllnessText, setPresentIllnessText] = React.useState("");
  const [prescriptionNameInput, setPrescriptionNameInput] = React.useState("");
  const [prescriptionDosageInput, setPrescriptionDosageInput] = React.useState("");
  const [prescriptionFrequencyInput, setPrescriptionFrequencyInput] = React.useState("");
  const [prescriptionDaysInput, setPrescriptionDaysInput] = React.useState("");
  const [additionalMemo, setAdditionalMemo] = React.useState("");
  const [groupOrderText, setGroupOrderText] = React.useState("");
  const [chartTemplateText, setChartTemplateText] = React.useState("");
  const savingRecord = noteSaveInflight > 0;
  const noteLastSavedRef = React.useRef({ cc: "", pi: "", memo: "" });
  const activeVisitIdRef = React.useRef<number | null>(null);
  const pendingPersistSnapshotRef = React.useRef<{ cc: string; pi: string; memo: string } | null>(
    null
  );
  const prevNoteSaveInflightRef = React.useRef(0);
  const endVisitPromiseRef = React.useRef<{ resolve: () => void; reject: (e: Error) => void } | null>(
    null
  );
  const startVisitPatientIdRef = React.useRef<number | null>(null);
  const [pastClinicalSummaries, setPastClinicalSummaries] = React.useState<Record<number, string>>(
    {}
  );
  const [pastVisitNotesById, setPastVisitNotesById] = React.useState<
    Record<number, DoctorNoteRes | null>
  >({});
  const [pastVisitNotesLoading, setPastVisitNotesLoading] = React.useState(false);
  const [clinicalSnackbar, setClinicalSnackbar] = React.useState<{
    message: string;
    severity: "info" | "error";
  } | null>(null);
  const [pastClinicalPage, setPastClinicalPage] = React.useState(1);
  const [repeatingFromClinicalId, setRepeatingFromClinicalId] = React.useState<number | null>(
    null
  );
  const [pastHistoryList, setPastHistoryList] = React.useState<PastHistoryItem[]>([]);
  const [pastHistoryLoading, setPastHistoryLoading] = React.useState(false);
  const [pastHistoryDialogOpen, setPastHistoryDialogOpen] = React.useState(false);
  const [pastHistoryEditingId, setPastHistoryEditingId] = React.useState<number | null>(null);
  const [pastHistoryForm, setPastHistoryForm] = React.useState<PastHistoryFormState>({
    historyType: "DISEASE",
    name: "",
    memo: "",
  });

  const queryPatientId = React.useMemo(() => {
    const raw = searchParams.get("patientId");
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const loadOrders = React.useCallback(async (visitId: number) => {
    setOrdersLoading(true);
    try {
      setOrders(await fetchClinicalOrdersApi(visitId));
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadVitals = React.useCallback(async (visitId: number) => {
    setVitalsLoading(true);
    try {
      setVitals((await fetchVitalsApi(visitId)) ?? null);
    } catch {
      setVitals(null);
    } finally {
      setVitalsLoading(false);
    }
  }, []);

  const loadAssessment = React.useCallback(async (visitId: number) => {
    setAssessmentLoading(true);
    try {
      setAssessment((await fetchAssessmentApi(visitId)) ?? null);
    } catch {
      setAssessment(null);
    } finally {
      setAssessmentLoading(false);
    }
  }, []);

  const loadDoctorNote = React.useCallback(async (visitId: number) => {
    try {
      const data = await fetchDoctorNoteApi(visitId);
      if (data) {
        const ccRaw = data.chiefComplaint ?? "";
        const piRaw = data.presentIllness ?? "";
        const memoRaw = data.clinicalMemo ?? "";
        setChiefComplaintText(ccRaw);
        setPresentIllnessText(piRaw);
        setAdditionalMemo(memoRaw);
        noteLastSavedRef.current = {
          cc: ccRaw.trim(),
          pi: piRaw.trim(),
          memo: memoRaw.trim(),
        };
      } else {
        setChiefComplaintText("");
        setPresentIllnessText("");
        setAdditionalMemo("");
        noteLastSavedRef.current = { cc: "", pi: "", memo: "" };
      }
    } catch {
      setChiefComplaintText("");
      setPresentIllnessText("");
      setAdditionalMemo("");
      noteLastSavedRef.current = { cc: "", pi: "", memo: "" };
    }
  }, []);

  const loadDiagnoses = React.useCallback(async (visitId: number) => {
    try {
      setDiagnoses(await fetchDiagnosesApi(visitId));
    } catch {
      setDiagnoses([]);
    }
  }, []);

  const loadPrescriptions = React.useCallback(async (visitId: number) => {
    try {
      setPrescriptions(await fetchPrescriptionsApi(visitId));
    } catch {
      setPrescriptions([]);
    }
  }, []);

  const loadPastHistory = React.useCallback(async (visitId: number) => {
    setPastHistoryLoading(true);
    try {
      setPastHistoryList(await fetchPastHistoryApi(visitId));
    } catch {
      setPastHistoryList([]);
    } finally {
      setPastHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    dispatch(clinicalActions.fetchClinicalBootstrapRequest());
    dispatch(clinicalActions.fetchReceptionQueueRequest());
  }, [dispatch]);

  React.useEffect(() => {
    if (!queryPatientId) return;
    const r = receptions.find((x) => x.patientId === queryPatientId);
    if (r) {
      setSelectedReception(r);
      setSelectedPatientId(queryPatientId);
    }
  }, [queryPatientId, receptions]);

  const patientMap = React.useMemo(() => {
    const m = new Map<number, Patient>();
    for (const p of patients) m.set(p.patientId, p);
    return m;
  }, [patients]);

  const listForLeft = React.useMemo(() => {
    let filtered = receptions.filter((r) => r.status !== "CANCELLED");
    if (department) {
      filtered = filtered.filter((r) => (r.departmentName ?? "").includes(department));
    }
    const completedForReception = (receptionId: number) =>
      clinicals.some(
        (c) =>
          c.receptionId != null &&
          Number(c.receptionId) === Number(receptionId) &&
          resolveClinicalStatus(c) === "COMPLETED"
      );
    return filtered.filter(
      (r) =>
        !completedForReception(r.receptionId) &&
        (r.status === "WAITING" ||
          r.status === "CALLED" ||
          r.status === "IN_PROGRESS")
    );
  }, [receptions, department, clinicals]);

  const selectedPatient = React.useMemo((): Patient | null => {
    if (!selectedReception) return null;
    const p = patientMap.get(selectedReception.patientId);
    if (p) return p;
    return {
      patientId: selectedReception.patientId,
      name: selectedReception.patientName?.trim() ?? `환자 ${selectedReception.patientId}`,
    } as Patient;
  }, [selectedReception, patientMap]);

  React.useEffect(() => {
    if (listForLeft.length === 0) return;
    const currentInList =
      selectedReception &&
      listForLeft.some((r) => r.receptionId === selectedReception.receptionId);
    if (!currentInList) {
      setSelectedReception(listForLeft[0]);
      setSelectedPatientId(listForLeft[0].patientId);
    }
  }, [listForLeft, selectedReception]);

  const totalLeftPages = Math.max(1, Math.ceil(listForLeft.length / LEFT_LIST_PAGE_SIZE));
  const paginatedLeftList = React.useMemo(() => {
    const start = (leftPage - 1) * LEFT_LIST_PAGE_SIZE;
    return listForLeft.slice(start, start + LEFT_LIST_PAGE_SIZE);
  }, [listForLeft, leftPage, LEFT_LIST_PAGE_SIZE]);

  const handleSelectReception = React.useCallback((r: ReceptionQueueItem) => {
    setSelectedReception(r);
    setSelectedPatientId(r.patientId);
  }, []);

  const activeVisitClinical = React.useMemo(() => {
    if (!selectedReception || selectedReception.status !== "IN_PROGRESS") return null;
    const byReception = clinicals
      .filter(
        (c) =>
          c.receptionId === selectedReception.receptionId &&
          resolveClinicalStatus(c) === "IN_PROGRESS"
      )
      .sort((a, b) => (b.clinicalId ?? b.id ?? 0) - (a.clinicalId ?? a.id ?? 0))[0];
    if (byReception) return byReception;
    return (
      clinicals
        .filter(
          (c) =>
            c.patientId === selectedReception.patientId &&
            resolveClinicalStatus(c) === "IN_PROGRESS"
        )
        .sort((a, b) => (b.clinicalId ?? b.id ?? 0) - (a.clinicalId ?? a.id ?? 0))[0] ?? null
    );
  }, [clinicals, selectedReception]);
  const currentClinicalId = activeVisitClinical?.clinicalId ?? activeVisitClinical?.id ?? null;

  const pastClinicalsForPatient = React.useMemo(() => {
    if (!selectedPatient) return [];
    const id = currentClinicalId ?? undefined;
    return clinicals
      .filter((c) => c.patientId === selectedPatient.patientId && (c.clinicalId ?? c.id) !== id)
      .sort(
        (a, b) =>
          new Date(b.clinicalAt ?? b.createdAt ?? 0).getTime() -
          new Date(a.clinicalAt ?? a.createdAt ?? 0).getTime()
      );
  }, [clinicals, selectedPatient, currentClinicalId]);

  const handleApplyPriorSubjective = React.useCallback(
    async (priorVisitId: number, mode: PriorSubjectiveApplyMode): Promise<boolean> => {
      const targetsCc = mode === "CC" || mode === "BOTH";
      const targetsPi = mode === "PI" || mode === "BOTH";
      const wouldOverwriteCc = targetsCc && chiefComplaintText.trim().length > 0;
      const wouldOverwritePi = targetsPi && presentIllnessText.trim().length > 0;
      if (
        (wouldOverwriteCc || wouldOverwritePi) &&
        !window.confirm("선택한 칸의 내용을 해당 방문 기록으로 바꿉니다. 계속할까요?")
      ) {
        return false;
      }
      const toast = (message: string, severity: "info" | "error" = "info") =>
        setClinicalSnackbar({ message, severity });
      try {
        const note = await fetchDoctorNoteApi(priorVisitId);
        if (!note) {
          toast("해당 방문에 서버에 남아 있는 진료노트가 없어 반영할 주관적 기록이 없습니다.");
          return false;
        }
        const cc = note.chiefComplaint ?? "";
        const pi = note.presentIllness ?? "";
        if (mode === "CC") {
          if (!cc.trim()) {
            toast("해당 방문에 입력된 주호소가 없습니다.");
            return false;
          }
          setChiefComplaintText(cc);
          toast("주호소를 현재 차트에 반영했습니다.");
          return true;
        }
        if (mode === "PI") {
          if (!pi.trim()) {
            toast("해당 방문에 입력된 현병력이 없습니다.");
            return false;
          }
          setPresentIllnessText(pi);
          toast("현병력을 현재 차트에 반영했습니다.");
          return true;
        }
        if (!cc.trim() && !pi.trim()) {
          toast("해당 방문에 입력된 주호소·현병력이 없습니다.");
          return false;
        }
        setChiefComplaintText(cc);
        setPresentIllnessText(pi);
        toast("주호소·현병력을 현재 차트에 반영했습니다.");
        return true;
      } catch (e) {
        toast(e instanceof Error ? e.message : "불러오기에 실패했습니다.", "error");
        return false;
      }
    },
    [chiefComplaintText, presentIllnessText]
  );

  const totalPastClinicalPages = Math.max(
    1,
    Math.ceil(pastClinicalsForPatient.length / PAST_CLINICAL_PAGE_SIZE)
  );
  const pastClinicalPageSafe = Math.min(pastClinicalPage, totalPastClinicalPages);
  const paginatedPastClinicals = React.useMemo(() => {
    const start = (pastClinicalPageSafe - 1) * PAST_CLINICAL_PAGE_SIZE;
    return pastClinicalsForPatient.slice(start, start + PAST_CLINICAL_PAGE_SIZE);
  }, [pastClinicalsForPatient, pastClinicalPageSafe, PAST_CLINICAL_PAGE_SIZE]);

  React.useEffect(() => {
    setPastClinicalPage(1);
  }, [selectedPatientId]);

  React.useEffect(() => {
    if (pastClinicalsForPatient.length === 0) {
      setPastClinicalSummaries({});
      setPastVisitNotesById({});
      setPastVisitNotesLoading(false);
      return;
    }
    let cancelled = false;
    const ids = pastClinicalsForPatient
      .map((c) => c.clinicalId ?? c.id)
      .filter((x): x is number => x != null);
    setPastVisitNotesLoading(true);
    Promise.all(ids.map((id) => fetchDoctorNoteApi(id)))
      .then((notes) => {
        if (cancelled) return;
        const nextSummary: Record<number, string> = {};
        const nextNotes: Record<number, DoctorNoteRes | null> = {};
        ids.forEach((id, i) => {
          const note = notes[i] ?? null;
          nextNotes[id] = note;
          const cc = (note?.chiefComplaint ?? "").trim();
          const pi = (note?.presentIllness ?? "").trim();
          const parts = [cc, pi].filter(Boolean);
          nextSummary[id] = parts.length ? parts.join(" · ") : "-";
        });
        setPastClinicalSummaries(nextSummary);
        setPastVisitNotesById(nextNotes);
      })
      .catch(() => {
        if (!cancelled) {
          setPastClinicalSummaries({});
          setPastVisitNotesById({});
        }
      })
      .finally(() => {
        if (!cancelled) setPastVisitNotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pastClinicalsForPatient]);

  React.useEffect(() => {
    if (currentClinicalId != null) {
      loadOrders(currentClinicalId);
      loadVitals(currentClinicalId);
      loadAssessment(currentClinicalId);
      loadDoctorNote(currentClinicalId);
      loadDiagnoses(currentClinicalId);
      loadPrescriptions(currentClinicalId);
      loadPastHistory(currentClinicalId);
    } else {
      setOrders([]);
      setVitals(null);
      setAssessment(null);
      setDiagnoses([]);
      setPrescriptions([]);
      setChiefComplaintText("");
      setPresentIllnessText("");
      setAdditionalMemo("");
      setPastHistoryList([]);
      noteLastSavedRef.current = { cc: "", pi: "", memo: "" };
    }
  }, [
    currentClinicalId,
    loadOrders,
    loadVitals,
    loadAssessment,
    loadDoctorNote,
    loadDiagnoses,
    loadPrescriptions,
    loadPastHistory,
  ]);

  React.useEffect(() => {
    activeVisitIdRef.current = currentClinicalId;
  }, [currentClinicalId]);

  const persistVisitNoteFields = React.useCallback(
    (visitId: number, cc: string, pi: string, memo: string) => {
      pendingPersistSnapshotRef.current = { cc, pi, memo };
      dispatch(
        clinicalActions.persistVisitNoteRequest({
          visitId,
          chiefComplaint: cc,
          presentIllness: pi,
          clinicalMemo: memo,
        })
      );
    },
    [dispatch]
  );

  React.useEffect(() => {
    if (prevNoteSaveInflightRef.current > 0 && noteSaveInflight === 0 && !persistNoteError) {
      const snap = pendingPersistSnapshotRef.current;
      if (snap && activeVisitIdRef.current != null) {
        noteLastSavedRef.current = snap;
      }
      pendingPersistSnapshotRef.current = null;
    }
    prevNoteSaveInflightRef.current = noteSaveInflight;
  }, [noteSaveInflight, persistNoteError]);

  React.useEffect(() => {
    if (!persistNoteError) return;
    pendingPersistSnapshotRef.current = null;
    setClinicalSnackbar({ message: persistNoteError, severity: "error" });
    dispatch(clinicalActions.clearPersistVisitNoteError());
  }, [persistNoteError, dispatch]);

  React.useEffect(() => {
    if (currentClinicalId == null) return;
    const t = window.setTimeout(() => {
      const cc = chiefComplaintText.trim();
      const pi = presentIllnessText.trim();
      const memo = additionalMemo.trim();
      const last = noteLastSavedRef.current;
      if (cc === last.cc && pi === last.pi && memo === last.memo) return;
      const vid = currentClinicalId;
      persistVisitNoteFields(vid, cc, pi, memo);
    }, NOTE_AUTOSAVE_MS);
    return () => window.clearTimeout(t);
  }, [chiefComplaintText, presentIllnessText, additionalMemo, currentClinicalId, persistVisitNoteFields]);

  React.useEffect(() => {
    if (endVisitPhase !== "success" && endVisitPhase !== "error") return;
    const p = endVisitPromiseRef.current;
    endVisitPromiseRef.current = null;
    if (p) {
      if (endVisitPhase === "success") p.resolve();
      else p.reject(new Error(endVisitError ?? "진료 완료 실패"));
    }
    dispatch(clinicalActions.clearEndVisitOutcome());
  }, [endVisitPhase, endVisitError, dispatch]);

  React.useEffect(() => {
    if (startVisitPhase === "success") {
      const pid = startVisitPatientIdRef.current;
      if (pid != null) setSelectedPatientId(pid);
      setSelectedReception((prev) => (prev ? { ...prev, status: "IN_PROGRESS" } : prev));
      window.alert("진료가 시작되었습니다.");
      startVisitPatientIdRef.current = null;
      dispatch(clinicalActions.clearStartVisitOutcome());
    } else if (startVisitPhase === "error" && startVisitError) {
      const message = isNetworkError(new Error(startVisitError))
        ? clinicalConnectionMessage()
        : startVisitError;
      window.alert(message);
      startVisitPatientIdRef.current = null;
      dispatch(clinicalActions.clearStartVisitOutcome());
    }
    if (startVisitPhase === "success" || startVisitPhase === "error") {
      creatingClinicalRef.current = false;
      setCreatingClinical(false);
    }
  }, [startVisitPhase, startVisitError, dispatch]);

  React.useEffect(() => {
    setLeftPage(1);
  }, [department]);

  React.useEffect(() => {
    if (leftPage > totalLeftPages) setLeftPage(totalLeftPages);
  }, [leftPage, totalLeftPages]);

  const handleStartNewClinical = React.useCallback(() => {
    if (!selectedReception) {
      window.alert("접수 환자를 먼저 선택해 주세요.");
      return;
    }
    if (creatingClinicalRef.current) return;
    creatingClinicalRef.current = true;
    setCreatingClinical(true);
    startVisitPatientIdRef.current = selectedReception.patientId;
    dispatch(clinicalActions.startVisitRequest({ receptionId: selectedReception.receptionId }));
  }, [selectedReception, dispatch]);

  const openVitalDialog = React.useCallback(
    (mode: "new" | "edit") => {
      if (mode === "edit" && vitals) {
        setVitalsForm({
          temperature: String(vitals.temperature ?? ""),
          pulse: String(vitals.pulse ?? ""),
          bpSystolic: String(vitals.bpSystolic ?? ""),
          bpDiastolic: String(vitals.bpDiastolic ?? ""),
          respiratoryRate: String(vitals.respiratoryRate ?? ""),
          measuredAt: vitals.measuredAt
            ? new Date(vitals.measuredAt).toISOString().slice(0, 16)
            : new Date().toISOString().slice(0, 16),
        });
      } else {
        setVitalsForm({
          temperature: "",
          pulse: "",
          bpSystolic: "",
          bpDiastolic: "",
          respiratoryRate: "",
          measuredAt: new Date().toISOString().slice(0, 16),
        });
      }
      if (assessment) {
        setAssessmentForm({
          chiefComplaint: assessment.chiefComplaint ?? "",
          visitReason: assessment.visitReason ?? "",
          historyPresentIllness: assessment.historyPresentIllness ?? "",
          pastHistory: assessment.pastHistory ?? "",
          familyHistory: assessment.familyHistory ?? "",
          allergy: assessment.allergy ?? "",
          currentMedication: assessment.currentMedication ?? "",
        });
      } else {
        setAssessmentForm({
          chiefComplaint: "",
          visitReason: "",
          historyPresentIllness: "",
          pastHistory: "",
          familyHistory: "",
          allergy: "",
          currentMedication: "",
        });
      }
      setVitalAssessmentDialogOpen(true);
    },
    [vitals, assessment]
  );

  const handleRepeatPrescription = React.useCallback(
    async (fromVisitId: number) => {
      if (currentClinicalId == null) return;
      setRepeatingFromClinicalId(fromVisitId);
      try {
        const list = await fetchPrescriptionsApi(fromVisitId);
        for (const rx of list) {
          await addPrescriptionApi(currentClinicalId, {
            medicationName: rx.medicationName ?? undefined,
            dosage: rx.dosage ?? undefined,
            frequency: rx.frequency ?? undefined,
            days: rx.days ?? undefined,
          });
        }
        await loadPrescriptions(currentClinicalId);
        if (list.length > 0)
          window.alert(`해당 진료의 처방 ${list.length}건을 현재 진료에 넣었습니다.`);
        else window.alert("해당 진료에 등록된 처방이 없습니다.");
      } catch (e) {
        window.alert(e instanceof Error ? e.message : "반복처방 실패");
      } finally {
        setRepeatingFromClinicalId(null);
      }
    },
    [currentClinicalId, loadPrescriptions]
  );

  const handleVisitCompleted = React.useCallback(async () => {
    if (currentClinicalId == null) return;
    await new Promise<void>((resolve, reject) => {
      endVisitPromiseRef.current = { resolve, reject };
      dispatch(
        clinicalActions.endVisitRequest({
          visitId: currentClinicalId,
          chiefComplaint: chiefComplaintText.trim(),
          presentIllness: presentIllnessText.trim(),
          clinicalMemo: additionalMemo.trim(),
        })
      );
    });
  }, [dispatch, currentClinicalId, chiefComplaintText, presentIllnessText, additionalMemo]);

  const now = new Date();
  const calendarYear = now.getFullYear();
  const calendarMonth = now.getMonth();
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );

  return (
    <MainLayout showSidebar={true}>
      <Stack spacing={0}>
        {errorMessage && (
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            {errorMessage}
          </Alert>
        )}
        <ClinicalToolbar
          creatingClinical={creatingClinical}
          selectedPatient={selectedReception ? selectedPatient : null}
          onStartNewClinical={handleStartNewClinical}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(200px, 15rem) minmax(0, 1fr) minmax(176px, 13.5rem)",
              xl: "minmax(188px, 14rem) minmax(0, 1fr) minmax(168px, 12.5rem)",
            },
            minHeight: "calc(100vh - 120px)",
            alignItems: "stretch",
          }}
        >
          <ClinicalPatientList
            department={department}
            onDepartmentChange={setDepartment}
            paginatedLeftList={paginatedLeftList}
            listForLeft={listForLeft}
            leftPage={leftPage}
            totalLeftPages={totalLeftPages}
            onLeftPageChange={setLeftPage}
            clinicals={clinicals}
            selectedReception={selectedReception}
            onSelectReception={handleSelectReception}
            receptionLoading={receptionLoading}
          />

          <ClinicalChartCenter
            selectedPatient={selectedPatient}
            visitId={currentClinicalId}
            currentVisitStartedAt={
              activeVisitClinical?.clinicalAt ?? activeVisitClinical?.createdAt ?? null
            }
            vitals={vitals}
            assessment={assessment}
            vitalsLoading={vitalsLoading}
            assessmentLoading={assessmentLoading}
            onOpenVitalDialog={openVitalDialog}
            pastHistoryList={pastHistoryList}
            pastHistoryLoading={pastHistoryLoading}
            onAddPhx={() => {
              setPastHistoryEditingId(null);
              setPastHistoryForm({ historyType: "DISEASE", name: "", memo: "" });
              setPastHistoryDialogOpen(true);
            }}
            onEditPhx={(row) => {
              setPastHistoryEditingId(row.id ?? null);
              setPastHistoryForm({
                historyType: row.historyType,
                name: row.name ?? "",
                memo: row.memo ?? "",
              });
              setPastHistoryDialogOpen(true);
            }}
            onDeletePhx={async (rowId) => {
              if (currentClinicalId == null) return;
              await deletePastHistoryApi(currentClinicalId, rowId);
              await loadPastHistory(currentClinicalId);
            }}
            pastClinicalsForPatient={pastClinicalsForPatient}
            paginatedPastClinicals={paginatedPastClinicals}
            pastClinicalSummaries={pastClinicalSummaries}
            pastVisitNotesById={pastVisitNotesById}
            pastVisitNotesLoading={pastVisitNotesLoading}
            pastClinicalPageSafe={pastClinicalPageSafe}
            totalPastClinicalPages={totalPastClinicalPages}
            onPastClinicalPageChange={setPastClinicalPage}
            repeatingFromClinicalId={repeatingFromClinicalId}
            onRepeatPrescription={handleRepeatPrescription}
            onApplyPriorSubjective={handleApplyPriorSubjective}
            diagnoses={diagnoses}
            prescriptions={prescriptions}
            chiefComplaintText={chiefComplaintText}
            onChiefComplaintTextChange={setChiefComplaintText}
            presentIllnessText={presentIllnessText}
            onPresentIllnessTextChange={setPresentIllnessText}
            prescriptionNameInput={prescriptionNameInput}
            onPrescriptionNameInputChange={setPrescriptionNameInput}
            prescriptionDosageInput={prescriptionDosageInput}
            onPrescriptionDosageInputChange={setPrescriptionDosageInput}
            prescriptionFrequencyInput={prescriptionFrequencyInput}
            onPrescriptionFrequencyInputChange={setPrescriptionFrequencyInput}
            prescriptionDaysInput={prescriptionDaysInput}
            onPrescriptionDaysInputChange={setPrescriptionDaysInput}
            additionalMemo={additionalMemo}
            onAdditionalMemoChange={setAdditionalMemo}
            savingRecord={savingRecord}
            onDiagnosesReload={() =>
              currentClinicalId != null ? loadDiagnoses(currentClinicalId) : Promise.resolve()
            }
            onPrescriptionsReload={() =>
              currentClinicalId != null ? loadPrescriptions(currentClinicalId) : Promise.resolve()
            }
            onVisitCompleted={handleVisitCompleted}
          />

          <ClinicalRightPanel
            now={now}
            calendarYear={calendarYear}
            calendarMonth={calendarMonth}
            calendarDays={calendarDays}
            groupOrderText={groupOrderText}
            onGroupOrderTextChange={setGroupOrderText}
            chartTemplateText={chartTemplateText}
            onChartTemplateTextChange={setChartTemplateText}
            orders={orders}
            ordersLoading={ordersLoading}
            visitId={currentClinicalId}
            updatingOrderId={updatingOrderId}
            onUpdatingOrderId={setUpdatingOrderId}
            onOrdersRefresh={() =>
              currentClinicalId != null ? void loadOrders(currentClinicalId) : undefined
            }
            onOrdersReplace={setOrders}
            onOpenOrderDialog={(variant) => {
              setOrderDialogVariant(variant);
              setOrderDialogOpen(true);
            }}
          />
        </Box>
      </Stack>

      <ClinicalOrderDialog
        open={orderDialogOpen}
        variant={orderDialogVariant}
        onClose={() => setOrderDialogOpen(false)}
        visitId={currentClinicalId}
        onCreated={async () => {
          if (currentClinicalId != null) await loadOrders(currentClinicalId);
        }}
      />

      <ClinicalPastHistoryDialog
        open={pastHistoryDialogOpen}
        onClose={() => setPastHistoryDialogOpen(false)}
        visitId={currentClinicalId}
        editingId={pastHistoryEditingId}
        form={pastHistoryForm}
        onFormChange={setPastHistoryForm}
        onSaved={async () => {
          if (currentClinicalId != null) await loadPastHistory(currentClinicalId);
        }}
      />

      <ClinicalVitalAssessmentDialog
        open={vitalAssessmentDialogOpen}
        onClose={() => setVitalAssessmentDialogOpen(false)}
        visitId={currentClinicalId}
        vitalsForm={vitalsForm}
        onVitalsFormChange={setVitalsForm}
        assessmentForm={assessmentForm}
        onAssessmentFormChange={setAssessmentForm}
        onSaved={async () => {
          if (currentClinicalId != null) {
            await Promise.all([
              loadVitals(currentClinicalId),
              loadAssessment(currentClinicalId),
            ]);
          }
        }}
      />

      <Snackbar
        open={clinicalSnackbar != null}
        autoHideDuration={clinicalSnackbar?.severity === "error" ? 8000 : 5500}
        onClose={() => setClinicalSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={clinicalSnackbar?.severity ?? "info"}
          variant="filled"
          onClose={() => setClinicalSnackbar(null)}
          sx={{ width: "100%", maxWidth: 480 }}
        >
          {clinicalSnackbar?.message ?? ""}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
