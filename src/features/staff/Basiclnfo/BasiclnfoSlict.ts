import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SearchStaffPayload,
  staffCreateRequest,
  staffIdnNumber,
  staffResponse,
} from "./BasiclnfoType";

type StaffState = {
  Stafflist: staffResponse[];
  StaffSearch: staffResponse[];


  Staffcreate: staffResponse | null;
  StaffUpdate: staffResponse | null;
  StaffDetail: staffResponse | null;

  createSuccess: boolean;
  deleteSuccess: boolean;
  updateSuccess: boolean;

  loading: boolean;
  error: string | null;
  SuccessEnd : boolean;


  BasiclnfoCreate: staffCreateRequest | null;

};

const initialState: StaffState = {
  Stafflist:   [],
  StaffSearch: [],

  Staffcreate: null,
  StaffUpdate: null,
  StaffDetail: null,

  createSuccess: false,
  deleteSuccess: false,
  updateSuccess: false,

  loading: false,
  error: null,
  SuccessEnd : false,


  BasiclnfoCreate: null,

};

const StaffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {

        //검색
        //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”
    searchStaffListRequest(state, action: PayloadAction<SearchStaffPayload>) {
      state.loading = true;
      state.error = null;
    },
        //“서버에서 응답으로 받을 데이터”
    searchStaffListSuccess(state, action: PayloadAction<staffResponse[]>) {
      state.loading = false;  //// ✅ 성공시 액션 
      state.StaffSearch = action.payload;  
    },
    searchStaffListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },




    StafflistRequest(state) {
      state.loading = true;
      state.error = null;
    },
    StafflistSuccess(state, action: PayloadAction<staffResponse[]>) {
      state.loading = false;
      state.Stafflist = action.payload;
    },
    StafflistFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },



    DetailStaffRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
      state.StaffDetail = null;
    },
    DetailStaffSuccess(state, action: PayloadAction<staffResponse>) {
      state.loading = false;
      state.StaffDetail = action.payload;
    },
    DetailStaffFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    createStaffRequest(state, _action: PayloadAction<staffCreateRequest>) {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createStaffSuccess(state, action: PayloadAction<staffResponse>) {
      state.loading = false;
      state.createSuccess = true;
      state.Staffcreate = action.payload;
    },
    createStaffFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    updateStaffRequest(state, _action: PayloadAction<staffIdnNumber>) {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateStaffSuccess(state, action: PayloadAction<staffResponse>) {
      state.loading = false;
      state.updateSuccess = true;
      state.StaffUpdate = action.payload;
    },
    updateStaffFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },



    deleteStaffRequest(state, _action: PayloadAction<number>) {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    },
    deleteStaffSuccess(state) {
      state.loading = false;
      state.deleteSuccess = true;

    },

    deleteStaffFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.deleteSuccess = false;
    },

    //초기화용
    resetSuccessEnd(state) {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.SuccessEnd = false;
    },
 
    //의사 리두서 임시저장용
    BasiclnfoDraft(state, action: PayloadAction<staffCreateRequest>) {
    state.BasiclnfoCreate = action.payload;
},
    clearBasicDraft(state) {
    state.BasiclnfoCreate = null;
},


  },
});

export const {
  searchStaffListRequest,
  searchStaffListSuccess,
  searchStaffListFailure,

  StafflistRequest,
  StafflistSuccess,
  StafflistFailure,

  DetailStaffRequest,
  DetailStaffSuccess,
  DetailStaffFailure,

  createStaffRequest,
  createStaffSuccess,
  createStaffFail,

  updateStaffRequest,
  updateStaffSuccess,
  updateStaffFailure,

  deleteStaffRequest,
  deleteStaffSuccess,
  deleteStaffFailure,

  resetSuccessEnd,

  BasiclnfoDraft,
  clearBasicDraft,

} = StaffSlice.actions;

export default StaffSlice.reducer;
