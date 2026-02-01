"use client";

import useIntersectionObserver from "@/hooks/use-intersection-observer";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useTranslations } from "use-intl";

const PricingCard = ({
  id,
  plan,
  price,
  features,
  featured = false,
  planId,
  buttonText,
}) => {
  const t = useTranslations("pricing");

  const [ref, isVisible] = useIntersectionObserver();
  const [isHovered, setIsHoverd] = useState(false);

  const { has } = useAuth();

  const isCurrentPlan = id ? has?.({ plan: id }) : false;

  const handlePopup = async () => {
    if (isCurrentPlan) return;

    try {
      if (window.Clerk && window.Clerk.__internal_openCheckout) {
        await window.Clerk.__internal_openCheckout({
          planId: planId,
          planPeriod: "month",
          subscriberType: "user",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(`${t("error_message")}: ${error.message}`);
    }
  };

  return (
    <div
      ref={ref}
      className={`relative backdrop-blur-lg border rounded-3xl p-8 transition-all duration-700 
            cursor-pointer ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            } ${isHovered ? "transform scale-115 rotate-1 z-10" : ""} 
            ${
              featured
                ? "bg-gradient-to-b from-blue-500/20 to-purple-600/20 border-blue-400/50 scale-105"
                : "bg-white/5 border-white/10"
            } }
                `}
      onMouseEnter={() => setIsHoverd(true)}
      onMouseLeave={() => setIsHoverd(false)}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold">
            {t("most_popular")}
          </div>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-2">{plan}</h3>
        <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6">
          ${price}
          {/* 무료에는 없고, pro에만 보이게 */}
          {price > 0 && (
            <span className="text-lg text-gray-400">{t("per_month")}</span>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-300">
              <span className="text-green-400 mr-3">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <Button
          variant={featured ? "primary" : "glass"}
          size="xl"
          className="w-full"
          onClick={handlePopup}
          // 이미 해당 플랜을 사용 중이거나, 결제 대상이 아닌 플랜일 경우 버튼을 비활성화
          disabled={isCurrentPlan || !planId}
        >
          {isCurrentPlan ? t("current_plan") : buttonText}
        </Button>
      </div>
    </div>
  );
};

const Pricing = () => {
  const t = useTranslations("pricing");
  const plans = [
    {
      id: "free_user",
      plan: t("plans.free.name"),
      price: 0,
      features: [
        t("plans.free.features.projects"),
        t("plans.free.features.exports"),
        t("plans.free.features.crop_resize"),
        t("plans.free.features.color_adjust"),
        t("plans.free.features.text_tool"),
      ],
      buttonText: t("plans.free.button"),
    },
    {
      id: "pro",
      plan: "Pro",
      price: 12,
      features: [
        t("plans.pro.features.projects"),
        t("plans.pro.features.exports"),
        t("plans.pro.features.tools"),
        t("plans.pro.features.ai_bg"),
        t("plans.pro.features.ai_extend"),
        t("plans.pro.features.ai_retouch"),
      ],
      featured: true,
      planId: "cplan_37sQEs7KEB66I6RKf4yakAQilLN",
      buttonText: t("plans.pro.button"),
    },
  ];

  return (
    <section className="py-20 " id="pricing">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            {t("title_prefix")}{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
              {t("title_highlight")}
            </span>
          </h2>

          <p className="text-xl text-gray-300 ">{t("description")}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
