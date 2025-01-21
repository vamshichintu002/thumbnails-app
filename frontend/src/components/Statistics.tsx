import React from 'react';
import { motion } from 'framer-motion';
import { Users, Image, Clock } from 'lucide-react';
import SpotlightCard from './ui/SpotlightCard';

const stats = [
  {
    number: "1M+",
    label: "Thumbnails Generated",
    icon: Image,
    color: "text-blue-400"
  },
  {
    number: "50K+",
    label: "Active Users",
    icon: Users,
    color: "text-purple-400"
  },
  {
    number: "2.5s",
    label: "Average Generation Time",
    icon: Clock,
    color: "text-green-400"
  }
];

export function Statistics() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SpotlightCard className="p-8 md:p-12">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-flex p-3 rounded-xl ${stat.color} bg-white/5 mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-bold mb-2">{stat.number}</h3>
                  <p className="text-gray-400">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}