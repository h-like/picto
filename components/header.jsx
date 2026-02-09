"use client";

import useStoreUser from "@/hooks/user-store-user";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { LayoutDashboard } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarLoader } from "react-spinners";
import { Button } from "./ui/button";

const Header = () => {
  const path = usePathname();
  const { isLoading } = useStoreUser();
  const t = useTranslations("Header");

  const isHome = path === "/" || path === "/ko" || path === "/en";

  if (path.includes("/editor")) {
    return null; //편집 시 헤더 숨기기
  }

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 text-nowrap">
      <div className="backdrop-blur-md bg-white/10 border-white/20 rounded-full px-8 py-3 flex items-center justify-between gap-8">
        <Link href="/" className="mr-10 md:mr-20">
          <Image
            src="/logo-3-big.png"
            alt="Picto Logo"
            className="min-w-24 object-cover"
            width={96}
            height={24}
          />
        </Link>
        {isHome && (
          <div className="hidden md:flex space-x-6">
            <Link
              href="#features"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              {/* Features */}
              {t("features")}
            </Link>
            <Link
              href="#pricing"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              {t("pricing")}
            </Link>
            <Link
              href="#contact"
              className="text-white font-medium transition-all duration-300 hover:text-cyan-400 cursor-pointer"
            >
              {t("contact")}
            </Link>
          </div>
        )}
        <div className="flex intems-center gap-3 ml-10 md:ml-20">
          <Unauthenticated>
            <SignInButton>
              <Button variant="glass" className="hidden sm:flex">
                {/* Sign In */}
                {t("signin")}
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="primary">{t("getStarted")}</Button>
            </SignUpButton>
          </Unauthenticated>
          <Authenticated>
            <Link href="/dashboard">
              <Button variant="glass">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:flex"> {t("dashboard")}</span>
              </Button>
            </Link>

            <UserButton
            afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </Authenticated>
        </div>
        <div>
          {isLoading && (
            <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center">
              <BarLoader width={"95%"} color="#C4C4C4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
