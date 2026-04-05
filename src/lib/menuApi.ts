import axios from "axios";
import type { MenuNode } from "../types/menu";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_MENU_API_BASE_URL ??
    process.env.NEXT_PUBLIC_PATIENTS_API_BASE_URL ??
    "http://192.168.1.55:8181",
});

export const fetchMenusApi = async (): Promise<MenuNode[]> => {
  const res = await api.get<MenuNode[]>("/api/menus");
  return res.data;
};


// 좌측 사이드바 메뉴 데이터를 가져오는 API 유틸
