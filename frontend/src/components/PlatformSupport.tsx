import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Video } from 'lucide-react';
import { AspectRatioIcon } from './ui/aspect-ratio-icon';
import SpotlightCard from './ui/SpotlightCard';

const platforms = [
  {
    name: "YouTube",
    icon: Youtube,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    ratios: ["16:9","9:16"],
    description: "Perfect for standard YouTube thumbnails"
  },
  {
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    ratios: ["9:16"],
    description: "Optimized for feed posts and reels"
  },
  {
    name: "TikTok",
    icon: Video,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    ratios: ["9:16"],
    description: "Vertical format for TikTok covers"
  }
];

export function PlatformSupport() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Multi-Platform Support
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Generate thumbnails optimized for every major social platform with the perfect aspect ratios
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {platforms.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <SpotlightCard className="h-full p-6">
                  <div className={`${platform.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-6 h-6 ${platform.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
                  <p className="text-gray-400 mb-6">{platform.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {platform.ratios.map(ratio => (
                      <div
                        key={ratio}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm"
                      >
                        <AspectRatioIcon ratio={ratio as "16:9" | "9:16" | "1:1" | "4:5"} className="w-4 h-4" />
                        {ratio}
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}