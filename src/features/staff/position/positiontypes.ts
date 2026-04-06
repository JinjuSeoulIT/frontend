export type PositionResponse = {
  positionId: string;
  positionType: string;
  positionCode: string;
  positionLevel?: string;
  positionName: string;
  managerYn?: string;
  rmk?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PositionIdParam = {
  positionId: string;
};

export type PositionRequest = {
  positionId: string;
  positionType: string;
  positionCode: string;
  positionLevel: string;
  positionName: string;
  managerYn: string;
  rmk: string;
};

export const initialPositionForm: PositionRequest = {
  positionId: "",
  positionType: "",
  positionCode: "",
  positionLevel: "",
  positionName: "",
  managerYn: "N",
  rmk: "",
};

export type PositionUpdatePayload = {
  positionId: string;
  positionReq: PositionRequest;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
