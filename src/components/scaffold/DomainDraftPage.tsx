"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Box, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

type KPI = {
  label: string;
  value: string;
};

type Section = {
  title: string;
  description?: string;
  columns?: string[];
  rows?: string[][];
};

type DomainDraftPageProps = {
  title: string;
  subtitle?: string;
  tags?: string[];
  kpis?: KPI[];
  sections?: Section[];
};

export default function DomainDraftPage({
  title,
  subtitle,
  tags = [],
  kpis = [],
  sections = [],
}: DomainDraftPageProps) {
  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={900}>{title}</Typography>
          {subtitle && <Typography sx={{ color: "text.secondary", mt: 0.5 }}>{subtitle}</Typography>}
          {tags.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
              {tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Stack>
          )}
        </Box>

        {kpis.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 1.5 }}>
            {kpis.map((kpi) => (
              <Card key={`${kpi.label}:${kpi.value}`}>
                <CardContent>
                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{kpi.label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 24 }}>{kpi.value}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {sections.map((section) => (
          <Card key={section.title}>
            <CardContent>
              <Typography sx={{ fontWeight: 800, mb: 0.5 }}>{section.title}</Typography>
              {section.description && (
                <Typography sx={{ color: "text.secondary", mb: 1.5 }}>{section.description}</Typography>
              )}
              {section.columns && section.columns.length > 0 && section.rows && section.rows.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {section.columns.map((column) => (
                        <TableCell key={column}>{column}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {section.rows.map((row, rowIndex) => (
                      <TableRow key={`${section.title}:${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={`${section.title}:${rowIndex}:${cellIndex}`}>{cell}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography sx={{ color: "text.secondary" }}>No data</Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </MainLayout>
  );
}
