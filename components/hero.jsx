"use client";

import { motion, useSpring } from "framer-motion";
import { Aperture, Check, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

// --- 1. 마우스 위치 추적 훅 (3D 효과용) ---
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);
  return mousePosition;
};

// --- 2. 3D 데모 인터페이스 컴포넌트 ---
const HeroDemoInterface = () => {
  const mouse = useMousePosition();
  const cardRef = useRef(null);

  // 스프링 애니메이션 설정 (부드러운 움직임)
  const rotateX = useSpring(0, { stiffness: 100, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    if (!cardRef.current) return;
    const { left, top, width, height } =
      cardRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // 마우스 위치에 따른 회전각 계산
    const x = (mouse.x - centerX) / 40; // 민감도 조절
    const y = (mouse.y - centerY) / 40;

    rotateX.set(-y);
    rotateY.set(x);
  }, [mouse, rotateX, rotateY]);

  return (
    <div
      className="perspective-1000 w-full max-w-4xl mx-auto mt-16 relative z-20"
      ref={cardRef}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 50, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative w-full aspect-[16/9] md:aspect-[21/9]"
      >
        {/* 메인 글래스 패널 */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
          {/* 상단 UI 바 */}
          <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="ml-4 h-4 w-32 bg-white/5 rounded-full" />
          </div>

          {/* 작업 영역 내용 */}
          <div className="p-6 h-full flex gap-6 relative group">
            {/* 왼쪽: 이미지 영역 */}
            <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center">
              {/* 그리드 배경 */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* 중앙 아이콘 (이미지 대신) */}
              <div className="relative z-10">
                <Sparkles className="w-16 h-16 text-blue-500 opacity-80 animate-pulse" />
              </div>

              {/* 스캐닝 효과 라인 */}
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-px bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] z-20"
              />
            </div>

            {/* 오른쪽: 패널 UI 시뮬레이션 */}
            <div className="w-1/4 hidden md:flex flex-col gap-4">
              <div className="space-y-2">
                <div className="h-2 w-12 bg-blue-500/50 rounded-full" />
                <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5" />
                <div className="h-8 w-full bg-white/5 rounded-lg border border-white/5" />
              </div>
              <div className="space-y-2 pt-4 border-t border-white/5">
                <div className="h-2 w-20 bg-purple-500/50 rounded-full" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-white/5 rounded-lg border border-white/5" />
                  <div className="h-16 bg-white/5 rounded-lg border border-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 떠있는 3D 요소들 (Parallax 효과) --- */}

        {/* 왼쪽 하단: 상태 배지 */}
        <motion.div
          style={{ translateZ: 60 }}
          className="absolute -bottom-6 -left-4 md:left-10 bg-black/60 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check size={20} className="text-green-400" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">
              AI Confidence
            </div>
            <div className="text-sm font-bold text-white">99.8% Match</div>
          </div>
        </motion.div>

        {/* 오른쪽 상단: 처리 속도 배지 */}
        <motion.div
          style={{ translateZ: 40 }}
          className="absolute -top-6 -right-4 md:right-10 bg-black/60 backdrop-blur-xl border border-white/20 py-3 px-5 rounded-xl shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-yellow-400 fill-current" />
            <span className="text-xs font-bold text-white">
              GPU Acceleration
            </span>
          </div>
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-full bg-yellow-400"
            />
          </div>
        </motion.div>

        {/* 중앙 하단: 툴팁 효과 */}
        <motion.div
          style={{ translateZ: 80, x: "-50%" }}
          className="absolute bottom-10 left-1/2 bg-blue-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg border border-blue-400/30 flex items-center gap-2"
        >
          <Aperture size={14} className="animate-spin-slow" />
          Generating Depth Map...
        </motion.div>
      </motion.div>
    </div>
  );
};

const HeroSection = () => {
  const [textVisible, setTextVisible] = useState(false);

  const t = useTranslations("Hero");

  useEffect(() => {
    const timer = setTimeout(() => setTextVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-40 pb-20">
      {/* 배경 그라디언트 효과 (옵션) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center z-10 px-6 max-w-5xl w-full">
        {/* 텍스트 영역 */}
        <div
          className={`transition-all duration-1000 ${textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              {/* Create */}
              {t("title.highlight")}
            </span>
            <br />
            <span className="text-white">{t("title.suffix")}</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/dashboard">
              <Button variant="primary" size="xl">
                {t("cta.start")}
              </Button>
            </Link>
            <Button variant="glass" size="xl">
                {t("cta.demo")}
            </Button>
          </div>
        </div>

        {/* Demo Interface Integration */}
        <HeroDemoInterface />
      </div>
    </section>
  );
};

export default HeroSection;
