import { cookies } from "next/headers";
import BillingListClient from "@/app/billing/list/BillingListClient";
import {
  fetchInitialBillingList,
  type ServerBillSummary,
} from "@/lib/billing/billingServerApi";
import { fetchInitialPatients } from "@/lib/patient/patientServerApi";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/staff/staffServerApi";

export const dynamic = "force-dynamic";

type BillingListPageProps = {
  searchParams: Promise<{
    status?: string;
    confirmedOnly?: string;
    partialOnly?: string;
    billingDate?: string;
  }>;
};

export default async function BillingListPage({ searchParams }: BillingListPageProps) {
  const query = await searchParams;
  const status = query.status ?? null;
  const confirmedOnly = query.confirmedOnly === "true";
  const partialOnly = query.partialOnly === "true";
  const billingDate = query.billingDate ?? null;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value?.trim() ?? "";

  let initialBillingList: ServerBillSummary[] = [];
  let patientNameById: Record<number, string> = {};
  let initialError: string | null = null;

  if (accessToken && (status || billingDate)) {
    try {
      const [bills, patients] = await Promise.all([
        fetchInitialBillingList(accessToken, {
          status,
          confirmedOnly,
          partialOnly,
          billingDate,
        }),
        fetchInitialPatients(accessToken),
      ]);

      initialBillingList = bills;
      patientNameById = patients.reduce<Record<number, string>>((acc, patient) => {
        if (patient.patientId && patient.name?.trim()) {
          acc[patient.patientId] = patient.name.trim();
        }
        return acc;
      }, {});
    } catch (error) {
      initialError =
        error instanceof Error ? error.message : "청구 목록 조회에 실패했습니다.";
    }
  }

  return (
    <BillingListClient
      status={status}
      confirmedOnly={confirmedOnly}
      partialOnly={partialOnly}
      billingDate={billingDate}
      initialBillingList={initialBillingList}
      patientNameById={patientNameById}
      initialError={initialError}
    />
  );
}
