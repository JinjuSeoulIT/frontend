import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { NOTIFICATION_API_BASE_URL } from "@/lib/common/env";
import { normalizeNotificationItem, type NotificationItem } from "@/lib/notification/types";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  result?: T;
};

const api = axios.create({
  baseURL: NOTIFICATION_API_BASE_URL,
});

applyAuthInterceptors(api);

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.content)) return record.content;
  }
  return [];
};

export const fetchNotificationHistoryApi = async (limit = 20): Promise<NotificationItem[]> => {
  const response = await api.get<ApiEnvelope<unknown>>("/api/notifications", {
    params: { limit },
  });

  const payload = response.data?.result ?? response.data;
  return asArray(payload)
    .map((item) => normalizeNotificationItem(item))
    .filter((item): item is NotificationItem => item !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};
