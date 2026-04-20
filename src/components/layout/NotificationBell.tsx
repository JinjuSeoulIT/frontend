"use client";

import * as React from "react";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { fetchNotificationHistoryApi } from "@/lib/notification/notificationApi";
import { subscribeNotificationStream } from "@/lib/notification/notificationStream";
import {
  getEffectiveSessionRole,
  getSessionChangedEventName,
  getSessionUser,
  type SessionUser,
} from "@/lib/auth/session";
import { isNotificationVisibleForRole } from "@/lib/notification/routingPolicy";
import type { NotificationItem, NotificationLevel } from "@/lib/notification/types";

const MAX_ITEMS = 20;

const levelColorMap: Record<NotificationLevel, string> = {
  INFO: "#4dabf5",
  SUCCESS: "#34d399",
  WARNING: "#f59e0b",
  ERROR: "#f87171",
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const upsertLatest = (prev: NotificationItem[], item: NotificationItem) => {
  const withoutCurrent = prev.filter((row) => row.id !== item.id);
  return [item, ...withoutCurrent]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_ITEMS);
};

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(null);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const sessionRole = React.useMemo(() => getEffectiveSessionRole(sessionUser), [sessionUser]);

  React.useEffect(() => {
    const syncRole = () => {
      setSessionUser(getSessionUser());
    };
    syncRole();

    const eventName = getSessionChangedEventName();
    window.addEventListener(eventName, syncRole);
    return () => window.removeEventListener(eventName, syncRole);
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const items = await fetchNotificationHistoryApi(MAX_ITEMS);
        if (!mounted) return;
        setNotifications(items);
      } catch {
        // history endpoint may not be prepared yet
      }
    };

    void loadHistory();

    const unsubscribe = subscribeNotificationStream({
      onOpen: () => {
        if (mounted) setConnected(true);
      },
      onMessage: (item) => {
        if (!mounted) return;
        setNotifications((prev) => upsertLatest(prev, { ...item, read: false }));
      },
      onError: () => {
        if (mounted) setConnected(false);
      },
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const open = Boolean(anchorEl);
  const visibleNotifications = React.useMemo(
    () => notifications.filter((item) => isNotificationVisibleForRole(sessionRole, item)),
    [notifications, sessionRole]
  );
  const unreadCount = visibleNotifications.filter((item) => !item.read).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="notification"
        sx={{
          color: "#dbe8ff",
          border: "1px solid rgba(219, 232, 255, 0.25)",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Paper sx={{ width: 360, maxHeight: 460, overflow: "hidden" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>알림</Typography>
            <Stack direction="row" spacing={0.6} alignItems="center">
              <FiberManualRecordIcon sx={{ fontSize: 10, color: connected ? "#22c55e" : "#9ca3af" }} />
              <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                {connected ? "실시간 연결됨" : "연결 대기중"}
              </Typography>
            </Stack>
          </Stack>
          <Divider />

          {visibleNotifications.length === 0 ? (
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>도착한 알림이 없습니다.</Typography>
            </Box>
          ) : (
            <List disablePadding sx={{ maxHeight: 400, overflowY: "auto" }}>
              {visibleNotifications.map((item) => (
                <ListItem key={item.id} alignItems="flex-start" sx={{ gap: 1.2, py: 1.5 }}>
                  <Box
                    sx={{
                      mt: 0.5,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: levelColorMap[item.level],
                      flex: "0 0 auto",
                    }}
                  />
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{item.title}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>
                          {formatDateTime(item.createdAt)}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography sx={{ color: "text.secondary", fontSize: 12.5, mt: 0.4, whiteSpace: "pre-wrap" }}>
                        {item.message || "새 알림이 도착했습니다."}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Popover>
    </>
  );
}
