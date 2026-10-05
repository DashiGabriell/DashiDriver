import MobileHeader from "@/layouts/mobile/MobileHeader";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const MobileChecklist = () => {
  return (
    <div className="animate-fade-in pb-10">
      <MobileHeader />
      
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
            <Zap className="w-12 h-12 text-accent animate-pulse" />
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-center space-y-4 max-w-sm"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Checklist em Desenvolvimento
          </h1>
          
          <p className="text-base text-muted-foreground leading-relaxed">
            Os programadores estão trabalhando nessa funcionalidade! 🚀
          </p>
          
          <p className="text-sm text-muted-foreground/70 italic">
            Em breve teremos mais uma funcionalidade incrível para você!
          </p>
        </motion.div>

        {/* Animated Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center text-xs text-muted-foreground"
        >
          <p>Acompanhe as atualizações para saber quando estaremos prontos!</p>
        </motion.div>
      </div>
    </div>
  );
};

export default MobileChecklist;
