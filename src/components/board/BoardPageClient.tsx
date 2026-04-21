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
  IconButton,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useRouter } from "next/navigation";
import MentionTextArea from "@/components/board/MentionTextArea";
import {
  type BoardAttachment,
  type BoardDefinition,
  type BoardPostSummary,
  type MentionTarget,
  type PostPayload,
  createBoardPost,
  fetchBoards,
  fetchBoardPosts,
} from "@/lib/board/boardApi";

type Props = {
  boardCode: string;
};

type PostFormState = {
  title: string;
  content: string;
  notice: boolean;
  mentions: MentionTarget[];
  files: File[];
};

const PAGE_SIZE = 20;

const emptyPostForm = (): PostFormState => ({
  title: "",
  content: "",
  notice: false,
  mentions: [],
  files: [],
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

const toPreviewAttachment = (file: File, index: number): BoardAttachment => ({
  attachmentId: `new-${index}`,
  targetType: "POST",
  targetId: "NEW",
  fileName: file.name,
  contentType: file.type,
  fileSize: file.size,
  image: true,
  contentUrl: URL.createObjectURL(file),
  createdAt: null,
});

export default function BoardPageClient({ boardCode }: Props) {
  const router = useRouter();
  const [board, setBoard] = React.useState<BoardDefinition | null>(null);
  const [posts, setPosts] = React.useState<BoardPostSummary[]>([]);
  const [keywordInput, setKeywordInput] = React.useState("");
  const [keyword, setKeyword] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [postForm, setPostForm] = React.useState<PostFormState>(emptyPostForm);
  const [submitting, setSubmitting] = React.useState(false);

  const loadBoards = React.useCallback(async () => {
    const result = await fetchBoards();
    const found = result.find((item) => item.boardCode.toLowerCase() === boardCode.toLowerCase()) ?? null;
    setBoard(found);
  }, [boardCode]);

  const loadPosts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBoardPosts(boardCode, { keyword, page, size: PAGE_SIZE });
      setPosts(result.list);
      setTotalCount(result.totalCount);
      setBoard(result.board);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [boardCode, keyword, page]);

  React.useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  React.useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleSearch = () => {
    setPage(0);
    setKeyword(keywordInput.trim());
  };

  const handleOpenCreate = () => {
    setPostForm(emptyPostForm());
    setEditorOpen(true);
  };

  const handleCloseCreate = () => {
    setEditorOpen(false);
    setPostForm(emptyPostForm());
  };

  const submitPost = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload: PostPayload = {
        title: postForm.title,
        content: postForm.content,
        notice: postForm.notice,
        mentions: pickMentionsStillPresent(postForm.content, postForm.mentions),
      };
      const result = await createBoardPost(boardCode, payload, postForm.files);
      handleCloseCreate();
      await loadPosts();
      router.push(`/board/${boardCode}/posts/${result.postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "게시글 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPreviewAttachments = () => (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {postForm.files.map((file, index) => {
        const attachment = toPreviewAttachment(file, index);
        return (
          <Paper key={attachment.attachmentId} variant="outlined" sx={{ p: 1.25, width: 160 }}>
            <Box
              component="img"
              src={attachment.contentUrl}
              alt={attachment.fileName}
              sx={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 1, mb: 1 }}
            />
            <Typography variant="caption" sx={{ display: "block", wordBreak: "break-all" }}>
              {attachment.fileName}
            </Typography>
          </Paper>
        );
      })}
    </Stack>
  );

  const pageTitle = board?.boardName ?? "게시판";
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800}>{pageTitle}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {board?.description ?? "병원 내부 공지와 협업 대화를 위한 게시판입니다."}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={() => void loadPosts()}><RefreshOutlinedIcon /></IconButton>
            {board?.canWrite ? <Button variant="contained" onClick={handleOpenCreate}>글쓰기</Button> : null}
          </Stack>
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            fullWidth
            placeholder="제목, 내용, 작성자 검색"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button variant="contained" onClick={handleSearch}>검색</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          총 {totalCount}건
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={120}>구분</TableCell>
              <TableCell>제목</TableCell>
              <TableCell width={140}>작성자</TableCell>
              <TableCell width={170}>등록일</TableCell>
              <TableCell width={90} align="right">조회</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow
                key={post.postId}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => router.push(`/board/${boardCode}/posts/${post.postId}`)}
              >
                <TableCell>
                  {post.notice ? <Chip label="공지" color="error" size="small" /> : <Chip label={pageTitle} size="small" />}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>{post.title}</Typography>
                    {post.commentCount > 0 ? <Chip label={`댓글 ${post.commentCount}`} size="small" variant="outlined" /> : null}
                    {post.imageCount > 0 ? <Chip label={`사진 ${post.imageCount}`} size="small" color="success" variant="outlined" /> : null}
                  </Stack>
                  {post.contentPreview ? (
                    <Typography variant="caption" color="text.secondary">{post.contentPreview}</Typography>
                  ) : null}
                </TableCell>
                <TableCell>{post.authorName}</TableCell>
                <TableCell>{formatDateTime(post.createdAt)}</TableCell>
                <TableCell align="right">{post.viewCount}</TableCell>
              </TableRow>
            ))}
            {!loading && posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">등록된 게시글이 없습니다.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
        {totalPages > 1 ? (
          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Pagination page={page + 1} count={totalPages} onChange={(_, value) => setPage(value - 1)} color="primary" />
          </Stack>
        ) : null}
      </Paper>

      <Dialog open={editorOpen} onClose={handleCloseCreate} fullWidth maxWidth="md">
        <DialogTitle>게시글 작성</DialogTitle>
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
            {postForm.files.length > 0 ? renderPreviewAttachments() : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate}>닫기</Button>
          <Button variant="contained" onClick={() => void submitPost()} disabled={submitting}>등록</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
