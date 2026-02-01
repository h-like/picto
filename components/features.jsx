"use client";

import useIntersectionObserver from "@/hooks/use-intersection-observer";
import { useTranslations } from "next-intl";
import { useState } from "react";

const FeaturesCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, isVisible] = useIntersectionObserver();
  const [isHovered, setIsHoverd] = useState(false);

  return (
    <div
      ref={ref}
      className={`backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 transition-all 
            duration-700 cursor-pointer ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${isHovered ? "transform scale-105 rotate-1 shadow-2xl" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHoverd(true)}
      onMouseLeave={() => setIsHoverd(false)}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-xl font-bold text-white mb-3">{title}</div>
      <div className="text-gray-300 leading-relaxed">{description}</div>
    </div>
  );
};

const Features = () => {
  const t = useTranslations("features");

  const features = [
    { icon: "✂️", key: "smart_crop" },
    { icon: "🎨", key: "color_adj" },
    { icon: "🤖", key: "bg_removal" },
    { icon: "🔧", key: "content_editor" },
    { icon: "📏", key: "img_extender" },
    { icon: "⬆️", key: "upscaler" },
  ];

  return (
    <section className="py-20" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
            {/* Powerful AI Features */}
            {t('title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            return (
              <FeaturesCard key={index} {...feature} delay={index * 500} />
            );
          })}
          
        </div> */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            return (
              <FeaturesCard
                key={index}
                icon={feature.icon}
                // 여기서 t 함수를 사용해 JSON의 값을 가져와서 title prop으로 넘깁니다.
                title={t(`${feature.key}.title`)}
                // 마찬가지로 description도 번역해서 넘깁니다.
                description={t(`${feature.key}.description`)}
                delay={index * 500}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
