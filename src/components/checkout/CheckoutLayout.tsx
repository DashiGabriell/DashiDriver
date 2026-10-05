import { useState, useEffect } from "react";

// Componente de faixa animada (Rodapé)
const AnimatedBanner = ({ text, direction, bgColor }: { text: string; direction: "left" | "right"; bgColor: string }) => {
  return (
    <div className={`w-full overflow-hidden ${bgColor} py-3 flex items-center mt-auto`}>
      <div 
        className={`whitespace-nowrap flex items-center ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
      >
        {Array(20).fill(text).map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-white font-bold text-lg mx-8">
            <img src="/logo.png" alt="DashiDrive Logo" className="h-6 w-auto" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export const CheckoutLayout = ({ 
  children, 
  title 
}: { 
  children: React.ReactNode; 
  title: string 
}) => {
  const images = [
    "/assets/img-checkout/banner-1.png",
    "/assets/img-checkout/banner-2.png",
    "/assets/img-checkout/banner-3.png",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#009ee3] p-3 flex justify-center items-center shadow-md">
        <div className="flex items-center gap-2">
          <img src="/assets/escudoazul.png" alt="Compra Segura" className="h-8 w-auto" />
          <span className="text-white text-xl font-bold">COMPRA SEGURA</span>
        </div>
      </header>
      
      <div className="container max-w-lg py-10 px-4 flex-grow">
        {/* Banner Slide */}
        <div className="mb-6 rounded-lg overflow-hidden shadow-md">
          <img 
            src={images[currentImage]} 
            alt={`Banner ${currentImage + 1}`} 
            className="w-full h-auto transition-opacity duration-500"
          />
        </div>

        {/* Container do formulário */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center pb-4 border-b">
            {title}
          </h1>

          {/* Conteúdo (Formulário) */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>

      {/* Rodapé Animado */}
      <footer>
        <AnimatedBanner 
          text="DashiDrive, gestão inteligente para locadoras!            " 
          direction="left" 
          bgColor="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-600"
        />
      </footer>
    </div>
  );
};
