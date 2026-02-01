"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Github, Globe, ExternalLink, Layers, Cpu, ShieldCheck, Zap } from 'lucide-react'

/**
 * Picto Global Footer
 * 전체 앱의 i18n 상태를 제어하고 프로젝트 정보를 제공하는 미래지향적 푸터입니다.
 */
const Footer = () => {
    // 현재 URL에서 locale 추출 (기본값: ko)
    const [currentLocale, setCurrentLocale] = useState('ko')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/')
            // URL 패턴이 /ko/... 또는 /en/... 인 경우를 감지
            const detectedLocale = pathParts[1] === 'en' ? 'en' : 'ko'
            setCurrentLocale(detectedLocale)
        }
    }, [])

    // 텍스트 데이터 (messages/ko.json, en.json 내용을 기반으로 함)
    const translations = {
        ko: {
            features: "기능",
            pricing: "가격",
            contact: "문의",
            dashboard: "대시보드",
            description: "AI로 완성하는 전문가급 이미지 편집. 자르기, 리사이징, 색상 보정, 배경 제거 등 최신 기술을 활용해 당신의 이미지를 더욱 완벽하게 만들어보세요.",
            nav: "내비게이션",
            powered: "기술 스택",
            lang: "언어 설정",
            status: "운영 상태",
            ready: "배포 준비 완료"
        },
        en: {
            features: "Features",
            pricing: "Pricing",
            contact: "Contact",
            dashboard: "Dashboard",
            description: "Expert-level image editing completed with AI. Perfect your images using the latest technologies such as cropping, resizing, color correction, and background removal.",
            nav: "Navigation",
            powered: "Powered By",
            lang: "Language",
            status: "System Status",
            ready: "PRODUCTION READY"
        }
    }

    const t = (key) => translations[currentLocale][key] || key

    /**
     * 전체 앱 언어 변경 핸들러
     * next-intl의 [locale] 라우팅 구조에 맞춰 URL을 변경합니다.
     */
    const handleLanguageChange = (newLocale) => {
        if (newLocale === currentLocale) return;

        if (typeof window !== 'undefined') {
            const pathname = window.location.pathname
            const segments = pathname.split('/')
            
            // 기존 locale 세그먼트를 교체하거나 추가
            // 예: /ko/dashboard -> /en/dashboard
            if (segments[1] === 'ko' || segments[1] === 'en') {
                segments[1] = newLocale
            } else {
                // 루트 경로(/)인 경우 locale 추가
                segments.splice(1, 0, newLocale)
            }
            
            const newPath = segments.join('/') || '/'
            window.location.href = newPath // 전체 페이지 리로드하여 i18n 설정 적용
        }
    }

    const techStack = [
        { name: "Next.js", icon: <Zap size={14} /> },
        { name: "Convex", icon: <Layers size={14} /> },
        { name: "Clerk", icon: <ShieldCheck size={14} /> },
        { name: "Tailwind", icon: <Cpu size={14} /> }
    ]

    const quickLinks = [
        { name: t('features'), href: "#features" },
        { name: t('pricing'), href: "#pricing" },
        { name: t('contact'), href: "#contact" }
    ]

    return (
        <footer className="relative mt-20 border-t border-white/10 bg-black/40 backdrop-blur-xl">
            {/* 상단 장식용 그라데이션 라인 */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* 1. Brand & Description */}
                    <div className="space-y-6">
                        <a href={`/${currentLocale}`} className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <span className="text-white font-bold text-xl">P</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">Picto</span>
                        </a>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            {t('description')}
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <Github size={20} />
                            </a>
                            <a href="#" className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                                <ExternalLink size={20} />
                            </a>
                        </div>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">{t('nav')}</h4>
                        <ul className="space-y-4 text-sm">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all" />
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a href={`/${currentLocale}/dashboard`} className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all" />
                                    {t('dashboard')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* 3. Tech Stack Badges */}
                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs">{t('powered')}</h4>
                        <div className="flex flex-wrap gap-3">
                            {techStack.map((tech) => (
                                <div key={tech.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-300 font-mono">
                                    <span className="text-blue-400">{tech.icon}</span>
                                    {tech.name}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5">
                            <p className="text-[11px] text-gray-500 leading-tight font-sans">
                                This project is a portfolio piece demonstrating modern full-stack AI application architecture.
                            </p>
                        </div>
                    </div>

                    {/* 4. Language & Meta */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs flex items-center gap-2">
                                <Globe size={16} className="text-blue-400" />
                                {t('lang')}
                            </h4>
                            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
                                <button 
                                    onClick={() => handleLanguageChange('ko')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${currentLocale === 'ko' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    KO
                                </button>
                                <button 
                                    onClick={() => handleLanguageChange('en')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${currentLocale === 'en' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-8 lg:mt-0 pt-8 border-t border-white/5 lg:border-none">
                            <div className="text-[10px] font-mono text-gray-500 uppercase">
                                {t('status')}: <span className="text-green-500 animate-pulse inline-block">{t('ready')}</span>
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 mt-1">
                                VERSION: v1.0.42_STABLE
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
                    <p className="text-gray-500 text-[11px]">
                        © {new Date().getFullYear()} Picto. Developed for Portfolio by <span className="text-gray-300 hover:text-blue-400 cursor-pointer transition-colors font-medium">Developer Name</span>.
                    </p>
                    <div className="flex items-center gap-6 text-[11px] text-gray-500">
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer