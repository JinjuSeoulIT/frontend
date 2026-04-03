import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  FileUploadResDTO,
  NurseCreateRequest,
  NurseFile,
  NurseResponse,
  NurseUpdateNumber,
  NurseIdNumber,
  SearchNursePayload,
} from "./nurseTypes";

export interface NurseState {
  nurselist: NurseResponse[];
  nurseSearch : NurseResponse[];



  nurseDetail: NurseResponse | null;
  nursecreated: NurseResponse | null;
  nurseupdated: NurseResponse | null;
  updateSuccess: boolean;
  createSuccess: boolean;
  deleteSuccess: boolean;
  loading: boolean;
  error: string | null;
  SuccessEnd: boolean;
  uploaded: FileUploadResDTO | null;
  uploadLoading: boolean;
  uploadSuccess: boolean;
  uploadedFileUrl: string | null;
}

const initialState: NurseState = {
  nurselist:    [],
  nurseSearch : [],


  nurseDetail: null,
  nursecreated: null,
  nurseupdated: null,
  updateSuccess: false,
  createSuccess: false,
  deleteSuccess: false,
  loading: false,
  error: null,
  SuccessEnd: false,
  uploaded: null,
  uploadLoading: false,
  uploadSuccess: false,
  uploadedFileUrl: null,
};

const nurseSlice = createSlice({
  name: "nurse",
  initialState,
  reducers: {

    //검색
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”
    searchNurseListRequest(state, action: PayloadAction<SearchNursePayload>) {
      state.loading = true;
      state.error = null;
    },
    //“서버에서 응답으로 받을 데이터”
    searchNurseListSuccess(state, action: PayloadAction<NurseResponse[]>) {
      state.loading = false;  //// ✅ 성공시 액션 
      state.nurseSearch = action.payload;  
    },
    searchNurseListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    //리스트
    nurselistRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    nurselistSuccess: (state, action: PayloadAction<NurseResponse[]>) => {
      state.loading = false;
      state.nurselist = action.payload;
    },
    nurselistFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    //상세
    DetailNurseRequest: (state, action: PayloadAction<NurseIdNumber>) => {
      state.loading = true;
      state.error = null;
    },
    DetailNurseSuccess: (state, action: PayloadAction<NurseResponse>) => {
      state.loading = false;
      state.nurseDetail = action.payload;
    },
    DetailNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    //생성
    createNurseRequest: (state, action: PayloadAction<NurseCreateRequest>) => {
      state.loading = true;
      state.error = null;
    },
    createNurseSuccess: (state, action: PayloadAction<NurseResponse>) => {
      state.loading = false;
      state.createSuccess = true;
      state.nursecreated = action.payload;
    },
    createNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    //수정
    updateNursedRequest: (state, action: PayloadAction<NurseUpdateNumber>) => {
      state.loading = true;
      state.error = null;
    },
    updateNurseSuccess: (state, action: PayloadAction<NurseResponse>) => {
      state.loading = false;
      state.updateSuccess = true;
      state.nurseupdated = action.payload;
    },
    updateNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    //삭제
    deleteNurseRequest: (state, action: PayloadAction<NurseIdNumber>) => {
      state.loading = true;
      state.error = null;
    },
    deleteNurseSuccess: (state) => {
      state.loading = false;
      state.deleteSuccess = true;
    },
    deleteNurseFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    //업로드
    uploadNurseFileRequest: (state, action: PayloadAction<NurseFile>) => {
      state.uploadLoading = true;
      state.error = null;
      state.uploadSuccess = false;
      state.uploaded = null;
      state.uploadedFileUrl = null;
    },
    uploadNurseFileSuccess: (state, action: PayloadAction<FileUploadResDTO>) => {
      state.uploadLoading = false;
      state.uploadSuccess = true;
      state.uploaded = action.payload;
      state.uploadedFileUrl = action.payload.fileUrl;
    },
    uploadNurseFileFailure: (state, action: PayloadAction<string>) => {
      state.uploadLoading = false;
      state.error = action.payload;
      state.uploadedFileUrl = null;
      state.uploadSuccess = false;
    },
    //초기화
    resetSuccessEnd: (state) => {
      state.SuccessEnd = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.uploadSuccess = false;
    },
  },
});

export const {
  searchNurseListRequest,
  searchNurseListSuccess,
  searchNurseListFailure,
  nurselistRequest,
  nurselistSuccess,
  nurselistFailure,
  DetailNurseRequest,
  DetailNurseSuccess,
  DetailNurseFailure,
  createNurseRequest,
  createNurseSuccess,
  createNurseFailure,
  updateNursedRequest,
  updateNurseSuccess,
  updateNurseFailure,
  deleteNurseRequest,
  deleteNurseSuccess,
  deleteNurseFailure,
  uploadNurseFileRequest,
  uploadNurseFileSuccess,
  uploadNurseFileFailure,
  resetSuccessEnd,
} = nurseSlice.actions;

export default nurseSlice.reducer;
