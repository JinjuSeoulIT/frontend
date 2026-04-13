"use client";

import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  cancelClinicalOrderApi,
  type ClinicalOrder,
  type LabOrderType,
} from "@/lib/clinical/clinicalOrderApi";
import type { ClinicalOrderDialogVariant } from "./dialogs/ClinicalOrderDialog";
import {
  ClinicalOrderResultDialog,
  type OrderResultCategory,
} from "./dialogs/ClinicalOrderResultDialog";
import { ORDER_TYPE_LABELS, orderStatusView } from "./clinicalDocumentation";

const EXAM_ORDER_TYPES: LabOrderType[] = [
  "BLOOD",
  "IMAGING",
  "PATHOLOGY",
  "SPECIMEN",
  "ENDOSCOPY",
  "PHYSIOLOGICAL",
];

function partitionOrdersByCategory(orders: ClinicalOrder[]) {
  const exam: ClinicalOrder[] = [];
  const procedure: ClinicalOrder[] = [];
  const medication: ClinicalOrder[] = [];
  for (const o of orders) {
    if (EXAM_ORDER_TYPES.includes(o.orderType)) {
      exam.push(o);
    } else if (o.orderType === "PROCEDURE") {
      procedure.push(o);
    } else if (o.orderType === "MEDICATION") {
      medication.push(o);
    } else {
      exam.push(o);
    }
  }
  return { exam, procedure, medication };
}

function normalizedOrderStatus(s: string | null | undefined): string {
  const u = (s ?? "").trim().toUpperCase();
  if (u === "REQUEST") return "REQUESTED";
  return u || "REQUESTED";
}

function orderDisplayName(ord: ClinicalOrder): string {
  if (
    ord.orderName &&
    !(Object.keys(ORDER_TYPE_LABELS) as string[]).includes(ord.orderName)
  ) {
    return ord.orderName;
  }
  return ORDER_TYPE_LABELS[ord.orderType];
}

type Props = {
  now: Date;
  calendarYear: number;
  calendarMonth: number;
  calendarDays: (number | null)[];
  groupOrderText: string;
  onGroupOrderTextChange: (v: string) => void;
  chartTemplateText: string;
  onChartTemplateTextChange: (v: string) => void;
  orders: ClinicalOrder[];
  ordersLoading: boolean;
  visitId: number | null;
  updatingOrderId: number | null;
  onUpdatingOrderId: (id: number | null) => void;
  onOrdersRefresh: () => void;
  onOrdersReplace: (updater: (prev: ClinicalOrder[]) => ClinicalOrder[]) => void;
  onOpenOrderDialog: (variant: ClinicalOrderDialogVariant) => void;
  contextPatientName?: string | null;
};

export function ClinicalRightPanel({
  now,
  calendarYear,
  calendarMonth,
  calendarDays,
  groupOrderText,
  onGroupOrderTextChange,
  chartTemplateText,
  onChartTemplateTextChange,
  orders,
  ordersLoading,
  visitId,
  updatingOrderId,
  onUpdatingOrderId,
  onOrdersRefresh,
  onOrdersReplace,
  onOpenOrderDialog,
  contextPatientName,
}: Props) {
  const [orderTab, setOrderTab] = React.useState(0);
  const [resultDialog, setResultDialog] = React.useState<{
    order: ClinicalOrder;
    category: OrderResultCategory;
  } | null>(null);
  const { exam: examOrders, procedure: procedureOrders, medication: medicationOrders } =
    React.useMemo(() => partitionOrdersByCategory(orders), [orders]);
  const tabOrders = [examOrders, procedureOrders, medicationOrders][orderTab] ?? [];

  React.useEffect(() => {
    setOrderTab(0);
  }, [visitId]);

  const orderGridColumns = "4rem minmax(0, 1fr) auto minmax(6.75rem, auto)";

  const orderCategoryForTab = (): OrderResultCategory =>
    orderTab === 0 ? "exam" : orderTab === 1 ? "procedure" : "medication";

  const renderOrderList = (list: ClinicalOrder[], category: OrderResultCategory) => (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "#fff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: orderGridColumns,
          columnGap: 0.5,
          alignItems: "center",
          px: 1,
          py: 0.625,
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography component="span" sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary", lineHeight: 1.2 }}>
          분류
        </Typography>
        <Typography component="span" sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary", lineHeight: 1.2 }}>
          오더명
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary", lineHeight: 1.2, textAlign: "center" }}
        >
          상태
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary", lineHeight: 1.2, textAlign: "right" }}
        >
          작업
        </Typography>
      </Box>
      <Box sx={{ maxHeight: 200, overflow: "auto" }}>
        {list.length === 0 ? (
          <Box sx={{ py: 2.5, px: 1, textAlign: "center" }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>등록된 오더가 없습니다.</Typography>
          </Box>
        ) : (
          list.map((ord, idx) => {
            const st = normalizedOrderStatus(ord.status);
            const chip = orderStatusView(ord.status);
            const canCancel = visitId != null && st !== "COMPLETED" && st !== "CANCELLED";
            return (
              <Box
                key={ord.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: orderGridColumns,
                  columnGap: 0.5,
                  alignItems: "center",
                  px: 1,
                  py: 0.75,
                  borderTop: idx === 0 ? "none" : "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "text.secondary",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ORDER_TYPE_LABELS[ord.orderType]}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 11,
                    lineHeight: 1.35,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    wordBreak: "break-word",
                  }}
                >
                  {orderDisplayName(ord)}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Chip
                    size="small"
                    label={chip.label}
                    color={chip.color}
                    variant="outlined"
                    sx={{ height: 22, fontSize: 10, "& .MuiChip-label": { px: 0.75 } }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    flexWrap: "nowrap",
                    gap: 0,
                    minWidth: 0,
                  }}
                >
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    sx={{
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 0,
                      px: 0.4,
                      py: 0.25,
                      minHeight: 28,
                      lineHeight: 1.2,
                      textTransform: "none",
                    }}
                    onClick={() => setResultDialog({ order: ord, category })}
                  >
                    조회
                  </Button>
                  {canCancel ? (
                    <>
                      <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: "divider" }} />
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        disabled={updatingOrderId != null}
                        sx={{
                          fontSize: 10,
                          fontWeight: 600,
                          minWidth: 0,
                          px: 0.4,
                          py: 0.25,
                          minHeight: 28,
                          textTransform: "none",
                        }}
                        onClick={async () => {
                          if (visitId == null) return;
                          onUpdatingOrderId(ord.id);
                          try {
                            const updated = await cancelClinicalOrderApi(visitId, ord.id);
                            onOrdersReplace((prev) =>
                              prev.map((o) => (o.id === ord.id ? { ...o, status: updated.status } : o))
                            );
                          } catch (err) {
                            window.alert(err instanceof Error ? err.message : "오더 취소에 실패했습니다.");
                            onOrdersRefresh();
                          } finally {
                            onUpdatingOrderId(null);
                          }
                        }}
                      >
                        취소
                      </Button>
                    </>
                  ) : null}
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        borderLeft: "1px solid var(--line)",
        p: 1,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        bgcolor: "rgba(255,255,255,0.9)",
      }}
    >
      <Box>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
          <CalendarMonthOutlinedIcon fontSize="small" />
          <Typography fontWeight={700} sx={{ fontSize: 14 }}>
            {calendarYear}.{String(calendarMonth + 1).padStart(2, "0")}
          </Typography>
        </Stack>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5, textAlign: "center", fontSize: 11 }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <Typography key={d} sx={{ fontWeight: 700, color: "var(--muted)" }}>
              {d}
            </Typography>
          ))}
          {calendarDays.map((d, i) => (
            <Box
              key={i}
              sx={{
                py: 0.5,
                borderRadius: 0.5,
                bgcolor: d === now.getDate() ? "var(--brand)" : "transparent",
                color: d === now.getDate() ? "#fff" : "inherit",
                fontSize: 12,
              }}
            >
              {d ?? ""}
            </Box>
          ))}
        </Box>
      </Box>
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
          그룹오더
        </Typography>
        <TextField
          size="small"
          fullWidth
          placeholder="자주 쓰는 처방 묶음"
          value={groupOrderText}
          onChange={(e) => onGroupOrderTextChange(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
      </Box>
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.5 }}>
          차트템플릿
        </Typography>
        <TextField
          size="small"
          fullWidth
          multiline
          rows={3}
          placeholder="증상/진단/처방 템플릿"
          value={chartTemplateText}
          onChange={(e) => onChartTemplateTextChange(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff" } }}
        />
      </Box>
      <Box>
        <Typography fontWeight={700} sx={{ fontSize: 13, mb: 0.75 }}>
          오더 조회
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {ordersLoading ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary", py: 1 }}>조회 중…</Typography>
        ) : visitId == null ? (
          <Typography sx={{ fontSize: 12, color: "text.secondary", py: 0.5 }}>
            진료를 시작한 뒤 조회할 수 있습니다.
          </Typography>
        ) : (
          <>
            <Tabs
              value={orderTab}
              onChange={(_, v) => setOrderTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                minHeight: 34,
                mb: 1,
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTabs-indicator": { height: 2 },
                "& .MuiTab-root": {
                  minHeight: 34,
                  py: 0.5,
                  px: 1,
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "none",
                  minWidth: 72,
                },
              }}
            >
              <Tab label={`검사 ${examOrders.length}`} />
              <Tab label={`처치 ${procedureOrders.length}`} />
              <Tab label={`투약 ${medicationOrders.length}`} />
            </Tabs>
            {renderOrderList(tabOrders, orderCategoryForTab())}
          </>
        )}
        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            disabled={visitId == null}
            onClick={() => onOpenOrderDialog("exam")}
            sx={{ fontSize: 11, py: 0.5, minHeight: 34, textTransform: "none" }}
          >
            검사 오더
          </Button>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            disabled={visitId == null}
            onClick={() => onOpenOrderDialog("treatment")}
            sx={{ fontSize: 11, py: 0.5, minHeight: 34, textTransform: "none" }}
          >
            치료 오더
          </Button>
        </Stack>
      </Box>

      <ClinicalOrderResultDialog
        open={resultDialog != null}
        onClose={() => setResultDialog(null)}
        order={resultDialog?.order ?? null}
        category={resultDialog?.category ?? "exam"}
        patientName={contextPatientName}
        orderStatusNorm={resultDialog ? normalizedOrderStatus(resultDialog.order.status) : undefined}
      />
    </Box>
  );
}
