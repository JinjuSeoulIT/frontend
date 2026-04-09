"use client";

import Link from "next/link";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function FeaturePlaceholder({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: FeaturePlaceholderProps) {
  return (
    <Box sx={{ maxWidth: 640, mx: "auto", px: 2, py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 3, border: "1px solid #dbe5f5" }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={800}>
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={Link} href={primaryHref} variant="contained">
              {primaryLabel}
            </Button>
            {secondaryHref && secondaryLabel ? (
              <Button component={Link} href={secondaryHref} variant="outlined">
                {secondaryLabel}
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
