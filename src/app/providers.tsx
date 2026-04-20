"use client";

import * as React from "react";
import { Provider } from "react-redux";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { store } from "@/store/store";
import type { MenuNode } from "@/types/menu";
import { MenuProvider } from "@/components/layout/MenuContext";

const theme = createTheme({
  typography: {
    fontFamily:
      'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", Arial, sans-serif',
  },
  shape: { borderRadius: 12 },
});

export default function Providers({
  children,
  initialMenus,
}: {
  children: React.ReactNode;
  initialMenus: MenuNode[];
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <MenuProvider initialMenus={initialMenus}>{children}</MenuProvider>
        </Provider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

