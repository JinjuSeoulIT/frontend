"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import MainLayout from "@/components/layout/MainLayout";
import PermissionTabs from "@/app/admin/permissions/_components/PermissionTabs";
import { createMenuApi, fetchMenusApi, updateMenuApi } from "@/lib/admin/menuApi";
import type { MenuNode } from "@/types/menu";

type VisibleMenuRow = {
  id: number;
  code: string;
  name: string;
  path: string | null;
  depth: number;
  hasChildren: boolean;
  parentId: number | null;
  nameEn: string | null;
  sortOrder: number;
  isActive: "Y" | "N";
  adminOnly: "Y" | "N";
};

type ParentMenuOption = {
  id: number;
  label: string;
  depth: number;
};

type MenuModalMode = "create" | "edit";

type MenuFormValues = {
  name: string;
  nameEn: string;
  path: string;
  parentMenuId: string;
  sortOrder: string;
  isActive: "Y" | "N";
  adminOnly: "Y" | "N";
};

type MenuFormErrors = Partial<Record<keyof MenuFormValues, string>>;

type ChangedField = {
  label: string;
  before: string;
  after: string;
};

const SAFE_TEXT_REGEX = /^[\p{L}\p{N}\s._()\-]+$/u;
const PATH_REGEX = /^\/[a-zA-Z0-9/_-]*$/;

const EMPTY_FORM: MenuFormValues = {
  name: "",
  nameEn: "",
  path: "",
  parentMenuId: "ROOT",
  sortOrder: "1",
  isActive: "Y",
  adminOnly: "N",
};

const flattenMenuCount = (nodes: MenuNode[]): number => {
  return nodes.reduce((sum, node) => sum + 1 + flattenMenuCount(node.children), 0);
};

const flattenParentOptions = (nodes: MenuNode[], depth = 0): ParentMenuOption[] => {
  const rows: ParentMenuOption[] = [];
  for (const node of nodes) {
    rows.push({
      id: node.id,
      label: node.name,
      depth,
    });
    rows.push(...flattenParentOptions(node.children, depth + 1));
  }
  return rows;
};

const flattenRows = (nodes: MenuNode[], depth = 0): VisibleMenuRow[] => {
  const rows: VisibleMenuRow[] = [];
  for (const node of nodes) {
    rows.push({
      id: node.id,
      code: node.code,
      name: node.name,
      path: node.path,
      depth,
      hasChildren: node.children.length > 0,
      parentId: node.parentId ?? null,
      nameEn: node.nameEn ?? null,
      sortOrder: node.sortOrder ?? 1,
      isActive: node.isActive ?? "Y",
      adminOnly: node.adminOnly ?? "N",
    });
    rows.push(...flattenRows(node.children, depth + 1));
  }
  return rows;
};

const buildVisibleRows = (
  nodes: MenuNode[],
  expanded: Set<number>,
  depth = 0
): VisibleMenuRow[] => {
  const rows: VisibleMenuRow[] = [];

  for (const node of nodes) {
    rows.push({
      id: node.id,
      code: node.code,
      name: node.name,
      path: node.path,
      depth,
      hasChildren: node.children.length > 0,
      parentId: node.parentId ?? null,
      nameEn: node.nameEn ?? null,
      sortOrder: node.sortOrder ?? 1,
      isActive: node.isActive ?? "Y",
      adminOnly: node.adminOnly ?? "N",
    });

    if (node.children.length > 0 && expanded.has(node.id)) {
      rows.push(...buildVisibleRows(node.children, expanded, depth + 1));
    }
  }

  return rows;
};

const buildDescendantMap = (nodes: MenuNode[]) => {
  const map = new Map<number, Set<number>>();

  const walk = (node: MenuNode): Set<number> => {
    const set = new Set<number>();
    for (const child of node.children) {
      set.add(child.id);
      const childDescendants = walk(child);
      childDescendants.forEach((descendantId) => set.add(descendantId));
    }
    map.set(node.id, set);
    return set;
  };

  nodes.forEach(walk);
  return map;
};

const toFormValues = (menu: VisibleMenuRow): MenuFormValues => ({
  name: menu.name,
  nameEn: menu.nameEn ?? "",
  path: menu.path ?? "",
  parentMenuId: menu.parentId == null ? "ROOT" : String(menu.parentId),
  sortOrder: String(menu.sortOrder),
  isActive: menu.isActive,
  adminOnly: menu.adminOnly,
});

const normalizeText = (value: string) => value.trim();
const normalizePath = (value: string) => value.trim();

const toDisplayYn = (value: "Y" | "N", yes = "예", no = "아니오") => (value === "Y" ? yes : no);

const validateForm = (values: MenuFormValues): MenuFormErrors => {
  const errors: MenuFormErrors = {};
  const name = normalizeText(values.name);
  const nameEn = normalizeText(values.nameEn);
  const path = normalizePath(values.path);
  const sortOrder = Number(values.sortOrder);

  if (!name) {
    errors.name = "메뉴명은 필수입니다.";
  } else if (!SAFE_TEXT_REGEX.test(name)) {
    errors.name = "메뉴명은 안전한 문자열만 입력할 수 있습니다.";
  }

  if (nameEn && !SAFE_TEXT_REGEX.test(nameEn)) {
    errors.nameEn = "영문명은 안전한 문자열만 입력할 수 있습니다.";
  }

  if (!path) {
    errors.path = "메뉴 URL은 필수입니다.";
  } else if (!PATH_REGEX.test(path)) {
    errors.path = "메뉴 URL 형식이 올바르지 않습니다. 예: /admin/menus";
  }

  if (!values.sortOrder.trim()) {
    errors.sortOrder = "메뉴 순서는 필수입니다.";
  } else if (!Number.isInteger(sortOrder) || sortOrder < 1) {
    errors.sortOrder = "메뉴 순서는 1 이상의 정수여야 합니다.";
  }

  return errors;
};

const getChangedFields = (
  original: MenuFormValues | null,
  current: MenuFormValues
): ChangedField[] => {
  if (!original) {
    return [];
  }

  const entries: Array<ChangedField | null> = [
    normalizeText(original.name) !== normalizeText(current.name)
      ? { label: "메뉴명", before: original.name || "-", after: current.name || "-" }
      : null,
    normalizeText(original.nameEn) !== normalizeText(current.nameEn)
      ? { label: "영문명", before: original.nameEn || "-", after: current.nameEn || "-" }
      : null,
    normalizePath(original.path) !== normalizePath(current.path)
      ? { label: "메뉴 URL", before: original.path || "-", after: current.path || "-" }
      : null,
    original.parentMenuId !== current.parentMenuId
      ? {
          label: "상위 메뉴",
          before: original.parentMenuId === "ROOT" ? "최상위" : original.parentMenuId,
          after: current.parentMenuId === "ROOT" ? "최상위" : current.parentMenuId,
        }
      : null,
    original.sortOrder !== current.sortOrder
      ? { label: "메뉴 순서", before: original.sortOrder || "-", after: current.sortOrder || "-" }
      : null,
    original.isActive !== current.isActive
      ? {
          label: "활성 상태",
          before: toDisplayYn(original.isActive, "활성", "비활성"),
          after: toDisplayYn(current.isActive, "활성", "비활성"),
        }
      : null,
    original.adminOnly !== current.adminOnly
      ? {
          label: "관리자 전용",
          before: toDisplayYn(original.adminOnly, "Y", "N"),
          after: toDisplayYn(current.adminOnly, "Y", "N"),
        }
      : null,
  ];

  return entries.filter((entry): entry is ChangedField => entry != null);
};

export default function MenuManagementClient() {
  const [menuTree, setMenuTree] = React.useState<MenuNode[]>([]);
  const [expanded, setExpanded] = React.useState<Set<number>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = React.useState<string | null>(null);

  const [modalMode, setModalMode] = React.useState<MenuModalMode | null>(null);
  const [modalMenuId, setModalMenuId] = React.useState<number | null>(null);
  const [formValues, setFormValues] = React.useState<MenuFormValues>(EMPTY_FORM);
  const [originalFormValues, setOriginalFormValues] = React.useState<MenuFormValues | null>(null);
  const [formErrors, setFormErrors] = React.useState<MenuFormErrors>({});
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const loadMenus = React.useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await fetchMenusApi();
      setMenuTree(data);

      const topMenuIds = data.map((menu) => menu.id);
      setExpanded(new Set(topMenuIds));
    } catch (fetchError) {
      setMenuTree([]);
      setExpanded(new Set());
      setError(fetchError instanceof Error ? fetchError.message : "메뉴 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  const visibleRows = React.useMemo(
    () => buildVisibleRows(menuTree, expanded),
    [menuTree, expanded]
  );
  const allRows = React.useMemo(() => flattenRows(menuTree), [menuTree]);
  const rowById = React.useMemo(() => new Map(allRows.map((row) => [row.id, row])), [allRows]);
  const parentMenuOptions = React.useMemo(() => flattenParentOptions(menuTree), [menuTree]);
  const descendantMap = React.useMemo(() => buildDescendantMap(menuTree), [menuTree]);
  const resultCount = React.useMemo(() => flattenMenuCount(menuTree), [menuTree]);

  const editingRow = React.useMemo(() => {
    if (modalMode !== "edit" || modalMenuId == null) {
      return null;
    }
    return rowById.get(modalMenuId) ?? null;
  }, [modalMode, modalMenuId, rowById]);

  const hasChildMenus = !!(editingRow && descendantMap.get(editingRow.id)?.size);
  const disallowedParentIds = React.useMemo(() => {
    if (!editingRow) {
      return new Set<number>();
    }
    const set = new Set<number>([editingRow.id]);
    const descendants = descendantMap.get(editingRow.id);
    if (descendants) {
      descendants.forEach((id) => set.add(id));
    }
    return set;
  }, [editingRow, descendantMap]);

  const availableParentOptions = React.useMemo(() => {
    if (!editingRow) {
      return parentMenuOptions;
    }
    return parentMenuOptions.filter((option) => !disallowedParentIds.has(option.id));
  }, [editingRow, parentMenuOptions, disallowedParentIds]);

  const changedFields = React.useMemo(
    () => getChangedFields(originalFormValues, formValues),
    [originalFormValues, formValues]
  );

  const toggleExpand = (menuId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setModalMenuId(null);
    setFormValues(EMPTY_FORM);
    setOriginalFormValues(null);
    setFormErrors({});
    setSaveError(null);
  };

  const handleOpenEdit = (menuId: number) => {
    const selected = rowById.get(menuId);
    if (!selected) {
      return;
    }
    const initialValues = toFormValues(selected);
    setModalMode("edit");
    setModalMenuId(menuId);
    setFormValues(initialValues);
    setOriginalFormValues(initialValues);
    setFormErrors({});
    setSaveError(null);
  };

  const closeModal = () => {
    setModalMode(null);
    setModalMenuId(null);
    setFormValues(EMPTY_FORM);
    setOriginalFormValues(null);
    setFormErrors({});
    setSaveError(null);
    setSaving(false);
  };

  const setField = <K extends keyof MenuFormValues>(key: K, value: MenuFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const saveMenu = async () => {
    const nextErrors = validateForm(formValues);

    if (modalMode === "edit" && hasChildMenus && originalFormValues) {
      if (originalFormValues.parentMenuId !== formValues.parentMenuId) {
        nextErrors.parentMenuId = "자식 메뉴가 있는 메뉴는 상위 메뉴를 변경할 수 없습니다.";
      }
    }

    setFormErrors(nextErrors);
    setSaveError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const parsedSortOrder = Number(formValues.sortOrder);
    const parentId = formValues.parentMenuId === "ROOT" ? null : Number(formValues.parentMenuId);

    setSaving(true);
    try {
      if (modalMode === "create") {
        await createMenuApi({
          parentId,
          name: formValues.name.trim(),
          nameEn: formValues.nameEn.trim() || undefined,
          path: formValues.path.trim(),
          sortOrder: parsedSortOrder,
          isActive: formValues.isActive,
          adminOnly: formValues.adminOnly,
        });
        setBannerMessage("메뉴가 등록되었습니다.");
      } else if (modalMode === "edit" && editingRow) {
        await updateMenuApi({
          menuId: editingRow.id,
          parentId,
          code: editingRow.code,
          name: formValues.name.trim(),
          nameEn: formValues.nameEn.trim() || undefined,
          path: formValues.path.trim(),
          sortOrder: parsedSortOrder,
          isActive: formValues.isActive,
          adminOnly: formValues.adminOnly,
        });
        setBannerMessage("메뉴 정보가 수정되었습니다.");
      }

      await loadMenus();
      closeModal();
    } catch (saveException) {
      setSaveError(saveException instanceof Error ? saveException.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <PermissionTabs />

        {bannerMessage ? (
          <Alert severity="success" onClose={() => setBannerMessage(null)}>
            {bannerMessage}
          </Alert>
        ) : null}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack spacing={2.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h4" fontWeight={900} letterSpacing={-0.4}>
                  메뉴 관리
                </Typography>
                <Button
                  variant="contained"
                  disableElevation
                  sx={{ px: 2.5, borderRadius: 2.5 }}
                  onClick={handleOpenCreate}
                >
                  메뉴 등록
                </Button>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "right", fontWeight: 700 }}
              >
                결과 {resultCount}건
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  overflow: "hidden",
                  borderColor: "rgba(22, 78, 139, 0.18)",
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
                  <Typography variant="body2" fontWeight={800}>
                    메뉴명
                  </Typography>
                </Box>

                {loading ? (
                  <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
                    <CircularProgress size={26} />
                  </Box>
                ) : error ? (
                  <Box sx={{ p: 2 }}>
                    <Alert severity="error">{error}</Alert>
                  </Box>
                ) : visibleRows.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Alert severity="info">등록된 메뉴가 없습니다.</Alert>
                  </Box>
                ) : (
                  <Stack divider={<Box sx={{ borderTop: "1px solid rgba(15, 32, 48, 0.06)" }} />}>
                    {visibleRows.map((row) => {
                      const isExpanded = expanded.has(row.id);
                      const isInactive = row.isActive === "N";

                      return (
                        <Box
                          key={row.id}
                          sx={{
                            px: 1.5,
                            py: 0.75,
                            backgroundColor: "transparent",
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ pl: row.depth * 2.5 }}
                          >
                            {row.hasChildren ? (
                              <IconButton
                                size="small"
                                onClick={() => toggleExpand(row.id)}
                                sx={{
                                  width: 22,
                                  height: 22,
                                  border: "1px solid rgba(22, 78, 139, 0.24)",
                                  borderRadius: 1.25,
                                }}
                              >
                                {isExpanded ? (
                                  <RemoveRoundedIcon sx={{ fontSize: 15 }} />
                                ) : (
                                  <AddRoundedIcon sx={{ fontSize: 15 }} />
                                )}
                              </IconButton>
                            ) : (
                              <Box sx={{ width: 22, height: 22 }} />
                            )}

                            <Button
                              variant="text"
                              onClick={() => handleOpenEdit(row.id)}
                              sx={{
                                p: 0,
                                minWidth: 0,
                                textTransform: "none",
                                justifyContent: "flex-start",
                                fontSize: row.depth === 0 ? 16 : 15,
                                fontWeight: row.depth === 0 ? 800 : 600,
                                color: isInactive ? "text.disabled" : "text.primary",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {row.name}
                            </Button>

                            {isInactive ? (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "error.main",
                                  border: "1px solid",
                                  borderColor: "error.light",
                                  px: 0.75,
                                  py: 0.15,
                                  borderRadius: 5,
                                  fontWeight: 700,
                                  ml: 0.5,
                                }}
                              >
                                비활성
                              </Typography>
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Paper>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => void loadMenus()}>
                  새로고침
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={modalMode != null}
        onClose={closeModal}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            maxWidth: 680,
            borderRadius: 3,
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight={900} letterSpacing={-0.4}>
              {modalMode === "create" ? "메뉴 등록" : "메뉴 상세/수정"}
            </Typography>
            <Divider />

            {saveError ? <Alert severity="error">{saveError}</Alert> : null}

            {modalMode === "edit" && changedFields.length > 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: "rgba(22, 78, 139, 0.22)",
                  p: 1.5,
                  backgroundColor: "rgba(20, 96, 165, 0.04)",
                }}
              >
                <Typography variant="body2" fontWeight={800} sx={{ mb: 0.8 }}>
                  변경 예정 필드
                </Typography>
                <Stack spacing={0.6}>
                  {changedFields.map((field) => (
                    <Typography key={field.label} variant="caption" color="text.secondary">
                      {field.label}: {field.before} → {field.after}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            ) : null}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <TextField
                label="메뉴명 *"
                size="small"
                value={formValues.name}
                onChange={(event) => setField("name", event.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              <TextField
                label="영문명"
                size="small"
                value={formValues.nameEn}
                onChange={(event) => setField("nameEn", event.target.value)}
                error={!!formErrors.nameEn}
                helperText={formErrors.nameEn}
              />

              <TextField
                label="메뉴 URL *"
                size="small"
                value={formValues.path}
                onChange={(event) => setField("path", event.target.value)}
                error={!!formErrors.path}
                helperText={formErrors.path}
                sx={{ gridColumn: { md: "1 / -1" } }}
              />

              <TextField
                select
                label="상위 메뉴"
                size="small"
                value={formValues.parentMenuId}
                onChange={(event) => setField("parentMenuId", event.target.value)}
                error={!!formErrors.parentMenuId}
                helperText={
                  formErrors.parentMenuId ??
                  (modalMode === "edit" && hasChildMenus
                    ? "자식 메뉴가 있는 메뉴는 상위 메뉴를 변경할 수 없습니다."
                    : "")
                }
                disabled={modalMode === "edit" && hasChildMenus}
              >
                <MenuItem value="ROOT">최상위</MenuItem>
                {availableParentOptions.map((option) => (
                  <MenuItem key={option.id} value={String(option.id)}>
                    {`${"\u00A0".repeat(option.depth * 2)}${option.label}`}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="메뉴 순서"
                size="small"
                type="number"
                value={formValues.sortOrder}
                onChange={(event) => setField("sortOrder", event.target.value)}
                error={!!formErrors.sortOrder}
                helperText={formErrors.sortOrder}
                inputProps={{ min: 1, step: 1 }}
              />

              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  활성 상태
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formValues.isActive === "Y" ? "활성" : "비활성"}
                </Typography>
              </Stack>

              <TextField
                select
                label="관리자 전용"
                size="small"
                value={formValues.adminOnly}
                onChange={(event) => setField("adminOnly", event.target.value as "Y" | "N")}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
              <Button
                variant="outlined"
                color={formValues.isActive === "Y" ? "error" : "primary"}
                onClick={() => setField("isActive", formValues.isActive === "Y" ? "N" : "Y")}
                sx={{ minWidth: 110 }}
                disabled={saving}
              >
                {formValues.isActive === "Y" ? "비활성" : "활성"}
              </Button>
              <Button variant="outlined" onClick={closeModal} sx={{ minWidth: 100 }} disabled={saving}>
                닫기
              </Button>
              <Button variant="contained" onClick={() => void saveMenu()} sx={{ minWidth: 110 }} disabled={saving}>
                {saving
                  ? "저장 중..."
                  : modalMode === "create"
                  ? "메뉴 등록"
                  : "수정 저장"}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
