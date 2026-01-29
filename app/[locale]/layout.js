import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

// 기존 layout.js에 있던 임포트들을 여기로 가져옵니다.
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import FloatingShapes from "@/components/floating-shapes";
import Header from "@/components/header"; // Header 이동!
import { ConvexClientProvider } from "@/app/ConvexClientProvider"; // 경로 주의 (@/app/...)
import { ClerkProvider } from "@clerk/nextjs";
import { dark, neobrutalism, shadesOfPurple } from "@clerk/themes";

export default async function LocaleLayout({ children, params }) {
  // 1. URL에서 locale(언어) 정보를 가져옵니다.
  const { locale } = await params;

  // 유효하지 않은 언어라면 404 처리 (선택 사항)
  if (!["en", "ko"].includes(locale)) {
    notFound();
  }

  // 2. 해당 언어의 번역 메시지를 서버에서 가져옵니다.
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* ClerkProvider, ThemeProvider 등 모든 UI 관련 Provider는 
         NextIntlClientProvider 내부(혹은 동급)에 있어도 되지만, 
         Header가 useTranslations를 쓰므로 Header는 반드시 이 안이나 아래에 있어야 합니다.
         안전을 위해 Provider들을 여기서 감싸줍니다. 
      */}
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <ClerkProvider appearance={{ baseTheme: shadesOfPurple }}>
          <ConvexClientProvider>
            {/* Header가 이제 번역 Provider 안에 들어왔으므로 에러가 사라집니다. */}
            <Header />

            <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
              <FloatingShapes />
              <Toaster richColors />
              {children}
            </main>
          </ConvexClientProvider>
        </ClerkProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
