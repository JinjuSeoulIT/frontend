"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import { useRouter } from "next/navigation";
import MentionTextArea from "@/components/board/MentionTextArea";
import {
  type BoardAttachment,
  type BoardComment,
  type BoardDefinition,
  type BoardPostDetail,
  type CommentPayload,
  type MentionTarget,
  type PostPayload,
  createBoardComment,
  deleteBoardComment,
  deleteBoardPost,
  fetchBoardComments,
  fetchBoardPostDetail,
  fetchBoards,
  updateBoardComment,
  updateBoardPost,
} from "@/lib/board/boardApi";

type Props = {
  boardCode: string;
  postId: string;
};

type PostFormState = {
  title: string;
  content: string;
  notice: boolean;
  mentions: MentionTarget[];
  files: File[];
  removeAttachmentIds: string[];
};

type CommentFormState = {
  content: string;
  mentions: MentionTarget[];
  files: File[];
  removeAttachmentIds: string[];
  parentCommentId: string | null;
  editingCommentId: string | null;
};

const COMMENT_PAGE_SIZE = 20;

const emptyPostForm = (): PostFormState => ({
  title: "",
  content: "",
  notice: false,
  mentions: [],
  files: [],
  removeAttachmentIds: [],
});

const emptyCommentForm = (): CommentFormState => ({
  content: "",
  mentions: [],
  files: [],
  removeAttachmentIds: [],
  parentCommentId: null,
  editingCommentId: null,
});

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const pickMentionsStillPresent = (text: string, mentions: MentionTarget[]) =>
  mentions.filter((mention) => text.includes(`@${mention.name}`));

const toPreviewAttachment = (file: File, index: number, targetType: "POST" | "COMMENT"): BoardAttachment => ({
  attachmentId: `new-${targetType}-${index}`,
  targetType,
  targetId: "NEW",
  fileName: file.name,
  contentType: file.type,
  fileSize: file.size,
  image: true,
  contentUrl: URL.createObjectURL(file),
  createdAt: null,
});

const flattenComments = (comments: BoardComment[]) => comments.flatMap((comment) => [comment, ...comment.replies]);

export default function BoardPostDetailPageClient({ boardCode, postId }: Props) {
  const router = useRouter();
  const [board, setBoard] = React.useState<BoardDefinition | null>(null);
  const [detail, setDetail] = React.useState<BoardPostDetail | null>(null);
  const [comments, setComments] = React.useState<BoardComment[]>([]);
  const [commentPage, setCommentPage] = React.useState(0);
  const [commentTotalCount, setCommentTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [commentsLoading, setCommentsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [postForm, setPostForm] = React.useState<PostFormState>(emptyPostForm);
  const [commentForm, setCommentForm] = React.useState<CommentFormState>(emptyCommentForm);
  const [submitting, setSubmitting] = React.useState(false);

  const loadBoards = React.useCallback(async () => {
    const result = await fetchBoards();
    const found = result.find((item) => item.boardCode.toLowerCase() === boardCode.toLowerCase()) ?? null;
    setBoard(found);
  }, [boardCode]);

  const loadDetail = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBoardPostDetail(boardCode, postId);
      setDetail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [boardCode, postId]);

  const loadComments = React.useCallback(async () => {
    setCommentsLoading(true);
    setError(null);
    try {
      const result = await fetchBoardComments(boardCode, postId, { page: commentPage, size: COMMENT_PAGE_SIZE });
      setComments(result.list);
      setCommentTotalCount(result.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 불러오지 못했습니다.");
    } finally {
      setCommentsLoading(false);
    }
  }, [boardCode, postId, commentPage]);

  React.useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  React.useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  React.useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const openEditPost = () => {
    if (!detail) return;
    setPostForm({
      title: detail.title,
      content: detail.content,
      notice: detail.notice,
      mentions: detail.mentions.map((mention) => ({
        userId: mention.mentionedUserId,
        loginId: mention.mentionedLoginId,
        name: mention.mentionedName,
      })),
      files: [],
      removeAttachmentIds: [],
    });
    setEditorOpen(true);
  };

  const closeEditPost = () => {
    setEditorOpen(false);
    setPostForm(emptyPostForm());
  };

  const submitPost = async () => {
    if (!detail) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: PostPayload = {
        title: postForm.title,
        content: postForm.content,
        notice: postForm.notice,
        mentions: pickMentionsStillPresent(postForm.content, postForm.mentions),
        removeAttachmentIds: postForm.removeAttachmentIds,
      };
      const result = await updateBoardPost(boardCode, detail.postId, payload, postForm.files);
      setDetail(result);
      closeEditPost();
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!detail) return;
    if (!window.confirm("게시글을 삭제하시겠습니까?")) return;
    await deleteBoardPost(boardCode, detail.postId);
    router.push(`/board/${boardCode}`);
  };

  const submitComment = async () => {
    if (!detail) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: CommentPayload = {
        content: commentForm.content,
        parentCommentId: commentForm.parentCommentId,
        mentions: pickMentionsStillPresent(commentForm.content, commentForm.mentions),
        removeAttachmentIds: commentForm.removeAttachmentIds,
      };
      if (commentForm.editingCommentId) {
        await updateBoardComment(commentForm.editingCommentId, payload, commentForm.files);
      } else {
        await createBoardComment(boardCode, detail.postId, payload, commentForm.files);
      }
      setCommentForm(emptyCommentForm());
      await Promise.all([loadDetail(), loadComments()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const beginReply = (comment: BoardComment) => {
    setCommentForm({
      content: `@${comment.authorName} `,
      mentions: [
        {
          userId: comment.authorUserId,
          loginId: comment.authorLoginId,
          name: comment.authorName,
        },
      ],
      files: [],
      removeAttachmentIds: [],
      parentCommentId: comment.depth === 0 ? comment.commentId : comment.parentCommentId,
      editingCommentId: null,
    });
  };

  const beginEditComment = (comment: BoardComment) => {
    setCommentForm({
      content: comment.content,
      mentions: comment.mentions.map((mention) => ({
        userId: mention.mentionedUserId,
        loginId: mention.mentionedLoginId,
        name: mention.mentionedName,
      })),
      files: [],
      removeAttachmentIds: [],
      parentCommentId: comment.parentCommentId,
      editingCommentId: comment.commentId,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
    await deleteBoardComment(commentId);
    await Promise.all([loadDetail(), loadComments()]);
  };

  const removePostAttachment = (attachmentId: string) => {
    setPostForm((prev) => ({
      ...prev,
      removeAttachmentIds: [...prev.removeAttachmentIds, attachmentId],
    }));
  };

  const removeCommentAttachment = (attachmentId: string) => {
    setCommentForm((prev) => ({
      ...prev,
      removeAttachmentIds: [...prev.removeAttachmentIds, attachmentId],
    }));
  };

  const renderAttachments = (attachments: BoardAttachment[], onRemove?: (attachmentId: string) => void) => (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {attachments.map((attachment) => (
        <Paper key={attachment.attachmentId} variant="outlined" sx={{ p: 1.25, width: 160 }}>
          {attachment.image ? (
            <Box
              component="img"
              src={attachment.contentUrl}
              alt={attachment.fileName}
              sx={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 1, mb: 1 }}
            />
          ) : null}
          <Typography variant="caption" sx={{ display: "block", wordBreak: "break-all" }}>
            {attachment.fileName}
          </Typography>
          {onRemove ? (
            <Button size="small" color="error" onClick={() => onRemove(attachment.attachmentId)}>
              제외
            </Button>
          ) : null}
        </Paper>
      ))}
    </Stack>
  );

  const renderComment = (comment: BoardComment) => (
    <Paper key={comment.commentId} variant="outlined" sx={{ p: 2, ml: comment.depth * 4, mt: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="subtitle2">{comment.authorName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(comment.createdAt)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {!comment.deleted ? (
            <Button size="small" startIcon={<ReplyOutlinedIcon />} onClick={() => beginReply(comment)}>
              답글
            </Button>
          ) : null}
          {comment.canEdit && !comment.deleted ? (
            <IconButton size="small" onClick={() => beginEditComment(comment)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {comment.canDelete ? (
            <IconButton size="small" color="error" onClick={() => void handleDeleteComment(comment.commentId)}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
        {comment.content}
      </Typography>
      {comment.attachments.length > 0 ? <Box sx={{ mt: 1.5 }}>{renderAttachments(comment.attachments)}</Box> : null}
      {comment.replies.map(renderComment)}
    </Paper>
  );

  const pageTitle = board?.boardName ?? detail?.boardName ?? "게시판";
  const commentPageCount = Math.max(1, Math.ceil(commentTotalCount / COMMENT_PAGE_SIZE));
  const flatCurrentComments = flattenComments(comments);
  const editingComment = commentForm.editingCommentId
    ? flatCurrentComments.find((comment) => comment.commentId === commentForm.editingCommentId) ?? null
    : null;

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => router.push(`/board/${boardCode}`)} sx={{ px: 0, mb: 1 }}>
              목록으로
            </Button>
            <Typography variant="h4" fontWeight={800}>{detail?.title ?? pageTitle}</Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }} flexWrap="wrap">
              {detail?.notice ? <Chip label="공지" color="error" size="small" /> : null}
              <Typography variant="body2" color="text.secondary">작성자 {detail?.authorName ?? "-"}</Typography>
              <Typography variant="body2" color="text.secondary">조회 {detail?.viewCount ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">{formatDateTime(detail?.createdAt ?? null)}</Typography>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            {detail?.canEdit ? <Button startIcon={<EditOutlinedIcon />} onClick={openEditPost}>수정</Button> : null}
            {detail?.canDelete ? <Button color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => void handleDeletePost()}>삭제</Button> : null}
          </Stack>
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <Typography>게시글을 불러오는 중...</Typography> : null}

      {detail ? (
        <>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{detail.content}</Typography>
            {detail.attachments.length > 0 ? <Box sx={{ mt: 2.5 }}>{renderAttachments(detail.attachments)}</Box> : null}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>댓글 {commentTotalCount}개</Typography>
              {commentTotalCount > COMMENT_PAGE_SIZE ? (
                <Typography variant="caption" color="text.secondary">댓글이 많을 때는 페이지 단위로 나눠서 불러옵니다.</Typography>
              ) : null}
            </Stack>

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              {commentForm.parentCommentId ? (
                <Chip label="답글 작성 중" onDelete={() => setCommentForm(emptyCommentForm())} color="primary" variant="outlined" sx={{ mb: 1.5 }} />
              ) : null}
              <MentionTextArea
                label={commentForm.editingCommentId ? "댓글 수정" : "댓글 작성"}
                value={commentForm.content}
                onChange={(content) => setCommentForm((prev) => ({ ...prev, content }))}
                mentions={commentForm.mentions}
                onMentionsChange={(mentions) => setCommentForm((prev) => ({ ...prev, mentions }))}
                minRows={3}
                placeholder="@사용자명 멘션과 이미지 첨부를 지원합니다."
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                <Button component="label" variant="outlined" startIcon={<AddPhotoAlternateOutlinedIcon />}>
                  이미지 첨부
                  <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*"
                    onChange={(event) => setCommentForm((prev) => ({ ...prev, files: Array.from(event.target.files ?? []) }))}
                  />
                </Button>
                {commentForm.editingCommentId ? <Button onClick={() => setCommentForm(emptyCommentForm())}>취소</Button> : null}
                <Button variant="contained" onClick={() => void submitComment()} disabled={submitting || !board?.canComment}>등록</Button>
              </Stack>
              {commentForm.files.length > 0 ? renderAttachments(commentForm.files.map((file, index) => toPreviewAttachment(file, index, "COMMENT"))) : null}
              {editingComment ? renderAttachments(editingComment.attachments.filter((item) => !commentForm.removeAttachmentIds.includes(item.attachmentId)), removeCommentAttachment) : null}
            </Paper>

            <Box sx={{ maxHeight: 820, overflowY: "auto", pr: 1 }}>
              {commentsLoading ? <Typography>댓글을 불러오는 중...</Typography> : null}
              {!commentsLoading && comments.length === 0 ? <Typography color="text.secondary">등록된 댓글이 없습니다.</Typography> : null}
              {comments.map((comment) => renderComment(comment))}
            </Box>

            {commentPageCount > 1 ? (
              <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                <Pagination page={commentPage + 1} count={commentPageCount} onChange={(_, value) => setCommentPage(value - 1)} color="primary" />
              </Stack>
            ) : null}
          </Paper>
        </>
      ) : null}

      <Dialog open={editorOpen} onClose={closeEditPost} fullWidth maxWidth="md">
        <DialogTitle>게시글 수정</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="제목"
              value={postForm.title}
              onChange={(event) => setPostForm((prev) => ({ ...prev, title: event.target.value }))}
              fullWidth
            />
            <MentionTextArea
              label="내용"
              value={postForm.content}
              onChange={(content) => setPostForm((prev) => ({ ...prev, content }))}
              mentions={postForm.mentions}
              onMentionsChange={(mentions) => setPostForm((prev) => ({ ...prev, mentions }))}
              minRows={8}
              placeholder="@사용자명 으로 멘션할 수 있습니다."
            />
            <Button component="label" startIcon={<AddPhotoAlternateOutlinedIcon />} variant="outlined" sx={{ width: "fit-content" }}>
              이미지 추가
              <input
                hidden
                multiple
                type="file"
                accept="image/*"
                onChange={(event) => setPostForm((prev) => ({ ...prev, files: Array.from(event.target.files ?? []) }))}
              />
            </Button>
            {postForm.files.length > 0 ? renderAttachments(postForm.files.map((file, index) => toPreviewAttachment(file, index, "POST"))) : null}
            {detail ? renderAttachments(detail.attachments.filter((item) => !postForm.removeAttachmentIds.includes(item.attachmentId)), removePostAttachment) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditPost}>닫기</Button>
          <Button variant="contained" onClick={() => void submitPost()} disabled={submitting}>저장</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
