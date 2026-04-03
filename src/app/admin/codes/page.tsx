"use client";

import * as React from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";

import {
  activateCodeDetailApi,
  activateCodeGroupApi,
  createCodeDetailApi,
  deactivateCodeDetailApi,
  deactivateCodeGroupApi,
  fetchCodeDetailsApi,
  fetchCodeGroupsApi,
  type CodeDetailItem,
  type CodeGroupItem,
} from "@/lib/admin/codeAdminApi";

type DetailForm = {
  groupCode: string;
  code: string;
  name: string;
  sortOrder: number;
  note: string;
  isActive: boolean;
};

export default function CodeAdminPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [groupActiveOnly, setGroupActiveOnly] = React.useState(false);
  const [detailActiveOnly, setDetailActiveOnly] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState("");

  const [groups, setGroups] = React.useState<CodeGroupItem[]>([]);
  const [details, setDetails] = React.useState<CodeDetailItem[]>([]);

  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [detailForm, setDetailForm] = React.useState<DetailForm>({
    groupCode: "",
    code: "",
    name: "",
    sortOrder: 1,
    note: "",
    isActive: true,
  });

  const loadGroups = React.useCallback(async () => {
    const res = await fetchCodeGroupsApi(groupActiveOnly);
    setGroups(res);

    if (selectedGroup && !res.some((g) => g.groupCode === selectedGroup)) {
      setSelectedGroup("");
    }
  }, [groupActiveOnly, selectedGroup]);

  const loadDetails = React.useCallback(async () => {
    const res = await fetchCodeDetailsApi(selectedGroup || undefined, detailActiveOnly);
    setDetails(res);
  }, [selectedGroup, detailActiveOnly]);

  const loadAll = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await loadGroups();
      await loadDetails();
    } catch (e) {
      setError(e instanceof Error ? e.message : "조회 실패");
    } finally {
      setLoading(false);
    }
  }, [loadGroups, loadDetails]);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  React.useEffect(() => {
    loadDetails().catch((e) => setError(e instanceof Error ? e.message : "상세코드 조회 실패"));
  }, [loadDetails]);

  const openCreateDetail = () => {
    if (!selectedGroup) {
      alert("상세코드를 추가할 그룹을 먼저 선택하세요.");
      return;
    }

    const group = groups.find((g) => g.groupCode === selectedGroup);
    if (!group || !group.isActive) {
      alert("활성화된 그룹에서만 상세코드를 추가할 수 있습니다.");
      return;
    }

    setDetailForm({
      groupCode: selectedGroup,
      code: "",
      name: "",
      sortOrder: 1,
      note: "",
      isActive: true,
    });
    setDetailDialogOpen(true);
  };

  const saveDetail = async () => {
    try {
      if (!detailForm.groupCode.trim()) return alert("그룹코드는 필수입니다.");
      if (!detailForm.code.trim()) return alert("상세코드는 필수입니다.");
      if (!detailForm.name.trim()) return alert("상세코드명은 필수입니다.");

      await createCodeDetailApi({
        groupCode: detailForm.groupCode,
        code: detailForm.code,
        name: detailForm.name,
        sortOrder: Number(detailForm.sortOrder),
        note: detailForm.note,
        isActive: detailForm.isActive,
      });

      setDetailDialogOpen(false);
      await loadDetails();
    } catch (e) {
      alert(e instanceof Error ? e.message : "상세코드 저장 실패");
    }
  };

  const deactivateGroup = async (groupCode: string) => {
    if (!confirm(`${groupCode} 그룹을 비활성화할까요?`)) return;
    try {
      await deactivateCodeGroupApi(groupCode);
      await loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : "코드그룹 비활성화 실패");
    }
  };

  const activateGroup = async (groupCode: string) => {
    if (!confirm(`${groupCode} 그룹을 활성화할까요?`)) return;
    try {
      await activateCodeGroupApi(groupCode);
      await loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : "코드그룹 활성화 실패");
    }
  };

  const deactivateDetail = async (groupCode: string, code: string) => {
    if (!confirm(`${groupCode}/${code}를 비활성화할까요?`)) return;
    try {
      await deactivateCodeDetailApi(groupCode, code);
      await loadDetails();
    } catch (e) {
      alert(e instanceof Error ? e.message : "상세코드 비활성화 실패");
    }
  };

  const activateDetail = async (groupCode: string, code: string) => {
    if (!confirm(`${groupCode}/${code}를 활성화할까요?`)) return;
    try {
      await activateCodeDetailApi(groupCode, code);
      await loadDetails();
    } catch (e) {
      alert(e instanceof Error ? e.message : "상세코드 활성화 실패");
    }
  };

  const selectedGroupItem = groups.find((g) => g.groupCode === selectedGroup);
  const canCreateDetail = Boolean(selectedGroupItem?.isActive);

  return (
    <MainLayout>
      <Stack spacing={2.5}>
        <Typography variant="h5" fontWeight={900}>코드 관리 (그룹/상세)</Typography>
        {error && <Typography color="error">{error}</Typography>}

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography fontWeight={800}>코드그룹</Typography>
              <FormControlLabel
                control={<Switch checked={groupActiveOnly} onChange={(e) => setGroupActiveOnly(e.target.checked)} />}
                label="활성만"
              />
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GROUP_CODE</TableCell>
                  <TableCell>GROUP_NAME</TableCell>
                  <TableCell>EDITABLE</TableCell>
                  <TableCell>ACTIVE</TableCell>
                  <TableCell align="right">액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((g) => (
                  <TableRow
                    key={g.groupCode}
                    hover
                    selected={selectedGroup === g.groupCode}
                    onClick={() => setSelectedGroup(g.groupCode)}
                  >
                    <TableCell>{g.groupCode}</TableCell>
                    <TableCell>{g.groupName}</TableCell>
                    <TableCell>{g.editableYn ? "Y" : "N"}</TableCell>
                    <TableCell>{g.isActive ? "Y" : "N"}</TableCell>
                    <TableCell align="right">
                      {g.isActive ? (
                        <Button
                          size="small"
                          color="warning"
                          startIcon={<BlockOutlinedIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deactivateGroup(g.groupCode);
                          }}
                        >
                          비활성화
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            activateGroup(g.groupCode);
                          }}
                        >
                          활성화
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={800}>상세코드</Typography>
                <TextField
                  select
                  size="small"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  sx={{ minWidth: 220 }}
                >
                  <MenuItem value="">전체</MenuItem>
                  {groups.map((g) => (
                    <MenuItem key={g.groupCode} value={g.groupCode}>
                      {g.groupCode}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <FormControlLabel
                  control={<Switch checked={detailActiveOnly} onChange={(e) => setDetailActiveOnly(e.target.checked)} />}
                  label="활성만"
                />
                <Button variant="contained" onClick={openCreateDetail} disabled={!canCreateDetail}>추가</Button>
              </Stack>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GROUP_CODE</TableCell>
                  <TableCell>CODE</TableCell>
                  <TableCell>CODE_NAME</TableCell>
                  <TableCell>SORT_ORDER</TableCell>
                  <TableCell>ACTIVE</TableCell>
                  <TableCell>NOTE</TableCell>
                  <TableCell align="right">액션</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((d) => (
                  <TableRow key={`${d.groupCode}:${d.code}`} hover>
                    <TableCell>{d.groupCode}</TableCell>
                    <TableCell>{d.code}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.sortOrder}</TableCell>
                    <TableCell>{d.isActive ? "Y" : "N"}</TableCell>
                    <TableCell>{d.note ?? "-"}</TableCell>
                    <TableCell align="right">
                      {d.isActive ? (
                        <Button
                          size="small"
                          color="warning"
                          startIcon={<BlockOutlinedIcon />}
                          onClick={() => deactivateDetail(d.groupCode, d.code)}
                        >
                          비활성화
                        </Button>
                      ) : (
                        <Button size="small" color="success" onClick={() => activateDetail(d.groupCode, d.code)}>
                          활성화
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>상세코드 추가</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="GROUP_CODE" value={detailForm.groupCode} disabled fullWidth>
              {groups
                .filter((g) => g.isActive)
                .map((g) => (
                  <MenuItem key={g.groupCode} value={g.groupCode}>
                    {g.groupCode}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              label="CODE"
              value={detailForm.code}
              onChange={(e) => setDetailForm((p) => ({ ...p, code: e.target.value }))}
              fullWidth
            />
            <TextField
              label="CODE_NAME"
              value={detailForm.name}
              onChange={(e) => setDetailForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="SORT_ORDER"
              type="number"
              value={detailForm.sortOrder}
              onChange={(e) => setDetailForm((p) => ({ ...p, sortOrder: Number(e.target.value || 1) }))}
              fullWidth
            />
            <TextField
              label="NOTE"
              value={detailForm.note}
              onChange={(e) => setDetailForm((p) => ({ ...p, note: e.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={detailForm.isActive} onChange={(e) => setDetailForm((p) => ({ ...p, isActive: e.target.checked }))} />}
              label="활성"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>취소</Button>
          <Button variant="contained" onClick={saveDetail} disabled={loading}>저장</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}