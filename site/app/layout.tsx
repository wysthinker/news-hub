import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "新闻追踪",
  description: "AI 驱动的多源新闻聚合与追踪平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
