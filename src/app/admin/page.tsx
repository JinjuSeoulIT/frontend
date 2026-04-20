"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import MainLayout from "@/components/layout/MainLayout";
import { useMenus } from "@/components/layout/MenuContext";
import { normalizeMenuPath } from "@/lib/navigation/menuPath";
import type { MenuNode } from "@/types/menu";

const MAX_MENU_DEPTH = 12;

const collectAllowedPaths = (
  menus: MenuNode[],
  depth = 0,
  ancestorIds: Set<number> = new Set()
): string[] => {
  if (depth > MAX_MENU_DEPTH) {
    return [];
  }

  const paths: string[] = [];
  for (const menu of menus) {
    const hasKnownId = Number.isFinite(menu.id) && menu.id > 0;
    if (hasKnownId && ancestorIds.has(menu.id)) {
      continue;
    }

    const normalizedPath = normalizeMenuPath(menu.path);
    if (menu.isActive !== "N" && normalizedPath) {
      paths.push(normalizedPath);
    }

    if (menu.children?.length) {
      const nextAncestors = new Set(ancestorIds);
      if (hasKnownId) {
        nextAncestors.add(menu.id);
      }
      paths.push(...collectAllowedPaths(menu.children, depth + 1, nextAncestors));
    }
  }

  return paths;
};

export default function AdminPage() {
  const menus = useMenus();
  const allowedPaths = React.useMemo(() => new Set(collectAllowedPaths(menus)), [menus]);

  const actions = [
    { href: "/admin/codes", label: "코드 관리", variant: "contained" as const },
    { href: "/admin/permissions", label: "메뉴 관리", variant: "outlined" as const },
  ].filter((action) => allowedPaths.has(action.href));

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h5" fontWeight={900}>
                관리자 대시보드
              </Typography>
              <Typography color="text.secondary">
                운영과 설정 관련 관리자 페이지입니다. 코드 관리와 메뉴 관리 화면으로 이동할 수 있습니다.
              </Typography>
              {actions.length > 0 ? (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  {actions.map((action) => (
                    <Box key={action.href}>
                      <Button variant={action.variant} component={Link} href={action.href}>
                        {action.label}
                      </Button>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  현재 접근 가능한 관리자 하위 메뉴가 없습니다.
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
