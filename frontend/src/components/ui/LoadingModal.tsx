import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingModalProps {
  isOpen: boolean;
}

const steps = [
  'Analyzing Title for Maximum Clickability',
  'Checking Algorithm Trends for Best Styles',
  'Using AI Data to Generate High-Performing Designs',
  'Selecting Engaging Colors & Visual Elements',
  'Ensuring Attention-Grabbing Visual Impact',
  'Optimizing Subject Positioning',
  'Placing Bold, Readable Text',
  'Adding Strategic Elements for CTR',
  'Applying Cinematic Lighting & Depth',
  'Final AI Enhancements for Viral Patterns'
];

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setCycleCount(0);
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = (prev + 1) % steps.length;
          if (nextStep === 0) {
            setCycleCount(c => c + 1);
          }
          return nextStep;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const percentage = ((currentStep + 1) / steps.length * 100).toFixed(0);
  const stepDisplay = `${currentStep + 1}/10`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl"
        >
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Glassmorphic Card */}
            <div className="relative bg-muted/30 rounded-xl border-2 border-brand/20 shadow-2xl shadow-brand/20 backdrop-blur-2xl
                          before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-r before:from-brand/10 before:to-brand-foreground/10
                          after:absolute after:inset-0 after:-z-20 after:rounded-xl after:bg-gradient-to-r after:from-brand/5 after:to-brand-foreground/5">
              {/* Gradient Orbs */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-foreground rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
              
              <div className="relative p-6">
                {/* Header with Percentage */}
                <div className="text-center mb-6">
                  <div className="inline-block">
                    <h2 className="text-lg font-bold tracking-tight mb-1 bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                      GENERATING THUMBNAIL
                    </h2>
                    <div className="h-0.5 w-full bg-gradient-to-r from-brand via-brand-foreground to-brand rounded-full" />
                  </div>
                  <motion.h3
                    className="mt-3 text-sm font-medium bg-gradient-to-r from-brand to-brand-foreground bg-clip-text text-transparent"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    AI Processing in Progress
                  </motion.h3>
                  <div className="mt-1 text-sm font-medium text-foreground/80">
                    {stepDisplay}
                  </div>
                </div>

                {/* Current Step Display */}
                <div className="relative h-12 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={currentStep}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0 }}
                      transition={{
                        y: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                      }}
                      className="absolute text-center text-foreground/90 font-medium"
                    >
                      {steps[currentStep]}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-brand/30 p-0.5 
                                shadow-[0_0_20px_rgba(var(--brand-rgb),0.3)] relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-brand to-brand-foreground rounded-full 
                               shadow-[0_0_15px_rgba(var(--brand-rgb),0.7),inset_0_0_10px_rgba(255,255,255,0.3)] 
                               relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:to-white/30
                               after:absolute after:inset-0 after:bg-[radial-gradient(farthest-side_at_top,rgba(255,255,255,0.3),transparent)]"
                      animate={{
                        width: `${percentage}%`,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Animated glow effect */}
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                        animate={{
                          x: ['-100%', '200%'],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </motion.div>
                  </div>
                  <div className="mt-1.5 flex justify-between text-xs">
                    <span className="text-brand font-medium tracking-wide">Progress</span>
                    <span className="text-brand-foreground font-medium tracking-wide">{percentage}%</span>
                  </div>
                </div>

                {/* Cycle Counter */}
                <div className="mt-3 text-center text-xs font-medium text-muted-foreground/80 tracking-wide">
                  Optimization Cycle: {cycleCount + 1}
                </div>

                {/* Loading Animation */}
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-brand/50"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingModal;
