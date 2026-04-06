import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  DoctorCreateRequest,
  DoctorFile,
  DoctorStaffIdParam,
  DoctorResponse,
  DoctorUpdateNumber,
  FileUploadResDTO,
  DoctorIdNumber,
  SearchDoctorPayload,

} from "./doctortypes";

export interface DoctorState {
  // 목록
  doctorList   : DoctorResponse[];
  doctorSearch : DoctorResponse[];

  //
  doctorDetail:  DoctorResponse | null;
  doctorCreated: DoctorResponse | null;
  doctorUpdated: DoctorResponse | null;

  // 성공 액션
  createSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;


  loading: boolean;
  error:   string | null;
  SuccessEnd : boolean;


  //메타데이터용 업로드
  uploaded:        FileUploadResDTO | null;   // 업로드 결과 전체
  uploadLoading:   boolean;
  uploadSuccess:      boolean;                   // 1회성 성공 
  uploadedFileUrl: string | null;             // 화면에서 바로 쓰기 좋은 URL
}

const initialState: DoctorState = {
  doctorList:   [],
  doctorSearch: [],



  doctorDetail: null,
  doctorCreated: null,
  doctorUpdated: null,


  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,


  loading: false,
  error: null,
  SuccessEnd : false,



  uploaded: null,
  uploadLoading: false,
  uploadSuccess: false,
  uploadedFileUrl: null,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    
    //검색
    searchDoctorListRequest(state, action: PayloadAction<SearchDoctorPayload>) {
      state.loading = true;
      state.error = null;
    },
    searchDoctorListSuccess(state, action: PayloadAction<DoctorResponse[]>) {
      state.loading = false;
      state.doctorSearch = action.payload;
    },
    searchDoctorListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    
    //목록
    DoctorListRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    DoctorListSuccess: (state, action: PayloadAction<DoctorResponse[]>) => {
      state.loading = false;
      state.doctorList = action.payload;
    },
    DoctorListFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    //상세
    DetailDoctorRequest: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    DetailDoctorSuccess: (state,action: PayloadAction<DoctorResponse>) => {
      state.loading = false;
      state.doctorDetail = action.payload;
    },
    DetailDoctorFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    //생성
    //“컴포넌트에서  디스패치하면서 실어 보내는 요청 데이터”
    createDoctorRequest: (state,action: PayloadAction<DoctorCreateRequest>) => {
      state.loading = true;
      state.error = null;
    },
     //“서버에서 응답으로 받을 데이터”
    createDoctorSuccess: (state, action: PayloadAction<DoctorResponse>) => {
      state.loading = false;
      state.createSuccess = true;
      state.doctorCreated = action.payload;  //데이터 
    },
    createDoctorFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },


    //수정
    updateDoctorRequest: (state,action: PayloadAction<DoctorUpdateNumber>) => {
      state.loading = true;
      state.error = null;
    },
    updateDoctorSuccess: (state, action: PayloadAction<DoctorResponse>) => {
      state.loading = false;
      state.updateSuccess = true;
      state.doctorUpdated = action.payload;
    
    },
    updateDoctorFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    //삭제
    deleteDoctorRequest: (state,action: PayloadAction<DoctorIdNumber>) => {
      state.loading = true;
      state.error = null;
    },
    deleteDoctorSuccess: (state) => {
      state.loading = false;
      state.deleteSuccess = true; // ✅ 성공시 액션 
    },
    deleteDoctorFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.deleteSuccess = false;
      state.error = action.payload;
      
    },

    //업로드  (메타데이터)
    uploadDoctorFileRequest: (state,_action: PayloadAction<DoctorFile>) => {
      state.uploadLoading = true;
      state.error = null;

      state.uploadSuccess = false;
      state.uploaded = null;
      state.uploadedFileUrl = null;
    },
    uploadDoctorFileSuccess: (state,action: PayloadAction<FileUploadResDTO>) => {
      state.uploadLoading = false;
      state.uploadSuccess = true;
      state.uploaded = action.payload;
      // ✅ (미리보기용)
      state.uploadedFileUrl = action.payload.fileUrl;
    },
    uploadDoctorFileFailure: (state, action: PayloadAction<string>) => {
      state.uploadLoading = false;
      state.error = action.payload;
      state.uploadedFileUrl = null;
      state.uploadSuccess = false;
    },


     //리랜더링 끄기용 액션용
    resetSuccessEnd: (state) => {
      state.SuccessEnd = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.uploadSuccess = false;
    }
  },
});

export const {
  searchDoctorListRequest,
  searchDoctorListSuccess,
  searchDoctorListFailure,

  // 목록
  DoctorListRequest,
  DoctorListSuccess,
  DoctorListFailure,

  // 상세
  DetailDoctorRequest,
  DetailDoctorSuccess,
  DetailDoctorFailure,

  // 생성
  createDoctorRequest,
  createDoctorSuccess,
  createDoctorFailure,

  // 수정
  updateDoctorRequest,
  updateDoctorSuccess,
  updateDoctorFailure,

  // 삭제
  deleteDoctorRequest,
  deleteDoctorSuccess,
  deleteDoctorFailure,

  // 업로드
  uploadDoctorFileRequest,
  uploadDoctorFileSuccess,
  uploadDoctorFileFailure,

  resetSuccessEnd,

} = doctorSlice.actions;

export default doctorSlice.reducer;