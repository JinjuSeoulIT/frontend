"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

export type ExamDetailField = {
  label: string;
  value: ReactNode;
};

export type ExamDetailSection = {
  title: string;
  fields: ExamDetailField[];
};

type ExamDetailDialogProps = {
  open: boolean;
  title: string;
  sections: ExamDetailSection[];
  editHref: string;
  onClose: () => void;
};

export default function ExamDetailDialog({
  open,
  title,
  sections,
  editHref,
  onClose,
}: ExamDetailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {sections.map((section, index) => (
            <Box key={section.title}>
              <Typography variant="subtitle2" fontWeight={700}>
                {section.title}
              </Typography>

              <Box
                sx={{
                  mt: 1.5,
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                }}
              >
                {section.fields.map((field) => (
                  <Box key={`${section.title}-${field.label}`} sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      {field.label}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {typeof field.value === "string" ||
                      typeof field.value === "number" ? (
                        <Typography
                          sx={{
                            fontWeight: 600,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {field.value}
                        </Typography>
                      ) : (
                        field.value
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              {index < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button
          component={Link}
          href={editHref}
          variant="contained"
          startIcon={<EditOutlinedIcon />}
        >
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}
