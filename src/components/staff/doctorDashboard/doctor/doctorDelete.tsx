// "use client";



//나중에 의사 모닥삭제용으로 추가계획

// import { useEffect,  } from "react";

// import { useDispatch, useSelector } from "react-redux";
// import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Stack, Typography } from "@mui/material";


// import {
// deleteDoctorRequest,
// resetSuccessEnd,
// } from "@/features/staff/doctor/doctorSlice";
// import { RootState } from "@/store/rootReducer";


// type Props = {
//   open: boolean;
//   staffId: string | null;
//   onClose: () => void;
// };

//     const DoctorDelete = ({ open, staffId, onClose }: Props) => {
//     const dispatch = useDispatch();

//     const {  loading, error, deleteSuccess } = useSelector((state: RootState) => state.doctor);



//     const handleConfirmDelete = () => {
//       if (!staffId) return;
//       dispatch(deleteDoctorRequest({ staffId }));
//     };
  
//     useEffect(() => {
//       if (!deleteSuccess) return;
//       dispatch(resetSuccessEnd());
//       onClose();
//     }, [deleteSuccess, dispatch, onClose]);


//     return (
//     <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
//     <DialogTitle>의사 삭제</DialogTitle>

//         <DialogContent>
//         <DialogContentText sx={{ mb: 2 }}>
//         정말 삭제하시겠습니까?
//         </DialogContentText>

//         <Typography variant="body2" color="text.secondary">
//         staffId: {staffId ?? "-"}
//         </Typography>

//         {loading && <CircularProgress sx={{ mt: 2 }} />}

//         {error && (
//         <Alert severity="error" sx={{ mt: 2 }}>
//             {error}
//         </Alert>
//         )}
//         </DialogContent>

//         <DialogActions>
//         <Button onClick={onClose} disabled={loading}>
//         취소
//         </Button>
//         <Button
//         color="error"
//         variant="contained"
//         onClick={ handleConfirmDelete }
//         disabled={loading || !staffId}
//         >
//         삭제
//         </Button>
//         </DialogActions>
//         </Dialog>

// );
// };

// export default DoctorDelete;




