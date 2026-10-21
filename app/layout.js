import Link from "next/link";
import "./globals.css";
import { QuizProvider } from "@/components/QuizProvider";
import { AiStatusBadge } from "@/components/AiStatusBadge";

export const metadata = {
  title: "かながわアキネーター",
  description: "質問に答えると、あなたにぴったりの神奈川の観光地を提案します",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <QuizProvider>
          <header className="border-b border-line bg-surface">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="font-bold text-primary-strong">
                かながわアキネーター
              </Link>
              <AiStatusBadge />
            </div>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">{children}</main>
          <footer className="px-4 py-4 text-center text-xs text-muted">
            地図データ © OpenStreetMap contributors ／ ゼミ課題（ローカル実行）
          </footer>
        </QuizProvider>
      </body>
    </html>
  );
}
