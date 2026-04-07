import axios from "axios";
import type { MenuNode } from "@/types/menu";
import { MENU_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

type MenuResponse = {
  menuId: number;
  parentMenuId: number | null;
  menuCode: string;
  menuName: string;
  menuPath: string | null;
  sortOrder: number | null;
  children?: MenuResponse[];
};

const api = axios.create({
  baseURL: MENU_API_BASE_URL,
});

const normalizeMenuNode = (menu: MenuResponse): MenuNode => ({
  id: menu.menuId,
  code: menu.menuCode,
  name: menu.menuName,
  path: menu.menuPath,
  icon: null,
  sortOrder: menu.sortOrder,
  children: (menu.children ?? []).map(normalizeMenuNode),
});

export const fetchMenusApi = async (): Promise<MenuNode[]> => {
  const res = await api.get<ApiResponse<MenuResponse[]>>("/api/menus");
  return (res.data.result ?? []).map(normalizeMenuNode);
};