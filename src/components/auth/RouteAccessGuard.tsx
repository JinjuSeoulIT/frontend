"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { MenuNode } from "@/types/menu";
import { evaluateMenuRouteAccess } from "@/lib/auth/menuRouteAccess";

type RouteAccessGuardProps = {
  menus: MenuNode[];
  children: React.ReactNode;
};

declare global {
  interface Window {
    __lastDeniedRoutePath?: string;
  }
}

export default function RouteAccessGuard({
  menus,
  children,
}: RouteAccessGuardProps) {
  const pathname = usePathname() || "/";
  const accessDecision = React.useMemo(
    () => evaluateMenuRouteAccess(menus, pathname),
    [menus, pathname]
  );

  React.useEffect(() => {
    if (accessDecision.kind !== "blocked") {
      return;
    }

    if (window.__lastDeniedRoutePath !== pathname) {
      window.__lastDeniedRoutePath = pathname;
      window.alert("접근 권한이 없는 메뉴입니다.");
    }

    window.location.replace("/");
  }, [accessDecision.kind, pathname]);

  if (accessDecision.kind === "blocked") {
    return null;
  }

  return <>{children}</>;
}
