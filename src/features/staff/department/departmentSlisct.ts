import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DepartmentCreateRequest,
  DepartmentResponse,
  DepartmentUpdatePayload,
} from "./departmentType";

export interface DepartmentState {
  Departmentlist: DepartmentResponse[];
  Departmentdetail: DepartmentResponse | null;


  Departmencreate: DepartmentResponse | null;




  loading: boolean;
  error: string | null;
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
}

const initialState: DepartmentState = {
  Departmentlist: [],
  Departmentdetail: null,

  Departmencreate: null,


  loading: false,
  error: null,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    departmentListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    departmentListSuccess(state, action: PayloadAction<DepartmentResponse[]>) {
      state.loading = false;
      state.Departmentlist = action.payload;
    },
    departmentListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },


    
    departmentDetailRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
    },
    departmentDetailSuccess(state, action: PayloadAction<DepartmentResponse>) {
      state.loading = false;
      state.Departmentdetail = action.payload;
    },
    departmentDetailFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },




    departmentCreateRequest(state, _action: PayloadAction<DepartmentCreateRequest>) {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    
    },
    departmentCreateSuccess(state, action: PayloadAction<DepartmentResponse>) {
      state.loading = false;
      state.createSuccess = true;
      state.Departmencreate = action.payload;
    },
    departmentCreateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },







    departmentUpdateRequest(state, _action: PayloadAction<DepartmentUpdatePayload>) {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    departmentUpdateSuccess(state, action: PayloadAction<DepartmentResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.Departmentdetail = action.payload;
    },
    departmentUpdateFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    departmentDeleteRequest(state, _action: PayloadAction<string>) {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    },
    departmentDeleteSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;
    },
    departmentDeleteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    resetDepartmentState(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
  
      state.error = null;
    },
  },
});

export const {
  departmentListRequest,
  departmentListSuccess,
  departmentListFailure,
  departmentDetailRequest,
  departmentDetailSuccess,
  departmentDetailFailure,
  departmentCreateRequest,
  departmentCreateSuccess,
  departmentCreateFailure,
  departmentUpdateRequest,
  departmentUpdateSuccess,
  departmentUpdateFailure,
  departmentDeleteRequest,
  departmentDeleteSuccess,
  departmentDeleteFailure,
  resetDepartmentState,
} = departmentSlice.actions;

export default departmentSlice.reducer;
