"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ListIcon from "@mui/icons-material/List";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PolicyIcon from "@mui/icons-material/Policy";
import TaskAltIcon from "@mui/icons-material/TaskAlt";


import type { MenuNode } from "@/types/menu";
import { fetchMenusApi } from "@/lib/admin/menuApi";

const iconMap: Record<string, React.ReactNode> = {
  Home: <HomeRoundedIcon fontSize="small" />,
  People: <PersonRoundedIcon fontSize="small" />,
  MedicalServices: <LocalHospitalOutlinedIcon fontSize="small" />,
  Description: <DescriptionOutlinedIcon fontSize="small" />,
  FactCheck: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
  List: <ListIcon fontSize="small" />,
  PersonAdd: <PersonAddIcon fontSize="small" />,
  Policy: <PolicyIcon fontSize="small" />,
  TaskAlt: <TaskAltIcon fontSize="small" />,
};

const legacyPathMap: Record<string, string> = {
  "/reception": "/reception/dashboard",
  "/reception/reservations": "/reservations",
  "/reception/emergency": "/emergency-receptions",
  "/reception/inpatient": "/inpatient-receptions",
  "/reception/history": "/receptions/canceled",

  // reception legacy -> current routes
  "/receptions": "/reception/outpatient/list",
  "/reservations": "/reception/reservation/list",
  "/emergency-receptions": "/reception/emergency/list",
  "/inpatient-receptions": "/reception/inpatient/list",
  "/receptions/canceled": "/reception/dashboard",
  "/reception/edi-items": "/reception/dashboard",

  // patient legacy -> current routes
  "/consents": "/patient/consent/list",
  "/insurances": "/patient/insurance/list",
  "/patients": "/patient/list",

  // clinical/support legacy -> current routes
  "/doctor": "/clinical",
  "/doctor/encounters": "/clinical",
  "/nurse/reception": "/medical_support/dashboard",
  "/nurse/support": "/medical_support/dashboard",
  "/display": "/clinical",

  // staff/admin legacy -> current routes
  "/staff/setting": "/staff/dept",

  // board placeholders
  "/board": "/admin",
  "/board/notices": "/admin",
  "/board/schedule": "/admin",
  "/board/events": "/admin",
  "/board/docs": "/admin",
  "/board/leave": "/admin",
  "/board/shifts": "/admin",
  "/board/shifts/weekly": "/admin",
  "/board/shifts/daily": "/admin",
  "/board/training": "/admin",
  "/board/handover": "/admin",
  "/board/meetings": "/admin",
};

const normalizeMenuPath = (path?: string | null) => {
  if (!path) return path;
  let next = path;
  const visited = new Set<string>();

  while (legacyPathMap[next] && !visited.has(next)) {
    visited.add(next);
    next = legacyPathMap[next];
  }

  return next;
};

type SidebarProps = {
  width?: number;
  collapsed: boolean;
  hovered: boolean;
  onToggle: () => void;
};

export default function Sidebar({
  width = 240,
  collapsed,
  hovered,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();

  const [menus, setMenus] = React.useState<MenuNode[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [openMap, setOpenMap] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchMenusApi();
        if (mounted) {
          setMenus(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const itemSx = {
    borderRadius: 2,
    mb: 0.75,
    px: 1.5,
    py: 1,
    color: "#1f2a36",
    justifyContent: collapsed ? "center" : "flex-start",
    "&:hover": {
      bgcolor: "rgba(11, 91, 143, 0.08)",
    },
    "& .MuiListItemIcon-root": {
      color: "var(--brand)",
      minWidth: 36,
    },
  } as const;

  const isPathActive = React.useCallback(
    (path?: string | null, allowPrefix?: boolean) =>
      !!path &&
      (pathname === normalizeMenuPath(path) ||
        (allowPrefix && pathname.startsWith(`${normalizeMenuPath(path)}/`))),
    [pathname]
  );

  const isNodeActive = React.useCallback(
    (node: MenuNode) => isPathActive(node.path, !!node.children?.length),
    [isPathActive]
  );

  React.useEffect(() => {
    if (!menus.length) return;

    const nextOpen: Record<number, boolean> = {};

    const markParents = (nodes: MenuNode[], parents: number[] = []) => {
      for (const node of nodes) {
        const nextParents = [...parents, node.id];
        const isActive = isNodeActive(node);

        if (isActive) {
          for (const pid of parents) {
            nextOpen[pid] = true;
          }
        }

        if (node.children?.length) {
          markParents(node.children, nextParents);
        }
      }
    };

    markParents(menus);
    setOpenMap((prev) => ({ ...prev, ...nextOpen }));
  }, [isNodeActive, menus, pathname]);

  const hasActiveChild = (node: MenuNode): boolean =>
    node.children?.some((child) => isNodeActive(child) || hasActiveChild(child)) ??
    false;

  const toggle = (id: number) => {
    if (collapsed) return;
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: MenuNode, depth: number) => {
    const hasChildren = !!node.children?.length;
    const isActive = isNodeActive(node);
    const isGroupActive = hasChildren && hasActiveChild(node);
    const isOpen = !!openMap[node.id];
    const isLeafNoPath = !node.path && !hasChildren;
    const paddingLeft = collapsed ? 1 : 1.5 + depth * 2;

    const icon =
      depth === 0 && node.icon && iconMap[node.icon]
        ? iconMap[node.icon]
        : depth > 0
        ? <FiberManualRecordIcon sx={{ fontSize: 8 }} />
        : null;

    const commonButtonSx = {
      ...itemSx,
      pl: paddingLeft,
      py: depth === 0 ? 1 : 0.75,
      mb: depth === 0 ? 0.75 : 0.5,
      opacity: isLeafNoPath ? 0.6 : 1,
      minHeight: depth === 0 ? 44 : 36,
      "&.Mui-selected": {
        bgcolor: "rgba(11, 91, 143, 0.12)",
        borderLeft: collapsed ? "none" : "3px solid var(--brand)",
      },
    };

    const content = (
      <>
        <ListItemIcon
          sx={{
            minWidth: collapsed ? 0 : depth === 0 ? 36 : 26,
            mr: collapsed ? 0 : 1,
            justifyContent: "center",
            color: depth === 0 ? "var(--brand)" : "rgba(43,58,69,0.60)",
          }}
        >
          {icon}
        </ListItemIcon>

        {!collapsed && (
          <ListItemText
            primary={node.name}
            primaryTypographyProps={{
              fontWeight:
                isActive || isGroupActive ? 800 : depth === 0 ? 700 : 600,
              fontSize: depth === 0 ? 14 : 13,
              noWrap: true,
            }}
          />
        )}

        {hasChildren && !collapsed
          ? isOpen
            ? <ExpandLessIcon fontSize="small" />
            : <ExpandMoreIcon fontSize="small" />
          : null}
      </>
    );

    const wrappedContent = collapsed ? (
      <Tooltip title={node.name} placement="right" arrow>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {content}
        </Box>
      </Tooltip>
    ) : (
      content
    );

    const groupButton = (
      <ListItemButton
        onClick={() => {
          if (hasChildren) {
            toggle(node.id);
            return;
          }

          if (isLeafNoPath) {
            alert("환자 선택 후에만 가능합니다.");
          }
        }}
        disabled={isLeafNoPath}
        selected={isActive || isGroupActive}
        sx={commonButtonSx}
      >
        {wrappedContent}
      </ListItemButton>
    );

    return (
      <React.Fragment key={node.id}>
        {node.path && !hasChildren ? (
          <ListItemButton
            component={Link}
            href={normalizeMenuPath(node.path) ?? "#"}
            selected={isActive}
            sx={{
              ...commonButtonSx,
              "&.Mui-selected": {
                bgcolor: "rgba(11, 91, 143, 0.12)",
                borderLeft: collapsed ? "none" : "3px solid var(--brand)",
              },
            }}
          >
            {wrappedContent}
          </ListItemButton>
        ) : (
          groupButton
        )}

        {hasChildren && !collapsed ? (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </List>
          </Collapse>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        px: collapsed ? 1 : 1.5,
        py: 1.5,
        width,
        bgcolor: "rgba(255,255,255,0.96)",
        borderRight: "1px solid rgba(15, 32, 48, 0.08)",
        height: "100%",
        backdropFilter: "blur(10px)",
        transition: "width 0.25s ease, padding 0.25s ease",
      }}
    >
      <IconButton
        onClick={onToggle}
        size="small"
        sx={{
          position: "absolute",
          top: "50%",
          right: -14,
          transform: "translateY(-50%)",
          zIndex: 1200,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          transition: "opacity 0.2s ease",
          backgroundColor: "#ffffff",
          border: "1px solid rgba(15, 32, 48, 0.12)",
          boxShadow: "0 4px 12px rgba(15, 32, 48, 0.12)",
          "&:hover": {
            backgroundColor: "#f8fafc",
          },
        }}
      >
        {collapsed ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
      </IconButton>

      <Box
        sx={{
          px: collapsed ? 0.5 : 1,
          pb: 1.5,
          minHeight: collapsed ? 16 : 52,
          transition: "all 0.25s ease",
        }}
      >
        {!collapsed && (
          <>
            <Typography
              variant="overline"
              sx={{ color: "var(--muted)", letterSpacing: 1 }}
            >
              HOSPITAL CORE
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 16,
                color: "var(--brand-strong)",
              }}
            >
              병원 운영 메뉴
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: collapsed ? 0 : 0.5 }}>
        {loading ? (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List disablePadding>
            {menus.map((node) => renderNode(node, 0))}
          </List>
        )}
      </Box>

      {!collapsed && (
        <Box sx={{ mt: 2, pt: 1.5 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.65)",
              border: "1px solid var(--line)",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={800}
              color="text.secondary"
            >
              * 모듈 확장은 Sprint에서 진행
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}