import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { fetchServerMenus } from "@/lib/admin/menuServer";

export const metadata: Metadata = {
  title: "HIS - Patient Frontend",
  description: "Patient module frontend",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialMenus = await fetchServerMenus();

  return (
    <html lang="ko">
      <body>
        <Providers initialMenus={initialMenus}>{children}</Providers>
      </body>
    </html>
  );
}

