import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { STAFF_API_BASE_URL } from "@/lib/common/env";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result?: T;
  data?: T;
};

export type StaffRoleFilter = "doctor" | "nurse" | "staff" | "admin" | "reception";

export type StaffKeywordCondition = "all" | "name" | "phone" | "staffid";

export type StaffSearchParams = {
  keyword?: string;
  keywordCondition?: StaffKeywordCondition;
  role?: StaffRoleFilter | "";
  departmentId?: string | "";
  locationId?: number | "";
  page?: number;
  size?: number;
};

export type StaffSummaryItem = {
  staffId: number | string | null;
  accountId: string | null;
  username: string | null;
  fullName: string | null;
  roleCode: string | null;
  staffType: string | null;
  jobTitle: string | null;
  jobTitleLabel: string | null;
  statusCode: string | null;
  employmentStatus: string | null;
  departmentCode: string | null;
  departmentId: string | null;
  departmentName: string | null;
  locationId: number | null;
  officeLocation: string | null;
  locationName: string | null;
  locationDisplayName: string | null;
  positionTitle: string | null;
  phone: string | null;
  email: string | null;
};

type StaffSummaryItemRaw = Partial<{
  staffId: number | string | null;
  id: number | string | null;
  fullName: string | null;
  name: string | null;
  username: string | null;
  staffType: string | null;
  jobTitle: string | null;
  jobTitleLabel: string | null;
  roleCode: string | null;
  employmentStatus: string | null;
  statusCode: string | null;
  departmentId: number | string | null;
  deptId: number | string | null;
  departmentName: string | null;
  deptName: string | null;
  locationId: number | null;
  locationName: string | null;
  locationDisplayName: string | null;
  officeLocation: string | null;
  phone: string | null;
  email: string | null;
  contact: string | null;
  positionTitle: string | null;
}>;

type StaffSummaryPageRaw = Partial<{
  totalCount: number | string | null;
  totalElements: number | string | null;
  page: number | string | null;
  size: number | string | null;
  list: StaffSummaryItemRaw[] | null;
  content: StaffSummaryItemRaw[] | null;
  items: StaffSummaryItemRaw[] | null;
}>;

export type StaffSummaryPage = {
  totalCount: number;
  page: number;
  size: number;
  list: StaffSummaryItem[];
};

export type StaffDepartmentSummaryItem = {
  departmentId: string | null;
  departmentName: string | null;
  activeFlag: string | null;
};

type StaffDepartmentSummaryItemRaw = Partial<{
  departmentId: number | string | null;
  deptId: number | string | null;
  departmentName: string | null;
  deptName: string | null;
  activeFlag: string | null;
  status: string | null;
}>;

export type StaffLocationSummaryItem = {
  locationId: number | null;
  locationCode: string | null;
  locationName: string | null;
  locationType: string | null;
  departmentId: number | null;
  activeFlag: string | null;
  buildingName: string | null;
  floorNo: string | null;
  roomNo: string | null;
  locationDisplayName: string | null;
};

const api = axios.create({
  baseURL: STAFF_API_BASE_URL,
});

applyAuthInterceptors(api, { redirectOn401: false });

const normalizeMessage = (message: string | undefined, fallback: string) =>
  (message ?? "").trim() || fallback;

const toNullableString = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return String(value);
};

const normalizeIdentifier = (value: unknown): string | null => {
  if (value == null || value === "") {
    return null;
  }
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeCount = (value: unknown, fallback = 0): number => {
  if (value == null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizeStaffSummaryItem = (raw: StaffSummaryItemRaw): StaffSummaryItem => {
  const roleCode = toNullableString(raw.roleCode);
  const positionTitle = toNullableString(raw.positionTitle);

  return {
    staffId: raw.staffId ?? raw.id ?? null,
    accountId: toNullableString(raw.id),
    username: toNullableString(raw.username),
    fullName:
      toNullableString(raw.fullName) ??
      toNullableString(raw.name) ??
      toNullableString(raw.username),
    roleCode,
    staffType: toNullableString(raw.staffType),
    jobTitle: toNullableString(raw.jobTitle) ?? roleCode,
    jobTitleLabel: toNullableString(raw.jobTitleLabel) ?? positionTitle ?? roleCode,
    statusCode: toNullableString(raw.statusCode),
    employmentStatus: toNullableString(raw.employmentStatus) ?? toNullableString(raw.statusCode),
    departmentCode: toNullableString(raw.deptId),
    departmentId: normalizeIdentifier(raw.departmentId ?? raw.deptId),
    departmentName: toNullableString(raw.departmentName) ?? toNullableString(raw.deptName),
    locationId: raw.locationId ?? null,
    officeLocation: toNullableString(raw.officeLocation),
    locationName: toNullableString(raw.locationName) ?? toNullableString(raw.officeLocation),
    locationDisplayName:
      toNullableString(raw.locationDisplayName) ?? toNullableString(raw.officeLocation),
    positionTitle,
    phone: toNullableString(raw.phone) ?? toNullableString(raw.contact),
    email: toNullableString(raw.email),
  };
};

const toParams = (params?: StaffSearchParams) => {
  const next: Record<string, string | number> = {};
  if (!params) {
    return next;
  }
  const keyword = (params.keyword ?? "").trim();
  next.keyword = keyword;
  next.keywordCondition = keyword ? params.keywordCondition ?? "all" : "all";
  if (params.role) {
    next.role = params.role;
  }
  if (params.departmentId !== "" && params.departmentId != null) {
    next.departmentId = params.departmentId;
  }
  if (params.locationId !== "" && params.locationId != null) {
    next.locationId = params.locationId;
  }
  if (params.page != null) {
    next.page = params.page;
  }
  if (params.size != null) {
    next.size = params.size;
  }
  return next;
};

const normalizeStaffSummaryPage = (
  raw: StaffSummaryPageRaw | StaffSummaryItemRaw[] | null | undefined,
  requestedPage: number,
  requestedSize: number
): StaffSummaryPage => {
  if (Array.isArray(raw)) {
    const list = raw.map(normalizeStaffSummaryItem);
    return {
      totalCount: list.length,
      page: requestedPage,
      size: requestedSize,
      list,
    };
  }

  const listRaw = raw?.list ?? raw?.content ?? raw?.items ?? [];
  const list = Array.isArray(listRaw) ? listRaw.map(normalizeStaffSummaryItem) : [];
  const totalCount = normalizeCount(
    raw?.totalCount ?? raw?.totalElements,
    list.length
  );

  return {
    totalCount,
    page: normalizeCount(raw?.page, requestedPage),
    size: normalizeCount(raw?.size, requestedSize),
    list,
  };
};

const normalizeDepartmentSummaryItem = (
  raw: StaffDepartmentSummaryItemRaw
): StaffDepartmentSummaryItem => ({
  departmentId: normalizeIdentifier(raw.departmentId ?? raw.deptId),
  departmentName: toNullableString(raw.departmentName) ?? toNullableString(raw.deptName),
  activeFlag: toNullableString(raw.activeFlag) ?? toNullableString(raw.status),
});

const unwrapListPayload = <T>(
  value:
    | T[]
    | {
        list?: T[] | null;
        content?: T[] | null;
        items?: T[] | null;
      }
    | null
    | undefined
): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.list)) {
    return value.list;
  }

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  return [];
};

const normalizeDepartmentSummaryList = (
  items:
    | StaffDepartmentSummaryItemRaw[]
    | {
        list?: StaffDepartmentSummaryItemRaw[] | null;
        content?: StaffDepartmentSummaryItemRaw[] | null;
        items?: StaffDepartmentSummaryItemRaw[] | null;
      }
    | null
    | undefined
): StaffDepartmentSummaryItem[] => {
  const source = unwrapListPayload(items);
  const seen = new Set<string>();
  const normalized: StaffDepartmentSummaryItem[] = [];

  for (const item of source) {
    const next = normalizeDepartmentSummaryItem(item);
    const key = `${next.departmentId ?? "null"}|${next.departmentName ?? ""}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    normalized.push(next);
  }

  return normalized;
};

export const fetchStaffSummaryApi = async (
  params?: StaffSearchParams
): Promise<StaffSummaryPage> => {
  const requestedPage = params?.page ?? 0;
  const requestedSize = params?.size ?? 50;
  const res = await api.post<ApiResponse<StaffSummaryPageRaw | StaffSummaryItemRaw[]>>(
    "/api/staff",
    toParams({
      ...params,
      page: requestedPage,
      size: requestedSize,
    })
  );
  if (!res.data.success) {
    throw new Error(normalizeMessage(res.data.message, "Failed to load staff list"));
  }
  return normalizeStaffSummaryPage(
    res.data.result ?? res.data.data,
    requestedPage,
    requestedSize
  );
};

export const fetchStaffDepartmentSummaryApi = async (): Promise<StaffDepartmentSummaryItem[]> => {
  const res = await api.get<
    ApiResponse<
      | StaffDepartmentSummaryItemRaw[]
      | {
          list?: StaffDepartmentSummaryItemRaw[] | null;
          content?: StaffDepartmentSummaryItemRaw[] | null;
          items?: StaffDepartmentSummaryItemRaw[] | null;
        }
    >
  >("/api/staff/departments");
  if (!res.data.success) {
    throw new Error(normalizeMessage(res.data.message, "Failed to load departments"));
  }
  return normalizeDepartmentSummaryList(res.data.result ?? res.data.data);
};

export const fetchStaffLocationSummaryApi = async (): Promise<StaffLocationSummaryItem[]> => {
  const res = await api.get<
    ApiResponse<
      | StaffLocationSummaryItem[]
      | {
          list?: StaffLocationSummaryItem[] | null;
          content?: StaffLocationSummaryItem[] | null;
          items?: StaffLocationSummaryItem[] | null;
        }
    >
  >("/api/staff/locations");
  if (!res.data.success) {
    throw new Error(normalizeMessage(res.data.message, "Failed to load locations"));
  }
  return unwrapListPayload(res.data.result ?? res.data.data);
};
