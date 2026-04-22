import axios from "axios";
import { applyAuthInterceptors } from "@/lib/auth/apiInterceptors";
import { AUTH_API_BASE_URL } from "@/lib/common/env";

export type MentionTarget = {
  userId: string;
  loginId: string;
  name: string;
};

export type BoardDefinition = {
  boardId: string;
  boardCode: string;
  boardName: string;
  description: string;
  sortOrder: number;
  canWrite: boolean;
  canComment: boolean;
  allowImage: boolean;
};

export type BoardAttachment = {
  attachmentId: string;
  targetType: string;
  targetId: string;
  fileName: string;
  contentType: string | null;
  fileSize: number;
  image: boolean;
  contentUrl: string;
  createdAt: string | null;
};

export type BoardMention = {
  mentionId: string;
  mentionedUserId: string;
  mentionedLoginId: string;
  mentionedName: string;
  mentionText: string;
  createdAt: string | null;
};

export type BoardComment = {
  commentId: string;
  postId: string;
  parentCommentId: string | null;
  depth: number;
  content: string;
  authorUserId: string;
  authorLoginId: string;
  authorName: string;
  deleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
  attachments: BoardAttachment[];
  mentions: BoardMention[];
  replies: BoardComment[];
};

export type BoardPostSummary = {
  postId: string;
  boardId: string;
  boardCode: string;
  title: string;
  contentPreview: string | null;
  authorUserId: string;
  authorLoginId: string;
  authorName: string;
  notice: boolean;
  viewCount: number;
  commentCount: number;
  imageCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
};

export type BoardPostDetail = {
  postId: string;
  boardId: string;
  boardCode: string;
  boardName: string;
  title: string;
  content: string;
  authorUserId: string;
  authorLoginId: string;
  authorName: string;
  notice: boolean;
  viewCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
  attachments: BoardAttachment[];
  mentions: BoardMention[];
  comments: BoardComment[];
};

export type BoardCommentPage = {
  list: BoardComment[];
  totalCount: number;
  page: number;
  size: number;
};

export type BoardPostPage = {
  list: BoardPostSummary[];
  totalCount: number;
  page: number;
  size: number;
  board: BoardDefinition;
};

export type MentionCandidate = {
  userId: string;
  loginId: string;
  fullName: string;
  departmentId: string | null;
  departmentName: string | null;
  roleCode: string | null;
  dutyCode: string | null;
};

export type PostPayload = {
  title: string;
  content: string;
  notice: boolean;
  mentions: MentionTarget[];
  removeAttachmentIds?: string[];
};

export type CommentPayload = {
  content: string;
  parentCommentId?: string | null;
  mentions: MentionTarget[];
  removeAttachmentIds?: string[];
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  result: T;
};

const api = axios.create({
  // In the browser go through Next rewrites to avoid cross-origin requests.
  baseURL: typeof window === "undefined" ? AUTH_API_BASE_URL : "/api",
});

applyAuthInterceptors(api, { redirectOn401: true });

const toFormData = (payload: object, files?: File[]) => {
  const formData = new FormData();
  formData.append("payload", JSON.stringify(payload));
  (files ?? []).forEach((file) => formData.append("files", file));
  return formData;
};

export const fetchBoards = async () => {
  const response = await api.get<ApiResponse<BoardDefinition[]>>("/boards");
  return response.data.result ?? [];
};

export const fetchBoardPosts = async (boardCode: string, params?: { keyword?: string; page?: number; size?: number }) => {
  const response = await api.get<ApiResponse<BoardPostPage>>(`/boards/${boardCode}/posts`, {
    params,
  });
  return response.data.result;
};

export const fetchBoardPostDetail = async (boardCode: string, postId: string) => {
  const response = await api.get<ApiResponse<BoardPostDetail>>(`/boards/${boardCode}/posts/${postId}`);
  return response.data.result;
};

export const fetchBoardComments = async (boardCode: string, postId: string, params?: { page?: number; size?: number }) => {
  const response = await api.get<ApiResponse<BoardCommentPage>>(`/boards/${boardCode}/posts/${postId}/comments`, {
    params,
  });
  return response.data.result;
};

export const createBoardPost = async (boardCode: string, payload: PostPayload, files?: File[]) => {
  const response = await api.post<ApiResponse<BoardPostDetail>>(
    `/boards/${boardCode}/posts`,
    toFormData(payload, files),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.result;
};

export const updateBoardPost = async (boardCode: string, postId: string, payload: PostPayload, files?: File[]) => {
  const response = await api.put<ApiResponse<BoardPostDetail>>(
    `/boards/${boardCode}/posts/${postId}`,
    toFormData(payload, files),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.result;
};

export const deleteBoardPost = async (boardCode: string, postId: string) => {
  await api.delete(`/boards/${boardCode}/posts/${postId}`);
};

export const createBoardComment = async (boardCode: string, postId: string, payload: CommentPayload, files?: File[]) => {
  const response = await api.post<ApiResponse<BoardComment>>(
    `/boards/${boardCode}/posts/${postId}/comments`,
    toFormData(payload, files),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.result;
};

export const updateBoardComment = async (commentId: string, payload: CommentPayload, files?: File[]) => {
  const response = await api.put<ApiResponse<BoardComment>>(
    `/boards/comments/${commentId}`,
    toFormData(payload, files),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.result;
};

export const deleteBoardComment = async (commentId: string) => {
  await api.delete(`/boards/comments/${commentId}`);
};

export const searchMentionCandidates = async (keyword: string) => {
  if (!keyword.trim()) {
    return [] as MentionCandidate[];
  }
  const response = await api.get<ApiResponse<MentionCandidate[]>>(`/boards/mentions/candidates`, {
    params: { keyword },
  });
  return response.data.result ?? [];
};
