import Contact from "@/components/contact";
import Features from "@/components/features";
import Footer from "@/components/footer";
import HeroSection from "@/components/hero";
import Pricing from "@/components/pricing";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const stats = [
    { label: "Image processed", value: 10000, suffix: "+" },
    { label: "Active Users", value: 500, suffix: "+" },
    { label: "AI Transformations", value: 45000, suffix: "+" },
    { label: "User Satisfaction", value: 98, suffix: "%" },
  ];

  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* stats */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              return (
                <div key={index} className="text-center">
                  <div className="text-4xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {stat.value.toLocaleString()}
                    {stat.suffix}
                  </div>
                  <div className="text-gray-400 uppercase tracking-wider text-sm">
                    {stat.label}
                  </div>
                  <div></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* features */}
      <Features />

      {/* pricing */}
      <Pricing />

      {/* contact */}
      <Contact />

      {/* footer */}
      <Footer />
    </div>
  );
}
