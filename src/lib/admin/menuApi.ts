import axios from "axios";
import type { MenuNode } from "@/types/menu";
import { MENU_API_BASE_URL } from "@/lib/common/env";

const api = axios.create({
  baseURL: MENU_API_BASE_URL,
});

export const fetchMenusApi = async (): Promise<MenuNode[]> => {
  const res = await api.get<MenuNode[]>("/api/menus");
  return res.data;
};
