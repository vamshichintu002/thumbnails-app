import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface MyCreationsProps {
  isLoading: boolean;
  generations: any[];
  onNewThumbnail: () => void;
  onZoomImage: (image: { url: string; title: string }) => void;
  onDownload: (url: string, filename: string) => void;
  zoomedImage: { url: string; title: string } | null;
  onCloseZoom: () => void;
}

export const MyCreations: React.FC<MyCreationsProps> = ({
  isLoading,
  generations,
  onNewThumbnail,
  onZoomImage,
  onDownload,
  zoomedImage,
  onCloseZoom,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Creations</h2>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-white/10 hover:border-[#3749be] transition-colors text-sm">
            Filter
          </button>
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
      ) : generations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-white/60">No thumbnails generated yet</p>
          <button
            onClick={onNewThumbnail}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
          >
            Generate Your First Thumbnail
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {generations.map((generation) => (
              <motion.div
                key={generation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onZoomImage({ 
                  url: generation.output_image_url, 
                  title: new Date(generation.created_at).toLocaleDateString() 
                })}
                className={cn(
                  "group relative rounded-xl overflow-hidden cursor-zoom-in h-full",
                  "bg-white/5 backdrop-blur-sm border border-white/10",
                  "hover:border-[#3749be] hover:shadow-lg hover:shadow-[#3749be]/20",
                  "transition-all duration-300",
                  "aspect-video"
                )}
              >
                <motion.img
                  src={generation.output_image_url}
                  alt={`Generated on ${new Date(generation.created_at).toLocaleDateString()}`}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
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
              </motion.div>
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
