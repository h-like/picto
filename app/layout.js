import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import FloatingShapes from "@/components/floating-shapes";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Picto",
  description: "AI Image Editor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header/>
          <main className="bg-slate-900 min-h-[2000px] text-white overflow-x-hidden">
            <FloatingShapes />
            <Toaster richColors />
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
