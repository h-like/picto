"use client";

import useIntersectionObserver from "@/hooks/use-intersection-observer";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Mail,
  MessageSquare,
  Lightbulb,
  Send,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

const Contact = () => {
  const [ref, isVisible] = useIntersectionObserver();
  const [step, setStep] = useState(1); // 1: 선택, 2: 입력
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({ email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const t = useTranslations("contact");

  const contactTypes = [
    {
      id: "feedback",
      title: t("types.feedback.title"),
      icon: MessageSquare,
      description: t("types.feedback.description"),
      color: "from-blue-500 to-cyan-400",
      placeholder: t("types.feedback.placeholder"),
    },
    {
      id: "inquiry",
      title: t("types.inquiry.title"),
      icon: Mail,
      description: t("types.inquiry.description"),
      color: "from-purple-500 to-pink-400",
      placeholder: t("types.inquiry.placeholder"),
    },
    {
      id: "suggestion",
      title: t("types.suggestion.title"),
      icon: Lightbulb,
      description: t("types.suggestion.description"),
      color: "from-amber-500 to-orange-400",
      placeholder: t("types.suggestion.placeholder"),
    },
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setTimeout(() => setStep(2), 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 제출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSuccess(true);
    setIsSubmitting(false);

    // 3초 후 초기화
    setTimeout(() => {
      setStep(1);
      setSelectedType(null);
      setFormData({ email: "", message: "" });
      setIsSuccess(false);
    }, 3000);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
    setFormData({ email: "", message: "" });
  };

  const selectedOption = contactTypes.find((t) => t.id === selectedType);

  return (
    <section ref={ref} className="py-32 relative overflow-hidden" id="contact">
      {/* 배경 그라데이션 */}
      <div className="" />

      {/* 떠다니는 배경 요소 */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500/40 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute top-90 left-85 w-52 h-52 bg-yellow-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t("title_prefix")}{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {/* Connect */}
              {t("title_highlight")}
            </span>
          </h2>
          <p className="text-xl text-slate-400">{t("subtitle")}</p>
        </motion.div>

        {/* Step 표시 */}
        <div className="flex justify-center gap-3 mb-12">
          <div
            className={`h-1.5 w-16 rounded-full transition-all duration-500 ${step === 1 ? "bg-blue-500" : "bg-slate-700"}`}
          />
          <div
            className={`h-1.5 w-16 rounded-full transition-all duration-500 ${step === 2 ? "bg-blue-500" : "bg-slate-700"}`}
          />
        </div>

        {/* 메인 컨텐츠 */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {/* Step 1: 타입 선택 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-3 gap-6"
              >
                {contactTypes.map((type, idx) => (
                  <motion.button
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleTypeSelect(type.id)}
                    className="group relative p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 backdrop-blur-xl transition-all duration-300 hover:scale-105 text-left overflow-hidden"
                  >
                    {/* 호버 효과 */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    />

                    {/* 아이콘 */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <type.icon className="text-white" size={28} />
                    </div>

                    {/* 텍스트 */}
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                      {type.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {type.description}
                    </p>

                    {/* 화살표 */}
                    <ArrowRight
                      className="absolute bottom-6 right-6 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300"
                      size={20}
                    />
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Step 2: 입력 폼 */}
            {step === 2 && selectedOption && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
              >
                <div className="relative p-8 md:p-12 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl overflow-hidden">
                  {/* 배경 그라데이션 */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${selectedOption.color} opacity-5`}
                  />

                  {/* 선택한 타입 표시 */}
                  <div className="flex items-center gap-4 mb-8 relative">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedOption.color} flex items-center justify-center`}
                    >
                      <selectedOption.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {selectedOption.title}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {selectedOption.description}
                      </p>
                    </div>
                  </div>

                  {/* 폼 */}
                  <form onSubmit={handleSubmit} className="space-y-6 relative">
                    {/* 이메일 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t("form.email_label")}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="your@email.com"
                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    {/* 메시지 */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {t("form.message_label")}
                      </label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder={selectedOption.placeholder}
                        rows={6}
                        className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      />
                    </div>

                    {/* 버튼 그룹 */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        onClick={handleBack}
                        variant="outline"
                        className="flex-1 h-14 rounded-2xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                        disabled={isSubmitting}
                      >
                        {t("form.buttons.back")}
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting || isSuccess}
                        className={`flex-1 h-14 rounded-2xl bg-gradient-to-r ${selectedOption.color} text-white font-medium hover:opacity-90 transition-all disabled:opacity-50 relative overflow-hidden group`}
                      >
                        <AnimatePresence mode="wait">
                          {isSubmitting ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2"
                            >
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              {t("form.buttons.sending")}
                            </motion.div>
                          ) : isSuccess ? (
                            <motion.div
                              key="success"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 size={20} />
                              {t("form.buttons.success")}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="default"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2"
                            >
                              {t("form.buttons.send")}
                              <Send
                                size={18}
                                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Contact;
