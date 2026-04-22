"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Box, Button } from "@mui/material";
import TestResultDetail from "@/components/medical_support/testResult/TestResultDetail";

function buildClinicalReturnHref(sp: Pick<URLSearchParams, "get">): string | null {
  const rawPid = sp.get("returnPatientId")?.trim();
  if (!rawPid) return null;
  const pid = Number(rawPid);
  if (!Number.isFinite(pid)) return null;
  const q = new URLSearchParams({ patientId: String(pid) });
  const rawRid = sp.get("returnReceptionId")?.trim();
  if (rawRid) {
    const rid = Number(rawRid);
    if (Number.isFinite(rid)) q.set("receptionId", String(rid));
  }
  return `/clinical?${q.toString()}`;
}

export function ClinicalTestResultDetailChrome() {
  const searchParams = useSearchParams();
  const viewOnly = searchParams.get("viewOnly") === "1";
  const clinicalHref = viewOnly ? buildClinicalReturnHref(searchParams) : null;

  return (
    <Box>
      {clinicalHref ? (
        <Box sx={{ maxWidth: 1100, mx: "auto", px: 3, pt: 3, pb: 0 }}>
          <Button
            component={Link}
            href={clinicalHref}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 600, textTransform: "none" }}
          >
            뒤로가기
          </Button>
        </Box>
      ) : null}
      <TestResultDetail />
    </Box>
  );
}
