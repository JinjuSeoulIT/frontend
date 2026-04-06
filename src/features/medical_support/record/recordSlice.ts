import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RecordFormType } from "@/features/medical_support/record/recordTypes";

const initialRecord: RecordFormType = {
  recordId: "",
  nursingId: "",
  visitId: "",
  recordedAt: "",
  systolicBp: "",
  diastolicBp: "",
  pulse: "",
  respiration: "",
  temperature: "",
  spo2: "",
  observation: "",
  painScore: "",
  consciousnessLevel: "",
  initialAssessment: "",
  status: "",
  createdAt: "",
  updatedAt: "",

  patientName: "",
  nurseName: "",
  departmentName: "",
  heightCm: "",
  weightKg: "",
};

interface RecordState {
  list: RecordFormType[];
  loading: boolean;
  error: string | null;
  selected: RecordFormType;
  deleteSuccess: boolean;
  updateSuccess: boolean;
  statusToggleSuccess: boolean;
  createSuccess: boolean;
}

const initialState: RecordState = {
  list: [],
  loading: false,
  error: null,
  selected: initialRecord,
  deleteSuccess: false,
  updateSuccess: false,
  statusToggleSuccess: false,
  createSuccess: false,
};

const recordSlice = createSlice({
  name: "records",
  initialState,
  reducers: {
    // ===== 목록 조회 =====
    fetchRecordsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRecordsSuccess: (state, action: PayloadAction<RecordFormType[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
    fetchRecordsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ===== 단건 조회 =====
    fetchRecordRequest: (state, action: PayloadAction<string>) => {
      void action;
      state.loading = true;
      state.error = null;
      state.selected = initialRecord;
    },
    fetchRecordSuccess: (state, action: PayloadAction<RecordFormType>) => {
      state.loading = false;
      state.selected = action.payload;
    },
    fetchRecordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ===== 생성 =====
createRecordRequest: (state, action: PayloadAction<RecordFormType>) => {
  void action;
  state.loading = true;
  state.error = null;
  state.createSuccess = false;
},
createRecordSuccess: (state) => {
  state.loading = false;
  state.createSuccess = true;
},
createRecordFailure: (state, action: PayloadAction<string>) => {
  state.loading = false;
  state.error = action.payload;
  state.createSuccess = false;
},
resetCreateSuccess: (state) => {
  state.createSuccess = false;
},
    // ===== 수정 =====
    updateRecordRequest: (
      state,
      action: PayloadAction<{ recordId: string; form: RecordFormType }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateRecordSuccess: (state) => {
      state.loading = false;
      state.updateSuccess = true;
    },
    updateRecordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },

    // ===== 상태 변경 =====
    toggleRecordStatusRequest: (
      state,
      action: PayloadAction<{
        recordId: string;
        status: "ACTIVE" | "INACTIVE";
      }>
    ) => {
      void action;
      state.loading = true;
      state.error = null;
      state.statusToggleSuccess = false;
    },
    toggleRecordStatusSuccess: (
      state,
      action: PayloadAction<RecordFormType>
    ) => {
      state.loading = false;
      state.statusToggleSuccess = true;
      state.selected = action.payload;

      state.list = state.list.map((item) =>
        item.recordId === action.payload.recordId ? action.payload : item
      );
    },
    toggleRecordStatusFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.statusToggleSuccess = false;
    },
    resetStatusToggleSuccess: (state) => {
      state.statusToggleSuccess = false;
    },

    // ===== 검색 =====
  searchRecordsRequest: (
  state,
  action: PayloadAction<{
    searchType: string;
    searchValue?: string;
    startDate?: string;
    endDate?: string;
  }>
) => {
  void action;
  state.loading = true;
  state.error = null;
},

searchRecordsSuccess: (state, action: PayloadAction<RecordFormType[]>) => {
  state.loading = false;
  state.list = action.payload;
},

searchRecordsFailure: (state, action: PayloadAction<string>) => {
  state.loading = false;
  state.error = action.payload;
},
  },
});

export const RecActions = recordSlice.actions;
export default recordSlice.reducer;
