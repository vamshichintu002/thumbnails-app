import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wand2, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonColor: string;
  gradientFrom: string;
  gradientTo: string;
  badgeColor: string;
  badgeText: string;
  imageOrder?: string;
  gifSrc: string;
}

function Feature({
  icon,
  title,
  description,
  buttonColor,
  gradientFrom,
  gradientTo,
  badgeColor,
  badgeText,
  imageOrder = '',
  gifSrc
}: FeatureProps) {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid lg:grid-cols-2 gap-12 items-center mb-32 last:mb-0"
    >
      <div className={imageOrder}>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badgeColor} font-medium text-sm mb-6`}>
          {icon}
          {badgeText}
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          {title}
        </h2>
        <p className="text-lg text-gray-400 mb-6">
          {description}
        </p>
        <button 
          onClick={() => navigate('/login')}
          className={`px-6 py-3 ${buttonColor} rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-${gradientFrom}/25`}
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className={`relative group ${imageOrder.includes('order-2') ? 'order-1' : ''}`}>
        <div className="relative overflow-hidden min-h-[350px] md:min-h-[400px] lg:min-h-[500px] w-full flex items-center justify-center p-4 md:p-6">
          <img 
            src={gifSrc} 
            alt={`${title} Demo`}
            className="w-full h-auto max-h-[350px] md:max-h-[450px] object-contain rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-shadow duration-300"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Feature
          icon={<Wand2 className="w-4 h-4" />}
          title="Generate Thumbnails from Video Title"
          description="Our AI analyzes your video title to create eye-catching thumbnails that perfectly match your content's theme and message."
          buttonColor="bg-purple-600 hover:bg-purple-700"
          gradientFrom="purple-600"
          gradientTo="blue-600"
          badgeColor="bg-purple-500/10 text-purple-400"
          badgeText="Smart Title Analysis"
          gifSrc="/gifs/gif1.gif"
        />

        <Feature
          icon={<Users className="w-4 h-4" />}
          title="AI Thumbnail with Custom Faces"
          description="Create professional-looking thumbnails with AI-generated faces that match your content's mood and style."
          buttonColor="bg-blue-600 hover:bg-blue-700"
          gradientFrom="blue-600"
          gradientTo="cyan-600"
          badgeColor="bg-blue-500/10 text-blue-400"
          badgeText="AI Face Generation"
          imageOrder="order-1 lg:order-2"
          gifSrc="/gifs/gif3.gif"
        />

        <Feature
          icon={<Zap className="w-4 h-4" />}
          title="Enhance Existing Thumbnails"
          description="Transform your existing thumbnails with AI-powered enhancements that boost engagement and click-through rates."
          buttonColor="bg-green-600 hover:bg-green-700"
          gradientFrom="green-600"
          gradientTo="emerald-600"
          badgeColor="bg-green-500/10 text-green-400"
          badgeText="Instant Enhancement"
          gifSrc="/gifs/gif2.gif"
        />
      </div>
    </section>
  );
}