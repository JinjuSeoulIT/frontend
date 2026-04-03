"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  deleteReceptionRequest,
  resetReceptionSuccessEnd,
} from "@/features/staff/reception/receptionSlice";

  type Props = {
  open: boolean;
  staffId: number | null;
  onClose: () => void;
  };

  const ReceptionDelete = ({ open, staffId, onClose }: Props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, deleteSuccess, error } = useSelector((state: RootState) => state.reception);

  const handleClose = () => {
    onClose();
    router.replace("/staff/reception/list");
  };

  useEffect(() => {
    if (!deleteSuccess) return;
    dispatch(resetReceptionSuccessEnd());
    router.replace("/staff/reception/list");
  }, [deleteSuccess, dispatch, router]);

  const handleConfirmDelete = () => {
    if (!staffId) return;
    dispatch(deleteReceptionRequest({ staffId }));
  };

    return (
    <Dialog open={open} onClose={loading ? undefined : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>원무 직원 삭제</DialogTitle>
      <DialogContent>
      <DialogContentText sx={{ mb: 2 }}>정말 삭제하시겠습니까?</DialogContentText>
      <Typography variant="body2" color="text.secondary">staffId: {staffId ?? "-"}</Typography>
      
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>취소</Button>
        <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={loading || !staffId}>삭제</Button>
      </DialogActions>
    </Dialog>
  );
  };

export default ReceptionDelete;
