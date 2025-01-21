import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from "../../lib/utils";

interface ThumbnailElement {
  id: number;
  url: string;
  title?: string;
  description: string;
  aspectRatio: "16:9" | "9:16";
}

interface GalleryProps {
  items: ThumbnailElement[];
  onDownload?: (item: ThumbnailElement) => void;
}

export function AnimatedGallery({ items, onDownload }: GalleryProps) {
  const [activeItem, setActiveItem] = useState<ThumbnailElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleItemClick = (item: ThumbnailElement) => {
    setActiveItem(item);
    setActiveIndex(items.findIndex(i => i.id === item.id));
  };

  const navigateGallery = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (activeIndex + 1) % items.length
      : (activeIndex - 1 + items.length) % items.length;
    setActiveItem(items[newIndex]);
    setActiveIndex(newIndex);
  };

  return (
    <div className="w-full relative">
      <motion.div
        layout
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="w-full"
      >
        <motion.div
          className="columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3"
          layout
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {items.map((item) => (
            <Gallery
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
              onDownload={onDownload}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Modal View */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setActiveItem(null)}
          >
            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateGallery('prev');
              }}
              className="absolute left-6 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateGallery('next');
              }}
              className="absolute right-6 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
            >
              <ArrowRight className="w-8 h-8" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Main Content */}
            <motion.div
              layoutId={`thumbnail-${activeItem.id}`}
              className="relative w-[90vw] h-[85vh] mx-auto rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeItem.url}
                alt={activeItem.title}
                className="w-full h-full object-contain"
              />
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm"
              >
                <h3 className="text-2xl font-bold mb-2">{activeItem.title || 'Untitled'}</h3>
                <p className="text-gray-200 mb-4 text-base">{activeItem.description}</p>
                {onDownload && (
                  <button
                    onClick={() => onDownload(activeItem)}
                    className="p-3 bg-[#3749be] hover:bg-[#2d3b9e] rounded-lg transition-colors"
                  >
                    <Download className="w-6 h-6" />
                  </button>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Gallery = ({ 
  item, 
  onClick,
  onDownload
}: { 
  item: ThumbnailElement;
  onClick: () => void;
  onDownload?: (item: ThumbnailElement) => void;
}) => {
  return (
    <motion.div
      layoutId={`thumbnail-${item.id}`}
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer break-inside-avoid",
        "bg-white/5 backdrop-blur-sm border border-white/10",
        "hover:border-[#3749be] hover:shadow-lg hover:shadow-[#3749be]/20",
        "transition-all duration-300",
        item.aspectRatio === "16:9" ? "h-[200px] sm:h-[220px]" : "h-[350px] sm:h-[400px]"
      )}
    >
      <motion.img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <p className="text-white font-medium mb-4">{item.title || 'Untitled'}</p>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            {onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(item);
                }}
                className="p-2 bg-[#3749be] hover:bg-[#2d3b9e] rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};