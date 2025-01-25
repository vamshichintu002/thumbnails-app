import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { ChevronDown, X } from 'lucide-react';

interface MyCreationsProps {
  isLoading: boolean;
  generations: any[];
  onNewThumbnail: () => void;
  onZoomImage: (image: { url: string; title: string }) => void;
  onDownload: (url: string, filename: string) => void;
  zoomedImage: { url: string; title: string } | null;
  onCloseZoom: () => void;
}

interface GenerationItemProps {
  generation: any;
  onZoomImage: (image: { url: string; title: string }) => void;
  onDownload: (url: string, filename: string) => void;
}

type FilterType = 'all' | 'title' | 'image' | 'youtube';

const GenerationItem: React.FC<GenerationItemProps> = ({ generation, onZoomImage, onDownload }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.figure
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-block w-full mb-4 rounded-xl relative",
        "bg-white/5 backdrop-blur-sm overflow-hidden",
        "group cursor-zoom-in"
      )}
      onClick={() => onZoomImage({ 
        url: generation.output_image_url, 
        title: new Date(generation.created_at).toLocaleDateString() 
      })}
    >
      <motion.img
        layoutId={`image-${generation.id}`}
        src={generation.output_image_url}
        alt={`Generated on ${new Date(generation.created_at).toLocaleDateString()}`}
        className="w-full bg-white/5 shadow-xl"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <p className="text-white text-sm font-medium">
            {new Date(generation.created_at).toLocaleDateString()}
          </p>
          <p className="text-white/60 text-xs">
            {generation.generation_type.replace(/_/g, ' ')}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(
                generation.output_image_url,
                `thumbnail-${new Date(generation.created_at).toLocaleDateString()}.png`
              );
            }}
            className="mt-2 px-3 py-1.5 bg-blue-600/90 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 w-fit"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>
      </div>
    </motion.figure>
  );
};

export const MyCreations: React.FC<MyCreationsProps> = ({
  isLoading,
  generations,
  onNewThumbnail,
  onZoomImage,
  onDownload,
  zoomedImage,
  onCloseZoom,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<FilterType>('all');

  const filteredGenerations = generations.filter(generation => {
    return selectedType === 'all' || (() => {
      switch (selectedType) {
        case 'title':
          return generation.generation_type === 'text_to_thumbnail';
        case 'image':
          return generation.generation_type === 'image_to_thumbnail';
        case 'youtube':
          return generation.generation_type === 'youtube_to_thumbnail';
        default:
          return true;
      }
    })();
  });

  const filterTypes: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Title', value: 'title' },
    { label: 'Image', value: 'image' },
    { label: 'YouTube', value: 'youtube' },
  ];

  const hasActiveFilters = selectedType !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Creations</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 rounded-lg border transition-colors text-sm flex items-center gap-2",
                hasActiveFilters 
                  ? "border-[#3749be] text-[#3749be]" 
                  : "border-white/10 text-white hover:border-[#3749be]"
              )}
            >
              Filter
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showFilters && "transform rotate-180"
              )} />
            </button>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl z-10"
                >
                  <div className="p-4 space-y-4">
                    {/* Generation Type Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Generation Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {filterTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setSelectedType(type.value)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs transition-colors",
                              selectedType === type.value
                                ? "bg-[#3749be] text-white"
                                : "bg-white/5 hover:bg-white/10 text-white/80"
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <button
                        onClick={() => setSelectedType('all')}
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/80 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-3 h-3" />
                        Clear Filter
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            onClick={onNewThumbnail}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            New Thumbnail
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : filteredGenerations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">
            {generations.length === 0 
              ? "No thumbnails generated yet" 
              : "No thumbnails match the selected filter"}
          </p>
          {generations.length === 0 ? (
            <button
              onClick={onNewThumbnail}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            >
              Generate Your First Thumbnail
            </button>
          ) : (
            <button
              onClick={() => setSelectedType('all')}
              className="mt-4 px-4 py-2 border border-white/10 hover:border-[#3749be] rounded-lg transition-colors text-sm"
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {filteredGenerations.map((generation) => (
              <GenerationItem
                key={generation.id}
                generation={generation}
                onZoomImage={onZoomImage}
                onDownload={onDownload}
              />
            ))}
          </div>

          {/* Image Zoom Modal */}
          {zoomedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
              onClick={onCloseZoom}
            >
              <div 
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className="relative max-w-full max-h-full flex items-center justify-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={zoomedImage.url}
                    alt={zoomedImage.title}
                    className="max-h-[85vh] max-w-[85vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
                    style={{ 
                      minHeight: '200px',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)'
                    }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseZoom();
                    }}
                    className="absolute -top-4 -right-4 p-2 rounded-full bg-black/80 text-white/80 hover:text-white hover:bg-black shadow-lg hover:shadow-xl transition-all duration-200 border border-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                    <p className="text-white/90 text-sm bg-black/50 backdrop-blur-sm rounded-full py-2 px-6 shadow-lg border border-white/10">
                      Generated on {zoomedImage.title}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
