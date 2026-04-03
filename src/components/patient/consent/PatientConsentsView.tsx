"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type { Consent } from "@/features/consent/consentTypes";
import type { ConsentLatest, ConsentWithdrawHistory } from "@/lib/patient/consentApi";
import { formatDateTime } from "./consentUtils";

type Props = {
  typeNameByCode: Record<string, string>;

  consentLoading: boolean;
  consentError: string | null;
  consents: Consent[];
  onEditConsent: (item: Consent) => void;
  onDeleteConsent: (item: Consent) => void;

  latestLoading: boolean;
  latestError: string | null;
  latestList: ConsentLatest[];

  withdrawLoading: boolean;
  withdrawError: string | null;
  withdrawList: ConsentWithdrawHistory[];

  typeError: string | null;
  onOpenTypeDialog: () => void;
};

export default function PatientConsentsView(props: Props) {
  const {
    typeNameByCode,
    consentLoading,
    consentError,
    consents,
    onEditConsent,
    onDeleteConsent,
    latestLoading,
    latestError,
    latestList,
    withdrawLoading,
    withdrawError,
    withdrawList,
    typeError,
    onOpenTypeDialog,
  } = props;

  const typeName = (code: string) => typeNameByCode[code] ?? code;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1 }}
          >
            <Typography fontWeight={900}>동의서</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={onOpenTypeDialog}>
                유형 관리
              </Button>
            </Stack>
          </Stack>

          {consentError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {consentError}
            </Typography>
          )}
          {typeError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {typeError}
            </Typography>
          )}
          {latestError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {latestError}
            </Typography>
          )}
          {withdrawError && (
            <Typography color="error" fontWeight={900} sx={{ mb: 1 }}>
              {withdrawError}
            </Typography>
          )}

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary">
              최신 동의 상태:
            </Typography>
            {latestLoading && (
              <Typography variant="body2" color="text.secondary">
                로딩 중...
              </Typography>
            )}
            {!latestLoading && latestList.length === 0 && <Chip size="small" label="없음" />}
            {!latestLoading &&
              latestList.map((item) => (
                <Chip
                  key={item.consentId}
                  size="small"
                  label={`${typeName(item.consentType)}: ${item.activeYn ? "활성" : "비활성"}`}
                  color={item.activeYn ? "success" : "default"}
                />
              ))}
          </Stack>

          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>유형</TableCell>
                <TableCell>동의일시</TableCell>
                <TableCell>철회일시</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>비고</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consentLoading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!consentLoading && consents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">등록된 동의서가 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {consents.map((item) => (
                <TableRow key={item.consentId} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{typeName(item.consentType)}</TableCell>
                  <TableCell>{formatDateTime(item.agreedAt)}</TableCell>
                  <TableCell>{formatDateTime(item.withdrawnAt)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={item.activeYn ? "활성" : "비활성"}
                      color={item.activeYn ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell>{item.note ?? "-"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => onEditConsent(item)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteConsent(item)}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mt: 2,
          borderRadius: 4,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <CardContent>
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            동의 철회 이력
          </Typography>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f4f7fb" }}>
              <TableRow
                sx={{
                  "& th": {
                    fontWeight: 800,
                    color: "#425366",
                    borderBottom: "1px solid var(--line)",
                  },
                }}
              >
                <TableCell>유형</TableCell>
                <TableCell>철회일시</TableCell>
                <TableCell>처리자</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawLoading && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">로딩 중...</Typography>
                  </TableCell>
                </TableRow>
              )}

              {!withdrawLoading && withdrawList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">철회 이력이 없습니다.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {withdrawList.map((item) => (
                <TableRow key={item.historyId} hover>
                  <TableCell>{typeName(item.consentType)}</TableCell>
                  <TableCell>{formatDateTime(item.withdrawnAt)}</TableCell>
                  <TableCell>{item.changedBy ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

