interface AnimatedBannerProps {
  text: string;
  direction: "left" | "right";
  bgColor: string;
}

const AnimatedBanner = ({ text, direction, bgColor }: AnimatedBannerProps) => {
  return (
    <div className={`w-full overflow-hidden ${bgColor} py-3 flex items-center`}>
      <div
        className={`whitespace-nowrap flex items-center ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
      >
        {Array(20).fill(text).map((t, i) => (
          <span key={i} className="text-white font-bold text-lg mx-8">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnimatedBanner;
