export type LocationResponse = {
  deptId: string;
  buildingName: string;
  floorNo: string;
  roomNo: string;
  dayPhone?: string;
  nightPhone?: string;
  mainPhone?: string;
  locationDesc?: string;
};

export type LocationIdParam = {
  deptId: string;
};

export type LocationCreateRequest = {
  deptId: string;
  buildingName: string;
  floorNo: string;
  roomNo: string;
  dayPhone: string;
  nightPhone: string;
  mainPhone: string;
  locationDesc: string;
};

export const initialLocationCreateForm: LocationCreateRequest = {
  deptId: "",
  buildingName: "",
  floorNo: "",
  roomNo: "",
  dayPhone: "",
  nightPhone: "",
  mainPhone: "",
  locationDesc: "",
};

export type LocationUpdateRequest = {
  buildingName: string;
  floorNo: string;
  roomNo: string;
  dayPhone: string;
  nightPhone: string;
  mainPhone: string;
  locationDesc: string;
};

export const initialLocationUpdateForm: LocationUpdateRequest = {
  buildingName: "",
  floorNo: "",
  roomNo: "",
  dayPhone: "",
  nightPhone: "",
  mainPhone: "",
  locationDesc: "",
};

export type LocationUpdatePayload = {
  deptId: string;
  locationReq: LocationUpdateRequest;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
