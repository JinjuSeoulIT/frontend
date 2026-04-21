"use client";

import * as React from "react";
import {
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { MentionCandidate, MentionTarget } from "@/lib/board/boardApi";
import { searchMentionCandidates } from "@/lib/board/boardApi";

type MentionTextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mentions: MentionTarget[];
  onMentionsChange: (mentions: MentionTarget[]) => void;
  minRows?: number;
  placeholder?: string;
};

const mentionPattern = /@([^\s@]{1,20})$/;
const lineHeightPx = 24;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildMentionPattern = (mentions: MentionTarget[]) => {
  const names = mentions
    .map((mention) => mention.name.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((name) => escapeRegExp(name));

  if (names.length === 0) {
    return null;
  }

  return new RegExp(`@(?:${names.join("|")})(?=\\s|$)`, "g");
};

const renderHighlightedText = (value: string, mentions: MentionTarget[]) => {
  if (!value) {
    return null;
  }

  const pattern = buildMentionPattern(mentions);
  if (!pattern) {
    return value;
  }

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(value.slice(lastIndex, match.index));
    }
    nodes.push(
      <Box
        key={`${match.index}-${match[0]}`}
        component="span"
        sx={{
          color: "primary.main",
          textDecoration: "underline",
          textUnderlineOffset: "2px",
          fontWeight: 600,
        }}
      >
        {match[0]}
      </Box>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    nodes.push(value.slice(lastIndex));
  }

  return nodes;
};

export default function MentionTextArea({
  label,
  value,
  onChange,
  mentions,
  onMentionsChange,
  minRows = 4,
  placeholder,
}: MentionTextAreaProps) {
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = React.useState("");
  const [candidates, setCandidates] = React.useState<MentionCandidate[]>([]);
  const [loading, setLoading] = React.useState(false);

  const syncOverlayScroll = React.useCallback(() => {
    if (!inputRef.current || !overlayRef.current) {
      return;
    }
    overlayRef.current.scrollTop = inputRef.current.scrollTop;
    overlayRef.current.scrollLeft = inputRef.current.scrollLeft;
  }, []);

  const updateMentionState = React.useCallback((nextValue: string) => {
    const input = inputRef.current;
    const cursor = input?.selectionStart ?? nextValue.length;
    const beforeCursor = nextValue.slice(0, cursor);
    const match = beforeCursor.match(mentionPattern);
    if (!match) {
      setQuery("");
      setCandidates([]);
      return;
    }
    setQuery(match[1]);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setCandidates([]);
      return;
    }

    let active = true;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const result = await searchMentionCandidates(query.trim());
        if (active) {
          setCandidates(result);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleReplaceMention = (candidate: MentionCandidate) => {
    const input = inputRef.current;
    const cursor = input?.selectionStart ?? value.length;
    const beforeCursor = value.slice(0, cursor);
    const afterCursor = value.slice(cursor);
    const replacedBefore = beforeCursor.replace(mentionPattern, `@${candidate.fullName} `);
    const nextValue = `${replacedBefore}${afterCursor}`;

    onChange(nextValue);
    onMentionsChange(
      mentions.some((item) => item.loginId === candidate.loginId)
        ? mentions.filter((item) => nextValue.includes(`@${item.name}`))
        : [
            ...mentions.filter((item) => nextValue.includes(`@${item.name}`)),
            {
              userId: candidate.userId,
              loginId: candidate.loginId,
              name: candidate.fullName,
            },
          ]
    );

    setQuery("");
    setCandidates([]);

    requestAnimationFrame(() => {
      input?.focus();
      const nextCursor = replacedBefore.length;
      input?.setSelectionRange(nextCursor, nextCursor);
      syncOverlayScroll();
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    onMentionsChange(mentions.filter((item) => nextValue.includes(`@${item.name}`)));
    updateMentionState(nextValue);
    syncOverlayScroll();
  };

  return (
    <Stack spacing={1.25} sx={{ position: "relative" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>

      <Box
        sx={{
          display: "grid",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          px: 2,
          py: 1.75,
          bgcolor: "background.paper",
          minHeight: minRows * lineHeightPx + 28,
          alignItems: "stretch",
        }}
      >
        <Box
          ref={overlayRef}
          aria-hidden
          sx={{
            gridArea: "1 / 1",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflow: "hidden",
            color: value ? "text.primary" : "text.secondary",
            lineHeight: `${lineHeightPx}px`,
            minHeight: minRows * lineHeightPx,
            pr: 1,
          }}
        >
          {value ? renderHighlightedText(value, mentions) : placeholder ?? ""}
        </Box>

        <Box
          component="textarea"
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onScroll={syncOverlayScroll}
          placeholder={placeholder}
          rows={minRows}
          sx={{
            gridArea: "1 / 1",
            resize: "vertical",
            border: 0,
            outline: 0,
            p: 0,
            m: 0,
            width: "100%",
            bgcolor: "transparent",
            color: "transparent",
            caretColor: "text.primary",
            font: "inherit",
            lineHeight: `${lineHeightPx}px`,
            overflow: "auto",
            '&::placeholder': {
              color: 'transparent',
            },
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            멘션 사용자를 검색 중입니다.
          </Typography>
        </Box>
      ) : null}

      {query && candidates.length > 0 ? (
        <Paper variant="outlined" sx={{ maxHeight: 220, overflowY: "auto" }}>
          <List dense>
            {candidates.map((candidate) => (
              <ListItemButton key={candidate.loginId} onClick={() => handleReplaceMention(candidate)}>
                <ListItemText
                  primary={`${candidate.fullName} (@${candidate.loginId})`}
                  secondary={candidate.departmentName ?? candidate.roleCode ?? "직원"}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      ) : null}
    </Stack>
  );
}
