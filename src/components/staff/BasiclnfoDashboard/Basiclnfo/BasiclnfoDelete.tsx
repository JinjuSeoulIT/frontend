"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material";
import type { RootState } from "@/store/rootReducer";
import {
  deleteStaffRequest,
  resetSuccessEnd,
  StafflistRequest,
} from "@/features/staff/Basiclnfo/BasiclnfoSlict";
import { PropsOpen } from "@/features/staff/Basiclnfo/BasiclnfoType";

    //모달창 //공통 삭제
    const BasicInfoDelete = ({ open, staffId, onClose }: PropsOpen) => {

    const dispatch = useDispatch();
    const { deleteSuccess, loading, error } = useSelector((state: RootState) => state.staff);



    const handleConfirmDelete = () => {
      if (!staffId) return;
    dispatch(deleteStaffRequest( staffId ));
    };
  


    
    //모달창
    useEffect(() => {
    if (!deleteSuccess) return;
    onClose();
    
    dispatch(StafflistRequest());
    dispatch(resetSuccessEnd());
    }, [deleteSuccess, dispatch, onClose]);



    

        return (
        
        //Dialog 공통 삭제는 모달창 팝업 레이어 식으로 만듬
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
        <DialogTitle>직원 삭제</DialogTitle>

        <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
        정말 삭제하시겠습니까?
        </DialogContentText>

        <Typography variant="body2" color="text.secondary">
        staffId: {staffId ?? "-"}
        </Typography>

        {loading && <CircularProgress sx={{ mt: 2 }} />}

        </DialogContent>

        <DialogActions>
        <Button onClick={onClose} disabled={loading}>
        취소
        </Button>
        <Button
        color="error"
        variant="contained"
        onClick={ handleConfirmDelete }
        disabled={loading || !staffId}
        >
        삭제
        </Button>
        
        {error && (<Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>)}
        </DialogActions>
        </Dialog>
        );
        };

export default BasicInfoDelete;






