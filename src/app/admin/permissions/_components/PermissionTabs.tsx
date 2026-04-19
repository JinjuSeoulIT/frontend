"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tab, Tabs } from "@mui/material";

const ITEMS = [
  { href: "/admin/permissions/menu", label: "메뉴 관리" },
  { href: "/admin/permissions/role-menu", label: "역할별 메뉴 권한 관리" },
] as const;

export default function PermissionTabs() {
  const pathname = usePathname();
  const currentValue =
    ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.href ??
    ITEMS[0].href;

  return (
    <Tabs
      value={currentValue}
      textColor="primary"
      indicatorColor="primary"
      sx={{
        minHeight: 40,
        borderBottom: "1px solid rgba(15, 32, 48, 0.12)",
        "& .MuiTab-root": {
          minHeight: 40,
          px: 1.5,
          py: 1,
          fontSize: 14,
          fontWeight: 700,
          textTransform: "none",
          alignItems: "flex-start",
        },
      }}
    >
      {ITEMS.map((item) => (
        <Tab key={item.href} component={Link} href={item.href} value={item.href} label={item.label} />
      ))}
    </Tabs>
  );
}
