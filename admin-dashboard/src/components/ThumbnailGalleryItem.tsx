import React from 'react';
import { motion } from 'framer-motion';
import { ImageDisplay } from '../types';
import { cn } from '../lib/utils';

interface ThumbnailGalleryItemProps {
  image: ImageDisplay;
  onClick: (image: ImageDisplay) => void;
}

const ThumbnailGalleryItem: React.FC<ThumbnailGalleryItemProps> = ({ image, onClick }) => {
  // Determine if this is a vertical thumbnail
  const isVertical = image.aspectRatio === '9:16';
  
  return (
    <motion.figure
      layoutId={`thumbnail-${image.id}`}
      className={cn(
        "inline-block w-full mb-4 rounded-xl relative bg-white/5 backdrop-blur-sm overflow-hidden group cursor-zoom-in",
        isVertical ? "break-inside-avoid max-h-[500px]" : ""
      )}
      onClick={() => onClick(image)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn(
        "relative bg-white/5",
        isVertical ? "pb-[177.78%]" : "pb-[56.25%]" // 16:9 = 56.25%, 9:16 = 177.78%
      )}>
        <img 
          src={image.thumbnailUrl} 
          alt={image.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </motion.figure>
  );
};

export default ThumbnailGalleryItem; 