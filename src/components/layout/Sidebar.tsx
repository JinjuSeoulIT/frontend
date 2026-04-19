"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  CircularProgress,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ListIcon from "@mui/icons-material/List";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PolicyIcon from "@mui/icons-material/Policy";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import type { MenuNode } from "@/types/menu";
import { normalizeMenuPath } from "@/lib/navigation/menuPath";

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

const menuNameOverrides: Record<string, string> = {
  STAFF: "직원",
  STAFF_LIST: "직원관리",
  STAFF_DEPARTMENT: "부서 관리",
  STAFF_POSITION: "직책 관리",
};

const STAFF_SHORTCUT_MENUS: Omit<MenuNode, "id">[] = [
  { code: "STAFF_LIST", name: "직원관리", path: "/staff", icon: null, sortOrder: 1, children: [] },
  {
    code: "STAFF_DEPARTMENT",
    name: "부서 관리",
    path: "/staff/departments",
    icon: null,
    sortOrder: 2,
    children: [],
  },
  {
    code: "STAFF_POSITION",
    name: "직책 관리",
    path: "/staff/position",
    icon: null,
    sortOrder: 3,
    children: [],
  },
];

const HIDDEN_MENU_CODES = new Set(["STAFF_ROOT", "STAFF_DIRECTORY", "STAFF_PERMISSION_MANAGE"]);
const MAX_MENU_DEPTH = 12;

const stripHiddenMenus = (
  menus: MenuNode[],
  depth = 0,
  ancestorIds: Set<number> = new Set()
): MenuNode[] =>
  menus
    .filter((menu) => !HIDDEN_MENU_CODES.has(menu.code))
    .map((menu) => {
      const hasKnownId = Number.isFinite(menu.id) && menu.id > 0;
      const nextAncestors = new Set(ancestorIds);
      if (hasKnownId) {
        nextAncestors.add(menu.id);
      }

      const canDescend = depth < MAX_MENU_DEPTH && (!hasKnownId || !ancestorIds.has(menu.id));
      return {
        ...menu,
        children: canDescend ? stripHiddenMenus(menu.children ?? [], depth + 1, nextAncestors) : [],
      };
    });

const ensureStaffShortcuts = (menus: MenuNode[]) => {
  const hasPrimaryStaffRoot = menus.some((menu) => menu.code === "STAFF");
  if (!hasPrimaryStaffRoot) {
    return menus;
  }
  return menus.map((menu) =>
    menu.code !== "STAFF"
      ? menu
      : {
          ...menu,
          children: STAFF_SHORTCUT_MENUS.map((shortcut, index) => ({
            id: -9000 - index,
            ...shortcut,
          })),
        }
  );
};

type SidebarProps = {
  menus: MenuNode[];
  width?: number;
};

export default function Sidebar({ menus: initialMenus, width = 240 }: SidebarProps) {
  const pathname = usePathname();
  const [openMap, setOpenMap] = React.useState<Record<number, boolean>>({});
  const menus = React.useMemo(
    () => ensureStaffShortcuts(stripHiddenMenus(initialMenus)),
    [initialMenus]
  );
  const loading = false;
  const menuLoadError = false;

  const itemSx = {
    borderRadius: 2,
    mb: 0.75,
    px: 1.5,
    py: 1,
    color: "#1f2a36",
    justifyContent: "flex-start",
    "&:hover": { bgcolor: "rgba(11, 91, 143, 0.08)" },
    "& .MuiListItemIcon-root": { color: "var(--brand)", minWidth: 36 },
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
    if (!menus.length) {
      return;
    }
    const nextOpen: Record<number, boolean> = {};
    const markParents = (
      nodes: MenuNode[],
      parents: number[] = [],
      depth = 0,
      ancestorIds: Set<number> = new Set()
    ) => {
      if (depth > MAX_MENU_DEPTH) {
        return;
      }

      for (const node of nodes) {
        const hasKnownId = Number.isFinite(node.id) && node.id > 0;
        if (hasKnownId && ancestorIds.has(node.id)) {
          continue;
        }

        const isActive = isNodeActive(node);
        if (isActive) {
          for (const parentId of parents) {
            nextOpen[parentId] = true;
          }
        }
        if (node.children?.length) {
          const nextAncestors = new Set(ancestorIds);
          if (hasKnownId) {
            nextAncestors.add(node.id);
          }
          markParents(node.children, [...parents, node.id], depth + 1, nextAncestors);
        }
      }
    };
    markParents(menus);
    setOpenMap((prev) => ({ ...prev, ...nextOpen }));
  }, [isNodeActive, menus, pathname]);

  const hasActiveChild = (
    node: MenuNode,
    depth = 0,
    ancestorIds: Set<number> = new Set()
  ): boolean => {
    if (depth > MAX_MENU_DEPTH) {
      return false;
    }

    const hasKnownId = Number.isFinite(node.id) && node.id > 0;
    if (hasKnownId && ancestorIds.has(node.id)) {
      return false;
    }

    const nextAncestors = new Set(ancestorIds);
    if (hasKnownId) {
      nextAncestors.add(node.id);
    }

    return node.children?.some(
      (child) => isNodeActive(child) || hasActiveChild(child, depth + 1, nextAncestors)
    ) ?? false;
  };

  const toggle = (id: number) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (
    node: MenuNode,
    depth: number,
    ancestorIds: Set<number> = new Set()
  ): React.ReactNode => {
    if (depth > MAX_MENU_DEPTH) {
      return null;
    }

    const hasKnownId = Number.isFinite(node.id) && node.id > 0;
    if (hasKnownId && ancestorIds.has(node.id)) {
      return null;
    }

    const nextAncestors = new Set(ancestorIds);
    if (hasKnownId) {
      nextAncestors.add(node.id);
    }

    const hasChildren = !!node.children?.length;
    const isActive = isNodeActive(node);
    const isGroupActive = hasChildren && hasActiveChild(node, depth, ancestorIds);
    const isOpen = !!openMap[node.id];
    const isLeafNoPath = !node.path && !hasChildren;
    const paddingLeft = 1.5 + depth * 2;
    const menuLabel = menuNameOverrides[node.code] ?? node.name;

    const icon =
      depth === 0 && node.icon && iconMap[node.icon]
        ? iconMap[node.icon]
        : depth > 0
        ? <FiberManualRecordIcon sx={{ fontSize: 8 }} />
        : null;

    const content = (
      <>
        <ListItemIcon
          sx={{
            minWidth: depth === 0 ? 36 : 26,
            mr: 1,
            justifyContent: "center",
            color: depth === 0 ? "var(--brand)" : "rgba(43,58,69,0.60)",
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={menuLabel}
          primaryTypographyProps={{
            fontWeight: isActive || isGroupActive ? 800 : depth === 0 ? 700 : 600,
            fontSize: depth === 0 ? 14 : 13,
            noWrap: true,
          }}
        />
        {hasChildren ? (isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />) : null}
      </>
    );

    const commonButtonSx = {
      ...itemSx,
      pl: paddingLeft,
      py: depth === 0 ? 1 : 0.75,
      mb: depth === 0 ? 0.75 : 0.5,
      opacity: isLeafNoPath ? 0.6 : 1,
      minHeight: depth === 0 ? 44 : 36,
      "&.Mui-selected": {
        bgcolor: "rgba(11, 91, 143, 0.12)",
        borderLeft: "3px solid var(--brand)",
      },
    };

    const groupButton = (
      <ListItemButton
        onClick={() => {
          if (hasChildren) {
            toggle(node.id);
          }
        }}
        disabled={isLeafNoPath}
        selected={isActive || isGroupActive}
        sx={commonButtonSx}
      >
        {content}
      </ListItemButton>
    );

    return (
      <React.Fragment key={node.id}>
        {node.path && !hasChildren ? (
          <ListItemButton
            component={Link}
            href={normalizeMenuPath(node.path) ?? "#"}
            selected={isActive}
            sx={commonButtonSx}
          >
            {content}
          </ListItemButton>
        ) : (
          groupButton
        )}
        {hasChildren ? (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding>{node.children.map((child) => renderNode(child, depth + 1, nextAncestors))}</List>
          </Collapse>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        px: 1.5,
        py: 1.5,
        width,
        bgcolor: "rgba(255,255,255,0.96)",
        borderRight: "1px solid rgba(15, 32, 48, 0.08)",
        height: "100%",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box sx={{ px: 1, pb: 1.5, minHeight: 52 }}>
        <Typography variant="overline" sx={{ color: "var(--muted)", letterSpacing: 1 }}>
          HOSPITAL CORE
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: "var(--brand-strong)" }}>
          병원 운영 메뉴
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
        {loading ? (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : menuLoadError ? (
          <Box sx={{ px: 1, py: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              메뉴를 받아오는데 실패했습니다.
            </Typography>
          </Box>
        ) : menus.length === 0 ? (
          <Box sx={{ px: 1, py: 1.5 }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              표시할 메뉴가 없습니다.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>{menus.map((node) => renderNode(node, 0))}</List>
        )}
      </Box>

      <Box sx={{ mt: 2, pt: 1.5 }}>
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.65)",
            border: "1px solid var(--line)",
          }}
        >
          <Typography variant="caption" fontWeight={800} color="text.secondary">
            * 확장은 Sprint에서 진행
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
