"use client";

import * as React from "react";

import {
  createConsentTypeApi,
  deactivateConsentTypeApi,
  fetchConsentLatestApi,
  fetchConsentTypesAllApi,
  fetchConsentWithdrawHistoryApi,
  updateConsentTypeApi,
  type ConsentLatest,
  type ConsentType,
  type ConsentWithdrawHistory,
} from "@/lib/patient/consentApi";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { consentActions } from "@/features/consent/consentSlice";
import type { Consent } from "@/features/consent/consentTypes";

import PatientConsentsView from "@/components/patient/consent/PatientConsentsView";
import ConsentEditDialog from "@/components/patient/consent/ConsentEditDialog";
import ConsentTypeManageDialog from "@/components/patient/consent/ConsentTypeManageDialog";
import {
  normalizeAgreedAtForInput,
  normalizeAgreedAtForSubmit,
  toOptional,
  type ConsentFormState,
} from "@/components/patient/consent/consentUtils";

type Props = {
  patientId: number;
  onClose?: () => void;
};

export default function PatientConsentContent({ patientId, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();

  const { list: consentList, loading: consentLoading, error: consentError } = useSelector(
    (s: RootState) => s.consent
  );

  const [editingConsent, setEditingConsent] = React.useState<Consent | null>(null);
  const [consentDialogOpen, setConsentDialogOpen] = React.useState(false);
  const [consentForm, setConsentForm] = React.useState<ConsentFormState>({
    consentType: "",
    note: "",
    activeYn: true,
    agreedAt: "",
  });

  const [consentTypesAll, setConsentTypesAll] = React.useState<ConsentType[]>([]);
  const [typeLoading, setTypeLoading] = React.useState(false);
  const [typeError, setTypeError] = React.useState<string | null>(null);

  const [latestList, setLatestList] = React.useState<ConsentLatest[]>([]);
  const [latestLoading, setLatestLoading] = React.useState(false);
  const [latestError, setLatestError] = React.useState<string | null>(null);

  const [withdrawList, setWithdrawList] = React.useState<ConsentWithdrawHistory[]>([]);
  const [withdrawLoading, setWithdrawLoading] = React.useState(false);
  const [withdrawError, setWithdrawError] = React.useState<string | null>(null);

  const [typeDialogOpen, setTypeDialogOpen] = React.useState(false);
  const [typeDialogMode, setTypeDialogMode] = React.useState<"create" | "edit">("create");
  const [editingType, setEditingType] = React.useState<ConsentType | null>(null);
  const [typeForm, setTypeForm] = React.useState({ code: "", name: "", sortOrder: "" });

  const consents = React.useMemo(
    () => consentList.filter((item) => item.patientId === patientId),
    [consentList, patientId]
  );

  const typeNameByCode = React.useMemo(() => {
    const obj: Record<string, string> = {};
    for (const t of consentTypesAll) obj[t.code] = t.name;
    return obj;
  }, [consentTypesAll]);

  React.useEffect(() => {
    dispatch(consentActions.clearConsent());
    dispatch(consentActions.fetchConsentRequest({ patientId }));
  }, [dispatch, patientId]);

  const loadConsentTypes = React.useCallback(async () => {
    try {
      setTypeLoading(true);
      setTypeError(null);
      const all = await fetchConsentTypesAllApi();
      setConsentTypesAll(all);
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "동의서 유형 조회 실패");
    } finally {
      setTypeLoading(false);
    }
  }, []);

  const loadLatest = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setLatestLoading(true);
      setLatestError(null);
      const list = await fetchConsentLatestApi(patientId);
      setLatestList(list);
    } catch (err) {
      setLatestError(err instanceof Error ? err.message : "최신 동의 상태 조회 실패");
    } finally {
      setLatestLoading(false);
    }
  }, [patientId]);

  const loadWithdrawHistory = React.useCallback(async () => {
    if (!patientId) return;
    try {
      setWithdrawLoading(true);
      setWithdrawError(null);
      const list = await fetchConsentWithdrawHistoryApi(patientId);
      setWithdrawList(list);
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "동의 철회 이력 조회 실패");
    } finally {
      setWithdrawLoading(false);
    }
  }, [patientId]);

  React.useEffect(() => {
    loadConsentTypes();
  }, [loadConsentTypes]);

  React.useEffect(() => {
    loadLatest();
  }, [loadLatest, consents.length]);

  React.useEffect(() => {
    loadWithdrawHistory();
  }, [loadWithdrawHistory, consents.length]);

  const openEditConsent = (item: Consent) => {
    setEditingConsent(item);
    setConsentForm({
      consentType: item.consentType ?? "",
      note: item.note ?? "",
      activeYn: Boolean(item.activeYn),
      agreedAt: normalizeAgreedAtForInput(item.agreedAt),
    });
    setConsentDialogOpen(true);
  };

  const closeConsentDialog = () => setConsentDialogOpen(false);

  const onSaveConsent = () => {
    if (!patientId || !editingConsent) return;
    dispatch(
      consentActions.updateConsentRequest({
        patientId,
        consentId: editingConsent.consentId,
        form: {
          activeYn: consentForm.activeYn,
          note: toOptional(consentForm.note),
          agreedAt: normalizeAgreedAtForSubmit(consentForm.agreedAt),
        },
      })
    );
    setConsentDialogOpen(false);
  };

  const onDeleteConsent = (item: Consent) => {
    if (!patientId) return;
    if (!confirm("동의서를 삭제할까요?")) return;
    dispatch(consentActions.deleteConsentRequest({ patientId, consentId: item.consentId }));
  };

  const openTypeDialog = () => {
    setTypeDialogMode("create");
    setEditingType(null);
    setTypeForm({ code: "", name: "", sortOrder: "" });
    setTypeDialogOpen(true);
  };

  const onEditType = (item: ConsentType) => {
    setTypeDialogMode("edit");
    setEditingType(item);
    setTypeForm({ code: item.code, name: item.name, sortOrder: String(item.sortOrder ?? "") });
    setTypeDialogOpen(true);
  };

  const onResetTypeForm = () => {
    setTypeDialogMode("create");
    setEditingType(null);
    setTypeForm({ code: "", name: "", sortOrder: "" });
  };

  const onSaveType = async () => {
    const code = typeForm.code.trim();
    const name = typeForm.name.trim();
    const sortOrder = typeForm.sortOrder.trim();
    if (!code || !name) return;
    try {
      if (typeDialogMode === "create") {
        await createConsentTypeApi({
          code,
          name,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
        });
      } else if (editingType) {
        await updateConsentTypeApi(editingType.code, {
          code,
          name,
          sortOrder: sortOrder ? Number(sortOrder) : undefined,
          isActive: editingType.isActive,
        });
      }
      await loadConsentTypes();
      setTypeDialogOpen(false);
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "동의서 유형 저장 실패");
    }
  };

  const onDeactivateType = async (item: ConsentType) => {
    if (!confirm("해당 유형을 비활성 처리할까요?")) return;
    try {
      await deactivateConsentTypeApi(item.code);
      await loadConsentTypes();
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "동의서 유형 비활성 실패");
    }
  };

  const onActivateType = async (item: ConsentType) => {
    if (!confirm("해당 유형을 다시 활성화할까요?")) return;
    try {
      await updateConsentTypeApi(item.code, {
        code: item.code,
        name: item.name,
        sortOrder: item.sortOrder,
        isActive: true,
      });
      await loadConsentTypes();
    } catch (err) {
      setTypeError(err instanceof Error ? err.message : "동의서 유형 활성화 실패");
    }
  };

  return (
    <>
      <PatientConsentsView
        typeNameByCode={typeNameByCode}
        consentLoading={consentLoading}
        consentError={consentError}
        consents={consents}
        onEditConsent={openEditConsent}
        onDeleteConsent={onDeleteConsent}
        latestLoading={latestLoading}
        latestError={latestError}
        latestList={latestList}
        withdrawLoading={withdrawLoading}
        withdrawError={withdrawError}
        withdrawList={withdrawList}
        typeError={typeError}
        onOpenTypeDialog={openTypeDialog}
      />

      <ConsentEditDialog
        open={consentDialogOpen}
        onClose={closeConsentDialog}
        loading={consentLoading}
        form={consentForm}
        onFormChange={setConsentForm}
        onSave={onSaveConsent}
      />

      <ConsentTypeManageDialog
        open={typeDialogOpen}
        onClose={() => setTypeDialogOpen(false)}
        loading={typeLoading}
        mode={typeDialogMode}
        typeForm={typeForm}
        onTypeFormChange={setTypeForm}
        onSaveType={onSaveType}
        onResetForm={onResetTypeForm}
        types={consentTypesAll}
        onEditType={onEditType}
        onDeactivateType={onDeactivateType}
        onActivateType={onActivateType}
      />
    </>
  );
}
