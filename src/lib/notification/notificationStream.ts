import { normalizeNotificationItem, type NotificationItem } from "@/lib/notification/types";

type NotificationStreamHandlers = {
  onOpen?: () => void;
  onMessage: (item: NotificationItem) => void;
  onError?: (error: unknown) => void;
};

const tryEmit = (raw: string, onMessage: (item: NotificationItem) => void) => {
  const trimmed = raw.trim();
  if (!trimmed) return;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      for (const row of parsed) {
        const item = normalizeNotificationItem(row);
        if (item) onMessage(item);
      }
      return;
    }

    const item = normalizeNotificationItem(parsed);
    if (item) {
      onMessage(item);
      return;
    }

    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      const nested = record.result ?? record.data ?? record.payload;
      if (Array.isArray(nested)) {
        for (const row of nested) {
          const nestedItem = normalizeNotificationItem(row);
          if (nestedItem) onMessage(nestedItem);
        }
      } else {
        const nestedItem = normalizeNotificationItem(nested);
        if (nestedItem) onMessage(nestedItem);
      }
    }
  } catch {
    // ignore non-json keepalive payload
  }
};

export const subscribeNotificationStream = ({ onOpen, onMessage, onError }: NotificationStreamHandlers) => {
  const source = new EventSource("/api/notifications/stream", { withCredentials: true });

  source.onopen = () => {
    onOpen?.();
  };

  source.onmessage = (event) => {
    tryEmit(event.data, onMessage);
  };

  source.addEventListener("notification", (event) => {
    const messageEvent = event as MessageEvent<string>;
    tryEmit(messageEvent.data, onMessage);
  });

  source.onerror = (event) => {
    onError?.(event);
  };

  return () => {
    source.close();
  };
};
