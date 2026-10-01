import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Info,
  Camera,
  Calendar,
  HardDrive,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { DrivePhoto } from '../types/gallery';
import { formatDate, formatFileSize, fetchPhotoBlobUrl } from '../services/drive';
import { getCachedAccessTokenSync } from '../services/firebase';

interface LightboxModalProps {
  photos: DrivePhoto[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  isSlideshowActive: boolean;
  onToggleSlideshow: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  currentIndex,
  onClose,
  onSelectIndex,
  isSlideshowActive,
  onToggleSlideshow,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const currentPhoto = photos[currentIndex];

  const handleNext = useCallback(() => {
    if (photos.length === 0) return;
    setScale(1);
    setRotation(0);
    onSelectIndex((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (photos.length === 0) return;
    setScale(1);
    setRotation(0);
    onSelectIndex((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onSelectIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        onToggleSlideshow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNext, handlePrev, onToggleSlideshow]);

  // Slideshow auto-advance timer
  useEffect(() => {
    if (!isSlideshowActive) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(timer);
  }, [isSlideshowActive, handleNext]);

  if (!currentPhoto) return null;

  const metadata = currentPhoto.imageMediaMetadata;
  // Get high-res photo url: replace thumbnail '=s1000' or '=s220' with '=s2500' for crisp display
  const highResSrc = currentPhoto.thumbnailLink
    ? currentPhoto.thumbnailLink.replace(/=s\d+/, '=s2500')
    : currentPhoto.webContentLink;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = getCachedAccessTokenSync();
      let blobUrl = '';
      if (token && currentPhoto.id && !currentPhoto.id.startsWith('sample-')) {
        blobUrl = await fetchPhotoBlobUrl(currentPhoto.id, token);
      } else {
        blobUrl = highResSrc || '';
      }

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = currentPhoto.name || 'photo.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback
      if (currentPhoto.webContentLink) {
        window.open(currentPhoto.webContentLink, '_blank');
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col select-none text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent">
        {/* Title and Counter */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md">
            {currentIndex + 1} / {photos.length}
          </span>
          <div className="hidden sm:block">
            <h3 className="text-sm font-medium truncate max-w-sm text-zinc-100">
              {currentPhoto.name}
            </h3>
            <p className="text-[11px] text-zinc-400">
              {formatDate(currentPhoto.createdTime || currentPhoto.modifiedTime)}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Slideshow button */}
          <button
            onClick={onToggleSlideshow}
            title={isSlideshowActive ? 'Tạm dừng trình chiếu' : 'Tự động trình chiếu'}
            className={`p-2 rounded-xl transition-all ${
              isSlideshowActive
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            }`}
          >
            {isSlideshowActive ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
          </button>

          {/* Zoom In */}
          <button
            onClick={() => setScale((s) => Math.min(s + 0.3, 3))}
            title="Phóng to"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => setScale((s) => Math.max(s - 0.3, 0.7))}
            title="Thu nhỏ"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Rotate */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            title="Xoay ảnh 90°"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Tải ảnh về máy"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Thông tin EXIF & chi tiết ảnh"
            className={`p-2 rounded-xl transition-colors ${
              showInfo
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-zinc-200'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Drive link */}
          {currentPhoto.webViewLink && (
            <button
              onClick={() => window.open(currentPhoto.webViewLink, '_blank')}
              title="Mở trong Google Drive"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            title="Đóng (Esc)"
            className="p-2 rounded-xl bg-white/15 hover:bg-red-600 text-white transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Photo Viewing Area */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4 sm:p-8">
        {/* Navigation arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-md cursor-pointer"
          title="Ảnh trước (Phím ←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-md cursor-pointer"
          title="Ảnh tiếp theo (Phím →)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* The Image */}
        <div
          className="relative max-w-full max-h-full transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={highResSrc}
            alt={currentPhoto.name}
            className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* EXIF Information Sidebar / Drawer */}
        {showInfo && (
          <div className="absolute right-4 top-4 bottom-4 w-80 bg-zinc-900/90 backdrop-blur-2xl border border-zinc-700/60 rounded-2xl p-5 overflow-y-auto z-30 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
                <Info className="w-4 h-4 text-blue-400" /> Chi tiết ảnh
              </h4>
              <button
                onClick={() => setShowInfo(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <p className="text-zinc-400 text-[11px] uppercase tracking-wider font-medium">
                  Tên tệp
                </p>
                <p className="text-zinc-100 font-medium break-all mt-0.5">
                  {currentPhoto.name}
                </p>
              </div>

              <div>
                <p className="text-zinc-400 text-[11px] uppercase tracking-wider font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" /> Ngày tạo / chụp
                </p>
                <p className="text-zinc-100 mt-0.5">
                  {formatDate(currentPhoto.createdTime || currentPhoto.modifiedTime)}
                </p>
              </div>

              {currentPhoto.size && (
                <div>
                  <p className="text-zinc-400 text-[11px] uppercase tracking-wider font-medium flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-zinc-500" /> Dung lượng
                  </p>
                  <p className="text-zinc-100 mt-0.5">
                    {formatFileSize(currentPhoto.size)}
                  </p>
                </div>
              )}

              {metadata?.width && metadata?.height && (
                <div>
                  <p className="text-zinc-400 text-[11px] uppercase tracking-wider font-medium flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-zinc-500" /> Độ phân giải
                  </p>
                  <p className="text-zinc-100 mt-0.5">
                    {metadata.width} × {metadata.height} px
                  </p>
                </div>
              )}

              {/* Camera & Lens Specs */}
              {metadata && (metadata.cameraModel || metadata.cameraMake) && (
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <p className="text-blue-400 text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> Thông số máy ảnh (EXIF)
                  </p>

                  {metadata.cameraModel && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Máy ảnh:</span>
                      <span className="text-zinc-100 font-medium">
                        {metadata.cameraMake} {metadata.cameraModel}
                      </span>
                    </div>
                  )}

                  {metadata.lens && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ống kính:</span>
                      <span className="text-zinc-100 font-medium truncate max-w-[160px]">
                        {metadata.lens}
                      </span>
                    </div>
                  )}

                  {metadata.focalLength && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Tiêu cự:</span>
                      <span className="text-zinc-100 font-medium">
                        {metadata.focalLength} mm
                      </span>
                    </div>
                  )}

                  {metadata.aperture && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Khẩu độ:</span>
                      <span className="text-zinc-100 font-medium">
                        ƒ/{metadata.aperture}
                      </span>
                    </div>
                  )}

                  {metadata.exposureTime && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Tốc độ màn trập:</span>
                      <span className="text-zinc-100 font-medium">
                        {metadata.exposureTime < 1
                          ? `1/${Math.round(1 / metadata.exposureTime)}s`
                          : `${metadata.exposureTime}s`}
                      </span>
                    </div>
                  )}

                  {metadata.isoSpeed && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">ISO:</span>
                      <span className="text-zinc-100 font-medium">
                        {metadata.isoSpeed}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {currentPhoto.folderName && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-zinc-800 text-zinc-300">
                    Thư mục: {currentPhoto.folderName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div className="h-20 bg-black/80 backdrop-blur-md px-4 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-zinc-800/80">
        {photos.map((p, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={p.id}
              onClick={() => {
                setScale(1);
                setRotation(0);
                onSelectIndex(idx);
              }}
              className={`relative h-14 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={p.thumbnailLink || p.webContentLink}
                alt={p.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
