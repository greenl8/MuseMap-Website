import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import type { MediaLibrary, MediaImage, MediaVideo, MediaWriting } from '../types';

interface Props {
  media: MediaLibrary;
  year: number;
  onBack: () => void;
}

const MediaLibraryView: React.FC<Props> = ({ media, year, onBack }) => {
  const [selectedImage, setSelectedImage] = useState<MediaImage | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);
  const [selectedWriting, setSelectedWriting] = useState<MediaWriting | null>(null);

  const hasContent = 
    (media.images && media.images.length > 0) ||
    (media.videos && media.videos.length > 0) ||
    (media.writing && media.writing.length > 0);

  if (!hasContent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full h-full flex items-center justify-center text-slate-400"
      >
        <p>No media available for {year}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12"
    >
      {/* Title Section */}
      <div className="mb-12">
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {year} Media Library
        </motion.h2>
        <motion.p
          className="text-green-300 text-lg md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Images, Videos & Writing
        </motion.p>
      </div>

      {/* Images Section */}
      {media.images && media.images.length > 0 && (
        <div className="relative">
          <h3 className="text-2xl md:text-3xl font-semibold text-green-300 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            Images
            <span className="text-green-400/60 text-lg font-normal">({media.images.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {media.images.map((image, index) => (
              <motion.div
                key={image.id}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 border-green-500/20 hover:border-green-400/40 transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setSelectedImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <span className="text-white text-sm font-medium truncate w-full">
                    {image.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {media.videos && media.videos.length > 0 && (
        <div className="relative">
          <h3 className="text-2xl md:text-3xl font-semibold text-green-300 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Videos
            <span className="text-green-400/60 text-lg font-normal">({media.videos.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {media.videos.map((video, index) => (
              <motion.div
                key={video.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative w-full rounded-xl overflow-hidden border-2 border-green-500/20 hover:border-green-400/40 transition-all" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
                  <div className="absolute inset-0 bg-slate-800">
                    <YouTube
                      videoId={video.youtubeId}
                      opts={{
                        width: '100%',
                        height: '100%',
                        playerVars: {
                          autoplay: 0,
                          controls: 1,
                          modestbranding: 1,
                          rel: 0,
                        },
                      }}
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
                {video.title && (
                  <h4 className="text-white font-semibold mt-4 text-lg">{video.title}</h4>
                )}
                {video.description && (
                  <p className="text-slate-400 text-sm mt-2">{video.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Writing Section */}
      {media.writing && media.writing.length > 0 && (
        <div className="relative">
          <h3 className="text-2xl md:text-3xl font-semibold text-green-300 mb-6 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Writing
            <span className="text-green-400/60 text-lg font-normal">({media.writing.length})</span>
          </h3>
          <div className="space-y-6">
            {media.writing.map((writing, index) => (
              <motion.div
                key={writing.id}
                className="bg-slate-800/50 rounded-xl p-6 md:p-8 border-2 border-green-500/20 hover:border-green-400/40 transition-all backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <h4 className="text-white font-semibold text-xl md:text-2xl mb-3">{writing.title}</h4>
                {writing.description && (
                  <p className="text-green-300 text-sm md:text-base mb-6 font-medium">{writing.description}</p>
                )}
                <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-base md:text-lg">{writing.content}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-7xl max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
              {selectedImage.title && (
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-4">
                  <h4 className="text-white font-semibold">{selectedImage.title}</h4>
                  {selectedImage.description && (
                    <p className="text-slate-300 text-sm mt-1">{selectedImage.description}</p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MediaLibraryView;

