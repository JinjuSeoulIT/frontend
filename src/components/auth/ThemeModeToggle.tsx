import { IconButton, Stack, Tooltip } from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import DesktopWindowsRoundedIcon from "@mui/icons-material/DesktopWindowsRounded";

type ThemeMode = "light" | "dark" | "system";

type ThemeModeToggleProps = {
  isDark: boolean;
  themeMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
};

export default function ThemeModeToggle({
  isDark,
  themeMode,
  onModeChange,
}: ThemeModeToggleProps) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      sx={{
        position: "fixed",
        left: 14,
        bottom: 14,
        p: 0.75,
        borderRadius: 999,
        bgcolor: isDark ? "rgba(15,23,42,0.75)" : "rgba(255,255,255,0.82)",
        border: isDark ? "1px solid rgba(148,163,184,0.28)" : "1px solid rgba(148,163,184,0.35)",
        backdropFilter: "blur(8px)",
        zIndex: 1400,
      }}
    >
      <Tooltip title="라이트">
        <IconButton
          size="small"
          onClick={() => onModeChange("light")}
          sx={{
            bgcolor: themeMode === "light" ? "rgba(245,158,11,0.2)" : "transparent",
            color: isDark ? "#facc15" : "#92400e",
          }}
        >
          <LightModeRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="다크">
        <IconButton
          size="small"
          onClick={() => onModeChange("dark")}
          sx={{
            bgcolor: themeMode === "dark" ? "rgba(59,130,246,0.18)" : "transparent",
            color: isDark ? "#93c5fd" : "#1e3a8a",
          }}
        >
          <DarkModeRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="시스템">
        <IconButton
          size="small"
          onClick={() => onModeChange("system")}
          sx={{
            bgcolor: themeMode === "system" ? "rgba(16,185,129,0.2)" : "transparent",
            color: isDark ? "#6ee7b7" : "#065f46",
          }}
        >
          <DesktopWindowsRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
