"use client";

import * as React from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import PermissionTabs from "@/app/admin/permissions/_components/PermissionTabs";
import MainLayout from "@/components/layout/MainLayout";
import { useSetMenus } from "@/components/layout/MenuContext";
import {
  fetchAuthRolesApi,
  fetchRoleMenuPermissionsApi,
  saveRoleMenuPermissionsApi,
  type AuthRoleSummary,
  type RoleMenuPermissionNode,
  type RoleMenuPermissionSaveItem,
} from "@/lib/admin/menuPermissionApi";
import {
  getSessionChangedEventName,
  getSessionUser,
  type SessionUser,
} from "@/lib/auth/session";
import type { MenuNode } from "@/types/menu";

type PanelSide = "all" | "allowed";

type VisibleMenuRow = {
  menuId: number;
  menuName: string;
  depth: number;
  hasChildren: boolean;
  childrenCount: number;
  isActive: "Y" | "N";
};

type MenuTreePanelProps = {
  title: string;
  totalCount: number;
  rows: VisibleMenuRow[];
  expanded: Set<number>;
  selected: Set<number>;
  emptyMessage: string;
  side: PanelSide;
  onToggleExpand: (side: PanelSide, menuId: number) => void;
  onToggleSelect: (side: PanelSide, menuId: number) => void;
};

const MAX_MENU_DEPTH = 12;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "관리자",
  DOCTOR: "의사",
  NURSE: "간호사",
  STAFF: "직원",
};

const isAdminAuthRole = (user: SessionUser | null | undefined) =>
  (user?.authRole ?? "").trim().toUpperCase() === "ADMIN";

const getRoleDisplayName = (role: Pick<AuthRoleSummary, "roleCode" | "roleName">) =>
  ROLE_LABELS[role.roleCode.trim().toUpperCase()] || role.roleName;

const clonePermissionTree = (nodes: RoleMenuPermissionNode[]): RoleMenuPermissionNode[] =>
  nodes.map((node) => ({
    ...node,
    children: clonePermissionTree(node.children),
  }));

const flattenPermissionPayload = (
  nodes: RoleMenuPermissionNode[]
): RoleMenuPermissionSaveItem[] => {
  const items: RoleMenuPermissionSaveItem[] = [];

  const visit = (rows: RoleMenuPermissionNode[]) => {
    for (const row of rows) {
      items.push({
        menuId: row.menuId,
        canView: row.canView,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      });
      visit(row.children);
    }
  };

  visit(nodes);
  return items;
};

const buildPermissionSignature = (nodes: RoleMenuPermissionNode[]) =>
  JSON.stringify(flattenPermissionPayload(nodes));

const countDescendants = (node: RoleMenuPermissionNode): number =>
  node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);

const collectMenuIds = (nodes: RoleMenuPermissionNode[]): number[] => {
  const ids: number[] = [];
  for (const node of nodes) {
    ids.push(node.menuId);
    ids.push(...collectMenuIds(node.children));
  }
  return ids;
};

const collectAllowedMenuIds = (nodes: RoleMenuPermissionNode[]): Set<number> => {
  const ids = new Set<number>();

  const visit = (rows: RoleMenuPermissionNode[]) => {
    for (const row of rows) {
      if (row.canView) {
        ids.add(row.menuId);
      }
      visit(row.children);
    }
  };

  visit(nodes);
  return ids;
};

const collectExpandableMenuIds = (
  nodes: RoleMenuPermissionNode[],
  depth = 0,
  bucket: Set<number> = new Set()
) => {
  if (depth > MAX_MENU_DEPTH) {
    return bucket;
  }

  for (const node of nodes) {
    if (node.children.length > 0) {
      bucket.add(node.menuId);
      collectExpandableMenuIds(node.children, depth + 1, bucket);
    }
  }

  return bucket;
};

const buildSubtreeIdMap = (
  nodes: RoleMenuPermissionNode[],
  map: Map<number, number[]> = new Map()
): Map<number, number[]> => {
  for (const node of nodes) {
    const descendants = collectMenuIds([node]);
    map.set(node.menuId, descendants);
    buildSubtreeIdMap(node.children, map);
  }
  return map;
};

const buildDefaultExpandedMenuIds = (nodes: RoleMenuPermissionNode[]) =>
  new Set(
    nodes
      .filter((node) => node.children.length > 0)
      .map((node) => node.menuId)
  );

const filterPermissionTree = (
  nodes: RoleMenuPermissionNode[],
  predicate: (menuId: number) => boolean
): RoleMenuPermissionNode[] => {
  const filtered: RoleMenuPermissionNode[] = [];

  for (const node of nodes) {
    const children = filterPermissionTree(node.children, predicate);
    if (predicate(node.menuId) || children.length > 0) {
      filtered.push({
        ...node,
        children,
      });
    }
  }

  return filtered;
};

const flattenTreeCount = (nodes: RoleMenuPermissionNode[]): number =>
  nodes.reduce((sum, node) => sum + 1 + flattenTreeCount(node.children), 0);

const buildVisibleRows = (
  nodes: RoleMenuPermissionNode[],
  expanded: Set<number>,
  allowedMenuIds: Set<number>,
  depth = 0
): VisibleMenuRow[] => {
  if (depth > MAX_MENU_DEPTH) {
    return [];
  }

  const rows: VisibleMenuRow[] = [];

  for (const node of nodes) {
    rows.push({
      menuId: node.menuId,
      menuName: node.menuName,
      depth,
      hasChildren: node.children.length > 0,
      childrenCount: countDescendants(node),
      isActive: node.isActive,
    });

    if (node.children.length > 0 && expanded.has(node.menuId)) {
      rows.push(...buildVisibleRows(node.children, expanded, allowedMenuIds, depth + 1));
    }
  }

  return rows;
};

const updateAccessForIds = (
  nodes: RoleMenuPermissionNode[],
  targetIds: Set<number>,
  checked: boolean
): RoleMenuPermissionNode[] =>
  nodes.map((node) => {
    const nextChildren = updateAccessForIds(node.children, targetIds, checked);

    if (!targetIds.has(node.menuId)) {
      if (nextChildren === node.children) {
        return node;
      }

      return {
        ...node,
        children: nextChildren,
      };
    }

    return {
      ...node,
      canView: checked,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      children: nextChildren,
    };
  });

const MenuTreePanel = ({
  title,
  totalCount,
  rows,
  expanded,
  selected,
  emptyMessage,
  side,
  onToggleExpand,
  onToggleSelect,
}: MenuTreePanelProps) => (
  <Paper
    variant="outlined"
    sx={{
      flex: 1,
      minWidth: 0,
      height: { xs: 320, md: 420, xl: 520 },
      borderRadius: 2.5,
      overflow: "hidden",
      borderColor: "rgba(22, 78, 139, 0.2)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.25,
        backgroundColor: "rgba(20, 96, 165, 0.08)",
        borderBottom: "1px solid rgba(22, 78, 139, 0.12)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight={800}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {totalCount}건
        </Typography>
      </Stack>
    </Box>

    {rows.length === 0 ? (
      <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    ) : (
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Stack divider={<Box sx={{ borderTop: "1px solid rgba(15, 32, 48, 0.06)" }} />}>
        {rows.map((row) => {
          const isExpanded = expanded.has(row.menuId);
          const isSelected = selected.has(row.menuId);

          return (
            <Box
              key={`${side}-${row.menuId}`}
              role="button"
              onClick={() => onToggleSelect(side, row.menuId)}
              sx={{
                px: 1.5,
                py: 0.55,
                backgroundColor: isSelected ? "rgba(22, 78, 139, 0.08)" : "transparent",
                cursor: "pointer",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: row.depth * 2.5 }}>
                {row.hasChildren ? (
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleExpand(side, row.menuId);
                    }}
                    sx={{
                      width: 22,
                      height: 22,
                      border: "1px solid rgba(22, 78, 139, 0.24)",
                      borderRadius: 1.25,
                      flexShrink: 0,
                    }}
                  >
                    {isExpanded ? (
                      <RemoveRoundedIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <AddRoundedIcon sx={{ fontSize: 15 }} />
                    )}
                  </IconButton>
                ) : (
                  <Box sx={{ width: 22, height: 22, flexShrink: 0 }} />
                )}

                <Stack spacing={0} sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography variant="body1" fontWeight={row.depth === 0 ? 800 : 600}>
                      {row.menuName}
                    </Typography>
                    {row.isActive === "N" ? (
                      <Chip size="small" label="비활성" color="default" variant="outlined" />
                    ) : null}
                  </Stack>
                </Stack>

                {row.depth === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {row.childrenCount}개 메뉴
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          );
        })}
        </Stack>
      </Box>
    )}
  </Paper>
);

export default function RoleMenuPermissionClient() {
  const setMenus = useSetMenus();
  const [sessionUser, setSessionUser] = React.useState<SessionUser | null>(() => getSessionUser());
  const [roles, setRoles] = React.useState<AuthRoleSummary[]>([]);
  const [selectedRoleCode, setSelectedRoleCode] = React.useState("");
  const [permissionTree, setPermissionTree] = React.useState<RoleMenuPermissionNode[]>([]);
  const [initialPermissionTree, setInitialPermissionTree] = React.useState<RoleMenuPermissionNode[]>([]);
  const [selectedAllMenuIds, setSelectedAllMenuIds] = React.useState<Set<number>>(new Set());
  const [selectedAllowedMenuIds, setSelectedAllowedMenuIds] = React.useState<Set<number>>(new Set());
  const [expandedAllMenuIds, setExpandedAllMenuIds] = React.useState<Set<number>>(new Set());
  const [expandedAllowedMenuIds, setExpandedAllowedMenuIds] = React.useState<Set<number>>(new Set());
  const [loadingRoles, setLoadingRoles] = React.useState(true);
  const [loadingPermissions, setLoadingPermissions] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedMessage, setSavedMessage] = React.useState<string | null>(null);
  const loadRequestIdRef = React.useRef(0);

  const currentAuthRole = React.useMemo(
    () => (sessionUser?.authRole ?? "").trim().toUpperCase(),
    [sessionUser]
  );
  const canManagePermissions = currentAuthRole === "ADMIN";

  React.useEffect(() => {
    const syncSessionUser = () => {
      setSessionUser(getSessionUser());
    };

    const eventName = getSessionChangedEventName();
    window.addEventListener(eventName, syncSessionUser);
    syncSessionUser();

    return () => window.removeEventListener(eventName, syncSessionUser);
  }, []);

  React.useEffect(() => {
    if (!currentAuthRole || canManagePermissions) {
      return;
    }

    window.location.replace("/");
  }, [canManagePermissions, currentAuthRole]);

  const initialSignature = React.useMemo(
    () => buildPermissionSignature(initialPermissionTree),
    [initialPermissionTree]
  );
  const currentSignature = React.useMemo(
    () => buildPermissionSignature(permissionTree),
    [permissionTree]
  );
  const isDirty = initialSignature !== currentSignature;

  const selectedRole = React.useMemo(
    () => roles.find((role) => role.roleCode === selectedRoleCode) ?? null,
    [roles, selectedRoleCode]
  );

  const allowedMenuIds = React.useMemo(
    () => collectAllowedMenuIds(permissionTree),
    [permissionTree]
  );
  const allMenuIds = React.useMemo(
    () => new Set(collectMenuIds(permissionTree)),
    [permissionTree]
  );
  const subtreeIdMap = React.useMemo(
    () => buildSubtreeIdMap(permissionTree),
    [permissionTree]
  );

  const allowedTree = React.useMemo(
    () => filterPermissionTree(permissionTree, (menuId) => allowedMenuIds.has(menuId)),
    [allowedMenuIds, permissionTree]
  );
  const availableTree = React.useMemo(
    () => filterPermissionTree(permissionTree, (menuId) => !allowedMenuIds.has(menuId)),
    [allowedMenuIds, permissionTree]
  );

  const availableRows = React.useMemo(
    () => buildVisibleRows(availableTree, expandedAllMenuIds, allowedMenuIds),
    [allowedMenuIds, availableTree, expandedAllMenuIds]
  );
  const allowedRows = React.useMemo(
    () => buildVisibleRows(allowedTree, expandedAllowedMenuIds, allowedMenuIds),
    [allowedMenuIds, allowedTree, expandedAllowedMenuIds]
  );

  const totalMenuCount = React.useMemo(() => flattenTreeCount(permissionTree), [permissionTree]);
  const totalAllowedCount = allowedMenuIds.size;
  const totalAvailableCount = Math.max(totalMenuCount - totalAllowedCount, 0);

  const refreshCurrentSessionMenus = React.useCallback(async () => {
    if (!setMenus) {
      return;
    }

    try {
      const response = await fetch("/api/session/menus", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { menus?: MenuNode[] };
      if (Array.isArray(payload.menus)) {
        setMenus(payload.menus);
      }
    } catch {
      // Keep the last known menu state when refresh fails.
    }
  }, [setMenus]);

  const applyLoadedTree = React.useCallback((tree: RoleMenuPermissionNode[]) => {
    const nextTree = clonePermissionTree(tree);
    const nextAllowedIds = collectAllowedMenuIds(nextTree);
    const nextAllowedTree = filterPermissionTree(nextTree, (menuId) => nextAllowedIds.has(menuId));

    setPermissionTree(nextTree);
    setInitialPermissionTree(clonePermissionTree(tree));
    setSelectedAllMenuIds(new Set());
    setSelectedAllowedMenuIds(new Set());
    setExpandedAllMenuIds(buildDefaultExpandedMenuIds(nextTree));
    setExpandedAllowedMenuIds(buildDefaultExpandedMenuIds(nextAllowedTree));
  }, []);

  const loadRoleMenus = React.useCallback(async (roleCode: string) => {
    const normalizedRoleCode = roleCode.trim();
    if (!normalizedRoleCode) {
      setPermissionTree([]);
      setInitialPermissionTree([]);
      setSelectedAllMenuIds(new Set());
      setSelectedAllowedMenuIds(new Set());
      setExpandedAllMenuIds(new Set());
      setExpandedAllowedMenuIds(new Set());
      return;
    }

    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;
    setLoadingPermissions(true);
    setError(null);
    setSavedMessage(null);

    try {
      const tree = await fetchRoleMenuPermissionsApi(normalizedRoleCode);
      if (loadRequestIdRef.current !== requestId) {
        return;
      }

      applyLoadedTree(tree);
    } catch (loadError) {
      if (loadRequestIdRef.current !== requestId) {
        return;
      }

      setPermissionTree([]);
      setInitialPermissionTree([]);
      setSelectedAllMenuIds(new Set());
      setSelectedAllowedMenuIds(new Set());
      setExpandedAllMenuIds(new Set());
      setExpandedAllowedMenuIds(new Set());
      setError(
        loadError instanceof Error
          ? loadError.message
          : "메뉴 권한을 불러오지 못했습니다."
      );
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setLoadingPermissions(false);
      }
    }
  }, [applyLoadedTree]);

  React.useEffect(() => {
    if (!canManagePermissions) {
      return;
    }

    let active = true;

    const bootstrap = async () => {
      setLoadingRoles(true);
      setError(null);
      setSavedMessage(null);

      try {
        const roleList = await fetchAuthRolesApi();
        if (!active) {
          return;
        }

        setRoles(roleList);

        if (roleList.length === 0) {
          setSelectedRoleCode("");
          setPermissionTree([]);
          setInitialPermissionTree([]);
          setSelectedAllMenuIds(new Set());
          setSelectedAllowedMenuIds(new Set());
          setExpandedAllMenuIds(new Set());
          setExpandedAllowedMenuIds(new Set());
          return;
        }

        const fallbackRoleCode =
          roleList.find((role) => role.roleCode === "ADMIN")?.roleCode ??
          roleList[0].roleCode;
        const preferredRoleCode =
          roleList.find((role) => role.roleCode === currentAuthRole)?.roleCode ??
          fallbackRoleCode;

        setSelectedRoleCode(preferredRoleCode);
        await loadRoleMenus(preferredRoleCode);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setRoles([]);
        setSelectedRoleCode("");
        setPermissionTree([]);
        setInitialPermissionTree([]);
        setSelectedAllMenuIds(new Set());
        setSelectedAllowedMenuIds(new Set());
        setExpandedAllMenuIds(new Set());
        setExpandedAllowedMenuIds(new Set());
        setError(
          loadError instanceof Error
            ? loadError.message
            : "역할 목록을 불러오지 못했습니다."
        );
      } finally {
        if (active) {
          setLoadingRoles(false);
        }
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [canManagePermissions, currentAuthRole, loadRoleMenus]);

  const confirmDiscardChanges = React.useCallback(() => {
    if (!isDirty) {
      return true;
    }

    return window.confirm(
      "저장하지 않은 변경사항이 있습니다. 현재 수정 내용은 저장되지 않고 사라집니다. 계속하시겠습니까?"
    );
  }, [isDirty]);

  const handleRoleChange = async (nextRoleCode: string) => {
    if (nextRoleCode === selectedRoleCode) {
      return;
    }

    if (!confirmDiscardChanges()) {
      return;
    }

    setSelectedRoleCode(nextRoleCode);
    await loadRoleMenus(nextRoleCode);
  };

  const toggleExpand = (side: PanelSide, menuId: number) => {
    const updateExpanded = side === "all" ? setExpandedAllMenuIds : setExpandedAllowedMenuIds;

    updateExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const toggleSelected = (side: PanelSide, menuId: number) => {
    const updateSelected = side === "all" ? setSelectedAllMenuIds : setSelectedAllowedMenuIds;

    updateSelected((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const applyAccessChange = React.useCallback(
    (updater: (currentTree: RoleMenuPermissionNode[]) => RoleMenuPermissionNode[]) => {
      setPermissionTree((prev) => updater(prev));
      setSavedMessage(null);
      setError(null);
    },
    []
  );

  const handleMoveToAllowed = () => {
    if (selectedAllMenuIds.size === 0) {
      return;
    }

    const targetIds = new Set<number>();
    for (const selectedId of selectedAllMenuIds) {
      for (const menuId of subtreeIdMap.get(selectedId) ?? [selectedId]) {
        targetIds.add(menuId);
      }
    }

    applyAccessChange((prev) => updateAccessForIds(prev, targetIds, true));
    setSelectedAllMenuIds(new Set());
    setExpandedAllowedMenuIds((prev) => {
      const next = new Set(prev);
      for (const menuId of targetIds) {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleMoveToBlocked = () => {
    if (selectedAllowedMenuIds.size === 0) {
      return;
    }

    const targetIds = new Set<number>();
    for (const selectedId of selectedAllowedMenuIds) {
      for (const menuId of subtreeIdMap.get(selectedId) ?? [selectedId]) {
        targetIds.add(menuId);
      }
    }

    applyAccessChange((prev) => updateAccessForIds(prev, targetIds, false));
    setSelectedAllowedMenuIds(new Set());
  };

  const handleAllowAll = () => {
    applyAccessChange((prev) => updateAccessForIds(prev, allMenuIds, true));
    setSelectedAllMenuIds(new Set());
    setSelectedAllowedMenuIds(new Set());
  };

  const handleClearAll = () => {
    applyAccessChange((prev) => updateAccessForIds(prev, allMenuIds, false));
    setSelectedAllMenuIds(new Set());
    setSelectedAllowedMenuIds(new Set());
  };

  const handleExpandAll = () => {
    setExpandedAllMenuIds(collectExpandableMenuIds(availableTree));
    setExpandedAllowedMenuIds(collectExpandableMenuIds(allowedTree));
  };

  const handleCollapseAll = () => {
    setExpandedAllMenuIds(new Set());
    setExpandedAllowedMenuIds(new Set());
  };

  const handleResetChanges = () => {
    if (!confirmDiscardChanges()) {
      return;
    }

    const restoredTree = clonePermissionTree(initialPermissionTree);
    const restoredAllowedIds = collectAllowedMenuIds(restoredTree);
    const restoredAllowedTree = filterPermissionTree(restoredTree, (menuId) =>
      restoredAllowedIds.has(menuId)
    );

    setPermissionTree(restoredTree);
    setSelectedAllMenuIds(new Set());
    setSelectedAllowedMenuIds(new Set());
    setExpandedAllMenuIds(buildDefaultExpandedMenuIds(restoredTree));
    setExpandedAllowedMenuIds(buildDefaultExpandedMenuIds(restoredAllowedTree));
    setSavedMessage(null);
    setError(null);
  };

  const handleReloadCurrentRole = async () => {
    if (!confirmDiscardChanges()) {
      return;
    }

    await loadRoleMenus(selectedRoleCode);
  };

  const handleSave = async () => {
    if (!selectedRoleCode || saving) {
      return;
    }

    setSaving(true);
    setError(null);
    setSavedMessage(null);

    try {
      const payload = flattenPermissionPayload(permissionTree);
      await saveRoleMenuPermissionsApi(selectedRoleCode, payload);

      setInitialPermissionTree(clonePermissionTree(permissionTree));
      setSavedMessage("역할별 메뉴 권한이 저장되었습니다.");

      if (selectedRoleCode === currentAuthRole) {
        await refreshCurrentSessionMenus();
      }
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "메뉴 권한 저장에 실패했습니다."
      );
    } finally {
      setSaving(false);
    }
  };

  if (currentAuthRole && !isAdminAuthRole(sessionUser)) {
    return null;
  }

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <PermissionTabs />

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2 } }}>
            {loadingRoles ? (
              <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Stack spacing={1.25}>
                <Stack
                  direction={{ xs: "column", lg: "row" }}
                  spacing={1}
                  justifyContent="space-between"
                  alignItems={{ lg: "center" }}
                >
                  <Stack spacing={0.25}>
                    <Typography variant="h5" fontWeight={900}>
                      역할별 메뉴 권한 관리
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                      color={isDirty ? "warning" : "default"}
                      label={isDirty ? "저장 전 변경 있음" : "저장됨"}
                      variant={isDirty ? "filled" : "outlined"}
                    />
                    <Chip
                      color="primary"
                      variant="outlined"
                    label={`허용 ${totalAllowedCount} / 전체 ${totalMenuCount}`}
                    />
                  </Stack>
                </Stack>

                <Stack spacing={1}>
                  <Tabs
                    value={selectedRoleCode || false}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    onChange={(_, value: string) => void handleRoleChange(value)}
                    sx={{
                      minHeight: 42,
                      borderBottom: "1px solid rgba(15, 32, 48, 0.12)",
                      "& .MuiTabs-flexContainer": {
                        gap: 0.25,
                      },
                      "& .MuiTab-root": {
                        minHeight: 42,
                        px: 1.5,
                        py: 0.75,
                        fontSize: 13,
                        fontWeight: 700,
                        textTransform: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      },
                    }}
                  >
                    {roles.map((role) => (
                      <Tab
                        key={role.roleCode}
                        value={role.roleCode}
                        disabled={saving || loadingPermissions}
                        label={getRoleDisplayName(role)}
                      />
                    ))}
                  </Tabs>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleExpandAll}
                      disabled={loadingPermissions || saving || permissionTree.length === 0}
                    >
                      전체 펼치기
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCollapseAll}
                      disabled={loadingPermissions || saving || permissionTree.length === 0}
                    >
                      전체 접기
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleAllowAll}
                      disabled={loadingPermissions || saving || permissionTree.length === 0}
                    >
                      전체 허용
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleClearAll}
                      disabled={loadingPermissions || saving || permissionTree.length === 0}
                    >
                      전체 해제
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => void handleReloadCurrentRole()}
                      disabled={loadingPermissions || saving || !selectedRoleCode}
                    >
                      다시 불러오기
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={handleResetChanges}
                      disabled={loadingPermissions || saving || !isDirty}
                      sx={{
                        fontSize: 0,
                        minWidth: 56,
                        "&::after": {
                          content: '"초기화"',
                          fontSize: "0.875rem",
                          lineHeight: 1.75,
                        },
                      }}
                    >
                      변경 취소
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => void handleSave()}
                      disabled={loadingPermissions || saving || !selectedRoleCode || !isDirty}
                      sx={{ display: "none" }}
                    >
                      {saving ? "저장 중..." : "저장"}
                    </Button>
                  </Stack>
                </Stack>

                {error ? <Alert severity="error">{error}</Alert> : null}
                {savedMessage ? <Alert severity="success">{savedMessage}</Alert> : null}
                {!error && !savedMessage && roles.length === 0 ? (
                  <Alert severity="info">조회 가능한 역할이 없습니다.</Alert>
                ) : null}
                <Box
                  sx={{
                    mt: 0.25,
                    pt: 1.75,
                    borderTop: "1px solid rgba(15, 32, 48, 0.1)",
                  }}
                >
                  {loadingPermissions ? (
                    <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={30} />
              </Box>
            ) : permissionTree.length === 0 ? (
              <Alert severity="info">
                {selectedRole
                  ? `${getRoleDisplayName(selectedRole)}에 등록된 메뉴 권한이 없습니다.`
                  : "역할을 선택해 주세요."}
              </Alert>
            ) : (
              <Box
                sx={{
                  border: "1px solid rgba(22, 78, 139, 0.16)",
                  borderRadius: 2.5,
                  p: 2,
                  backgroundColor: "rgba(244, 248, 252, 0.7)",
                }}
              >
                <Stack
                  direction={{ xs: "column", xl: "row" }}
                  spacing={2}
                  alignItems="stretch"
                >
                  <MenuTreePanel
                    title="미허용 메뉴"
                    totalCount={totalAvailableCount}
                    rows={availableRows}
                    expanded={expandedAllMenuIds}
                    selected={selectedAllMenuIds}
                    emptyMessage="미허용 메뉴가 없습니다."
                    side="all"
                    onToggleExpand={toggleExpand}
                    onToggleSelect={toggleSelected}
                  />

                  <Stack
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minWidth: { xs: "100%", xl: 88 } }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleMoveToAllowed}
                      disabled={selectedAllMenuIds.size === 0 || saving}
                      endIcon={<ChevronRightRoundedIcon />}
                      sx={{
                        width: 56,
                        minWidth: 56,
                        fontSize: 0,
                        "& .MuiButton-endIcon": {
                          display: "none",
                        },
                        "&::after": {
                          content: '">"',
                          fontSize: "1rem",
                          lineHeight: 1,
                        },
                      }}
                    >
                      허용
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleMoveToBlocked}
                      disabled={selectedAllowedMenuIds.size === 0 || saving}
                      endIcon={<ChevronLeftRoundedIcon />}
                      sx={{
                        width: 56,
                        minWidth: 56,
                        fontSize: 0,
                        "& .MuiButton-endIcon": {
                          display: "none",
                        },
                        "&::after": {
                          content: '"<"',
                          fontSize: "1rem",
                          lineHeight: 1,
                        },
                      }}
                    >
                      제외
                    </Button>
                  </Stack>

                  <MenuTreePanel
                    title="현재 허용 메뉴"
                    totalCount={totalAllowedCount}
                    rows={allowedRows}
                    expanded={expandedAllowedMenuIds}
                    selected={selectedAllowedMenuIds}
                    emptyMessage="허용된 메뉴가 없습니다."
                    side="allowed"
	                    onToggleExpand={toggleExpand}
	                    onToggleSelect={toggleSelected}
	                  />
	                </Stack>
	                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.25 }}>
	                  <Button
	                    size="small"
	                    variant="contained"
	                    onClick={() => void handleSave()}
	                    disabled={loadingPermissions || saving || !selectedRoleCode || !isDirty}
	                  >
	                    {saving ? "저장 중..." : "저장"}
	                  </Button>
	                </Stack>
	              </Box>
                  )}
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </MainLayout>
  );
}
