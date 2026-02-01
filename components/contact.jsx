"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, Sparkles, Terminal, Cpu, Zap } from 'lucide-react'
import { Button } from './ui/button'
import useIntersectionObserver from '@/hooks/use-intersection-observer'

const Contact = () => {
    const [ref, isVisible] = useIntersectionObserver();
    const [message, setMessage] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [status, setStatus] = useState("IDLE") // IDLE, TYPING, ANALYZING, SUCCESS

    const handleSend = async (e) => {
        e.preventDefault()
        if (!message) return
        
        setIsAnalyzing(true)
        setStatus("ANALYZING")
        
        // AI 분석 중인 것 같은 효과를 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setStatus("SUCCESS")
        setIsAnalyzing(false)
        setMessage("")
        
        setTimeout(() => setStatus("IDLE"), 3000)
    }

    return (
        <section ref={ref} className="py-24 relative overflow-hidden mb-9" id="contact">
            {/* 배경 데코레이션 - 빛나는 오라 효과 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-6"
                    >
                        <Bot size={16} className="animate-pulse" />
                        AI Feedback Engine v1.0
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-5xl font-bold text-white mb-6"
                    >
                        Ready to <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">Connect?</span>
                    </motion.h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        피드백을 남겨주시면 AI 엔진이 분석하여 개발자에게 즉시 전달합니다. 
                        당신의 아이디어가 Picto의 다음 엔진이 됩니다.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* 왼쪽: AI 상태 인터페이스 */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        className="space-y-6"
                    >
                        <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                    <Cpu className="text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">System Status</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                                        Core Neural Network Online
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Processing Power", value: "98%", icon: Zap },
                                    { label: "Response Latency", value: "24ms", icon: Terminal },
                                    { label: "Active Nodes", value: "1,024", icon: Sparkles },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <item.icon size={18} className="text-blue-400" />
                                            <span>{item.label}</span>
                                        </div>
                                        <span className="text-white font-mono">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* 오른쪽: 터미널 스타일 입력창 */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isVisible ? { opacity: 1, x: 0 } : {}}
                        className="relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-[#0a0a0b] border border-white/10 rounded-3xl p-8 overflow-hidden">
                            {/* 상단 탭 장식 */}
                            <div className="flex items-center gap-2 mb-6 pb-4 border-bottom border-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                <span className="ml-2 text-xs font-mono text-gray-500 uppercase tracking-widest">New Transmission</span>
                            </div>

                            <form onSubmit={handleSend} className="space-y-6">
                                <div className="relative">
                                    <textarea
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value)
                                            if (status !== "SUCCESS") setStatus(e.target.value ? "TYPING" : "IDLE")
                                        }}
                                        placeholder="이곳에 피드백이나 문의 내용을 입력하세요..."
                                        className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none font-mono"
                                    />
                                    
                                    {/* 실시간 상태 표시 */}
                                    <div className="absolute bottom-4 right-4 text-[10px] font-mono text-blue-500/70 uppercase">
                                        {status === "TYPING" && ">> User input detected..."}
                                        {status === "ANALYZING" && ">> Running neural analysis..."}
                                        {status === "SUCCESS" && ">> Data transmitted successfully!"}
                                    </div>
                                </div>

                                <Button 
                                    type="submit"
                                    disabled={isAnalyzing || !message}
                                    variant="primary"
                                    size="xl"
                                    className="w-full group relative overflow-hidden"
                                >
                                    <AnimatePresence mode="wait">
                                        {isAnalyzing ? (
                                            <motion.div 
                                                key="loading"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Analyzing Message...
                                            </motion.div>
                                        ) : status === "SUCCESS" ? (
                                            <motion.div 
                                                key="success"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Sparkles size={18} />
                                                Sent Successfully
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="default"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-2"
                                            >
                                                Execute Transmission
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Contact