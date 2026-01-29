import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Picto",
  description: "AI Image Editor",
};

// 여기서는 html과 body만 남깁니다.
// Header나 Provider는 자식 레이아웃([locale]/layout.js)으로 위임합니다.
export default function RootLayout({ children }) {
  return (
    // lang 속성은 middleware나 자식에서 제어하겠지만, 기본 구조는 유지합니다.
    <html suppressHydrationWarning>
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}
