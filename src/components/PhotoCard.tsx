import React, { useState } from 'react';
import {
  ExternalLink,
  Maximize2,
  Calendar,
  Sparkles,
  Camera,
  HardDrive,
} from 'lucide-react';
import { DrivePhoto } from '../types/gallery';
import { formatDate, formatFileSize } from '../services/drive';

interface PhotoCardProps {
  photo: DrivePhoto;
  onClick: () => void;
  index: number;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fallback placeholder if image fails to load directly
  const imageSrc =
    photo.thumbnailLink ||
    photo.webContentLink ||
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';

  const metadata = photo.imageMediaMetadata;
  const resolutionText =
    metadata?.width && metadata?.height
      ? `${metadata.width} × ${metadata.height}`
      : null;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      style={{
        animationDelay: `${Math.min(index * 35, 400)}ms`,
      }}
    >
      {/* Aspect ratio container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800 animate-pulse" />
        )}

        <img
          src={imageSrc}
          alt={photo.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {photo.isNew ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md animate-bounce">
              <Sparkles className="w-3 h-3" /> Mới cập nhật
            </span>
          ) : (
            <div />
          )}

          {resolutionText && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white/90">
              {resolutionText}
            </span>
          )}
        </div>

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
          <p className="font-semibold text-sm truncate text-white drop-shadow-xs">
            {photo.name}
          </p>

          <div className="flex items-center gap-3 text-xs text-zinc-300 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              {formatDate(photo.createdTime || photo.modifiedTime)}
            </span>

            {photo.size && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <HardDrive className="w-2.5 h-2.5" />
                {formatFileSize(photo.size)}
              </span>
            )}
          </div>

          {metadata?.cameraModel && (
            <div className="flex items-center gap-1 text-[11px] text-blue-300 mt-1">
              <Camera className="w-3 h-3" />
              <span>{metadata.cameraModel}</span>
              {metadata.focalLength && <span>• {metadata.focalLength}mm</span>}
            </div>
          )}

          {/* Quick Actions inside Card overlay */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/15">
            <span className="text-[11px] font-medium text-white/80 flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Phóng to chi tiết
            </span>

            {photo.webViewLink && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(photo.webViewLink, '_blank', 'noopener,noreferrer');
                }}
                title="Mở ảnh trong Google Drive"
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
