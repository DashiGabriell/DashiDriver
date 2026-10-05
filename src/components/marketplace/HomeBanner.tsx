import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BANNERS = [
  "/assets/banner-mktplace-home/banner-1.png",
  "/assets/banner-mktplace-home/banner-2.png",
  "/assets/banner-mktplace-home/banner-3.png",
];

export const HomeBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-44 rounded-[1.25rem] overflow-hidden shadow-neu-sm border border-white/5 bg-muted/20">
      <AnimatePresence mode="wait">
        <motion.img
          key={BANNERS[currentIndex]}
          src={BANNERS[currentIndex]}
          alt={`Banner ${currentIndex + 1}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {BANNERS.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-accent w-4" : "bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Gradient Overlay for better contrast if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};

export default HomeBanner;
