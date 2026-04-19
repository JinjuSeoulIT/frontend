"use client";

import * as React from "react";
import type { MenuNode } from "@/types/menu";

type MenuContextValue = {
  menus: MenuNode[];
  setMenus: React.Dispatch<React.SetStateAction<MenuNode[]>>;
};

const MenuContext = React.createContext<MenuContextValue | null>(null);

export function MenuProvider({
  initialMenus,
  children,
}: {
  initialMenus: MenuNode[];
  children: React.ReactNode;
}) {
  const [menus, setMenus] = React.useState<MenuNode[]>(initialMenus);

  return <MenuContext.Provider value={{ menus, setMenus }}>{children}</MenuContext.Provider>;
}

export const useMenus = () => React.useContext(MenuContext)?.menus ?? [];

export const useSetMenus = () => React.useContext(MenuContext)?.setMenus;

