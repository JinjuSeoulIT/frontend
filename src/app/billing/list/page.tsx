import { cookies } from "next/headers";
import BillingListClient from "@/app/billing/list/BillingListClient";
import {
<<<<<<< HEAD
  Box,
  Typography,
  Stack,
  Chip,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
} from "@mui/material";
=======
  fetchInitialBillingList,
  type ServerBillSummary,
} from "@/lib/billing/billingServerApi";
import { fetchInitialPatients } from "@/lib/patient/patientServerApi";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/staff/staffServerApi";
>>>>>>> develop

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

<<<<<<< HEAD
  const [patientNameById, setPatientNameById] = useState<Record<number, string>>(
    {}
  );
  const [keyword, setKeyword] = useState("");
=======
  let initialBillingList: ServerBillSummary[] = [];
  let patientNameById: Record<number, string> = {};
  let initialError: string | null = null;
>>>>>>> develop

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

  const keywordNormalized = keyword.trim().toLowerCase();

  const searchedBillingList = filteredBillingList.filter((bill) => {
    if (!keywordNormalized) return true;

    const billingNoText = String(bill.billingNo ?? bill.billId).toLowerCase();
    const patientIdText = String(bill.patientId);
    const patientNameText = resolvePatientName(bill.patientId).toLowerCase();

    return (
      billingNoText.includes(keywordNormalized) ||
      patientIdText.includes(keywordNormalized) ||
      patientNameText.includes(keywordNormalized)
    );
  });

  return (
<<<<<<< HEAD
    <MainLayout>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => router.push("/billing")}
        >
          뒤로 가기
        </Button>

        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          청구 목록
        </Typography>
      </Box>

      <Box sx={{ display: "grid", gap: 3 }}>
        {/* [추가] 일일 중간 청구 빠른 조회 */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            빠른 조회:
          </Typography>

          <Chip
            label="오늘 일일 중간 청구"
            component={Link}
            href={buildListHref({
              billingDate: todayString,
            })}
            clickable
            color={billingDate === todayString ? "primary" : "default"}
            variant={billingDate === todayString ? "filled" : "outlined"}
          />

          {billingDate && (
            <Chip
              label="일일 필터 해제"
              component={Link}
              href={buildListHref({
                status,
                confirmedOnly,
                partialOnly,
              })}
              clickable
              color="default"
              variant="outlined"
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            상태 필터:
          </Typography>

          {STATUS_OPTIONS.map((option) => {
            const isActive =
              (option.key === "READY" &&
                status === "READY" &&
                !confirmedOnly &&
                !partialOnly) ||
              (option.key === "PARTIAL" &&
                status === "CONFIRMED" &&
                partialOnly) ||
              (option.key === "PAID" &&
                status === "PAID" &&
                !confirmedOnly &&
                !partialOnly) ||
              (option.key === "FINAL_CONFIRMED" &&
                status === "CONFIRMED" &&
                confirmedOnly) ||
              (option.key === "CANCELED" &&
                status === "CANCELED" &&
                !confirmedOnly &&
                !partialOnly);

            return (
              <Chip
                key={option.key}
                label={option.label}
                component={Link}
                href={option.href}
                clickable
                color={isActive ? "primary" : "default"}
                variant={isActive ? "filled" : "outlined"}
                sx={{ mb: 1 }}
              />
            );
          })}

          {!status && !billingDate && (
            <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
              상태를 선택하거나 오늘 일일 중간 청구를 눌러 조회할 수 있습니다.
            </Typography>
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            size="small"
            label="목록 검색"
            placeholder="청구번호 / 환자명 / 환자ID"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ minWidth: { md: 320 } }}
          />
          <Chip
            label={`표시 ${searchedBillingList.length}건 / 조건 ${filteredBillingList.length}건`}
            color="primary"
            variant="outlined"
          />
        </Stack>

        {(status || billingDate) && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1">현재 필터:</Typography>

            {billingDate && (
              <Chip
                label={`일일 조회 ${billingDate}`}
                color="secondary"
              />
            )}

            {status && (
              <Chip
                label={
                  confirmedOnly
                    ? "청구 확정"
                    : partialOnly
                    ? "부분 수납"
                    : getBillingStatusLabel(status)
                }
                color="primary"
              />
            )}
          </Stack>
        )}

        {loading && <Typography>로딩 중...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>청구번호</TableCell>
                <TableCell>환자명</TableCell>
                <TableCell>환자ID</TableCell>
                <TableCell>진료일</TableCell>
                <TableCell>총 금액</TableCell>
                <TableCell>상태</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {searchedBillingList.map((bill) => (
                <TableRow key={bill.billId}>
                  <TableCell>
                    <Link
                      href={`/billing/${bill.billId}`}
                      style={{
                        textDecoration: "none",
                        color: "#1976d2",
                        fontWeight: 600,
                      }}
                    >
                      {bill.billingNo ?? bill.billId}
                    </Link>
                  </TableCell>

                  <TableCell>{resolvePatientName(bill.patientId)}</TableCell>
                  <TableCell>{bill.patientId}</TableCell>
                  <TableCell>{bill.treatmentDate}</TableCell>
                  <TableCell>{bill.totalAmount.toLocaleString()} 원</TableCell>

                  <TableCell>
                    <Chip
                      label={getBillingStatusLabel(
                        bill.status,
                        bill.remainingAmount
                      )}
                      color={
                        getBillingStatusColor(
                          bill.status,
                          bill.remainingAmount
                        ) as any
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}

              {searchedBillingList.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    조회 결과가 없습니다
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </MainLayout>
=======
    <BillingListClient
      status={status}
      confirmedOnly={confirmedOnly}
      partialOnly={partialOnly}
      billingDate={billingDate}
      initialBillingList={initialBillingList}
      patientNameById={patientNameById}
      initialError={initialError}
    />
>>>>>>> develop
  );
}
