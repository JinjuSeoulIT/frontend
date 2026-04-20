export type NotificationLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  createdAt: string;
  read: boolean;
  source: string | null;
  eventType: string | null;
};

const levelSet = new Set<NotificationLevel>(["INFO", "SUCCESS", "WARNING", "ERROR"]);

const toNotificationLevel = (value: unknown): NotificationLevel => {
  if (typeof value !== "string") return "INFO";
  const upper = value.trim().toUpperCase();
  if (levelSet.has(upper as NotificationLevel)) {
    return upper as NotificationLevel;
  }
  if (upper === "WARN") return "WARNING";
  return "INFO";
};

const toStringValue = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toBoolean = (value: unknown): boolean => value === true || value === 1 || value === "1";

const toIsoDate = (value: unknown): string => {
  const stringValue = toStringValue(value);
  if (!stringValue) return new Date().toISOString();
  const parsed = new Date(stringValue);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const createFallbackId = () =>
  `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const readRecord = (raw: unknown): Record<string, unknown> | null =>
  raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;

export const normalizeNotificationItem = (raw: unknown): NotificationItem | null => {
  const record = readRecord(raw);
  if (!record) return null;

  const id =
    toStringValue(record.id) ??
    toStringValue(record.notificationId) ??
    toStringValue(record.eventId) ??
    createFallbackId();

  const title =
    toStringValue(record.title) ??
    toStringValue(record.subject) ??
    toStringValue(record.type) ??
    "알림";

  const message =
    toStringValue(record.message) ??
    toStringValue(record.content) ??
    toStringValue(record.body) ??
    "";

  const createdAt = toIsoDate(record.createdAt ?? record.timestamp ?? record.occurredAt ?? record.publishedAt);

  return {
    id,
    title,
    message,
    level: toNotificationLevel(record.level ?? record.severity ?? record.type),
    createdAt,
    read: toBoolean(record.read ?? record.isRead),
    source: toStringValue(record.source ?? record.topic),
    eventType: toStringValue(record.eventType ?? record.category ?? record.type),
  };
};
