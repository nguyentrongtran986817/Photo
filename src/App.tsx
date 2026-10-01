/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebase';
import {
  fetchDrivePhotos,
  fetchDriveFolders,
} from './services/drive';
import { SAMPLE_PHOTOS } from './data/samplePhotos';
import {
  DrivePhoto,
  DriveFolder,
  FilterOptions,
  ViewLayout,
  SyncStatus,
} from './types/gallery';
import { Header } from './components/Header';
import { FolderSelector } from './components/FolderSelector';
import { FilterBar } from './components/FilterBar';
import { PhotoCard } from './components/PhotoCard';
import { LightboxModal } from './components/LightboxModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import {
  Sparkles,
  Image as ImageIcon,
  FolderSync,
  AlertCircle,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Photos & folders state
  const [photos, setPhotos] = useState<DrivePhoto[]>(SAMPLE_PHOTOS);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Layout state
  const [filter, setFilter] = useState<FilterOptions>({
    folderId: 'all',
    searchQuery: '',
    sortBy: 'date-desc',
    yearFilter: 'all',
  });
  const [layout, setLayout] = useState<ViewLayout>('grid');

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncedAt: null,
    autoSyncEnabled: true,
    syncIntervalSeconds: 30,
    newPhotosCount: 0,
    error: null,
  });

  // Modal & viewer states
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [isGitHubPagesModalOpen, setIsGitHubPagesModalOpen] = useState(false);

  // Ref to track existing photo IDs to highlight newly found photos
  const knownPhotoIdsRef = useRef<Set<string>>(new Set(SAMPLE_PHOTOS.map((p) => p.id)));

  // Listen to Firebase Auth state on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch photos from Google Drive
  const loadPhotos = useCallback(
    async (token: string, folderId: string = 'all', isBackgroundSync: boolean = false) => {
      if (!isBackgroundSync) {
        setIsLoading(true);
      }
      setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

      try {
        const { files } = await fetchDrivePhotos(token, {
          folderId: folderId === 'all' ? undefined : folderId,
          pageSize: 100,
        });

        // Detect newly added photos during auto-sync
        const currentKnownIds = knownPhotoIdsRef.current;
        let newCount = 0;

        const updatedPhotos: DrivePhoto[] = files.map((file) => {
          const isNewlyDiscovered =
            currentKnownIds.size > 0 && !currentKnownIds.has(file.id);
          if (isNewlyDiscovered) {
            newCount++;
          }
          return {
            ...file,
            isNew: isNewlyDiscovered,
          };
        });

        // Update known IDs ref
        const newIds = new Set(files.map((f) => f.id));
        knownPhotoIdsRef.current = newIds;

        setPhotos(updatedPhotos);
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date(),
          newPhotosCount: newCount,
          error: null,
        }));
        setError(null);
      } catch (err: any) {
        console.error('Failed to load photos from Google Drive:', err);
        const errMsg = err?.message || 'Không thể đồng bộ ảnh từ Google Drive';
        setSyncStatus((prev) => ({ ...prev, isSyncing: false, error: errMsg }));
        if (!isBackgroundSync) {
          setError(errMsg);
        }
      } finally {
        if (!isBackgroundSync) {
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Fetch folder list from Drive
  const loadFolders = useCallback(async (token: string) => {
    setIsLoadingFolders(true);
    try {
      const folderList = await fetchDriveFolders(token);
      setFolders(folderList);
    } catch (err) {
      console.warn('Could not list folders:', err);
    } finally {
      setIsLoadingFolders(false);
    }
  }, []);

  // When user logs in or accessToken changes, load folders and photos
  useEffect(() => {
    if (accessToken) {
      loadPhotos(accessToken, filter.folderId, false);
      loadFolders(accessToken);
    }
  }, [accessToken, filter.folderId, loadPhotos, loadFolders]);

  // Automatic periodic sync interval
  useEffect(() => {
    if (!accessToken || !syncStatus.autoSyncEnabled) return;

    const intervalMs = Math.max(syncStatus.syncIntervalSeconds, 10) * 1000;
    const intervalTimer = setInterval(() => {
      loadPhotos(accessToken, filter.folderId, true);
    }, intervalMs);

    return () => clearInterval(intervalTimer);
  }, [
    accessToken,
    syncStatus.autoSyncEnabled,
    syncStatus.syncIntervalSeconds,
    filter.folderId,
    loadPhotos,
  ]);

  // Auth Handlers
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err?.message || 'Đăng nhập Google thất bại');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setPhotos(SAMPLE_PHOTOS);
    knownPhotoIdsRef.current = new Set(SAMPLE_PHOTOS.map((p) => p.id));
    setFolders([]);
  };

  const handleManualSync = () => {
    if (accessToken) {
      loadPhotos(accessToken, filter.folderId, false);
    } else {
      // Simulate sync for sample photos
      setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
      setTimeout(() => {
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date(),
        }));
      }, 700);
    }
  };

  // Filter and Sorting calculations
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    (photos || []).forEach((p) => {
      const dateStr = p?.createdTime || p?.modifiedTime;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          years.add(String(d.getFullYear()));
        }
      }
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    let result = [...(photos || [])];

    // Search query
    if (filter.searchQuery.trim() !== '') {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.folderName || '').toLowerCase().includes(q)
      );
    }

    // Year filter
    if (filter.yearFilter !== 'all') {
      result = result.filter((p) => {
        const dateStr = p.createdTime || p.modifiedTime;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        return d.getFullYear().toString() === filter.yearFilter;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (filter.sortBy === 'date-desc') {
        const timeA = new Date(a.createdTime || a.modifiedTime || 0).getTime() || 0;
        const timeB = new Date(b.createdTime || b.modifiedTime || 0).getTime() || 0;
        return timeB - timeA;
      }
      if (filter.sortBy === 'date-asc') {
        const timeA = new Date(a.createdTime || a.modifiedTime || 0).getTime() || 0;
        const timeB = new Date(b.createdTime || b.modifiedTime || 0).getTime() || 0;
        return timeA - timeB;
      }
      if (filter.sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (filter.sortBy === 'size-desc') {
        const sizeA = parseInt(a.size || '0', 10) || 0;
        const sizeB = parseInt(b.size || '0', 10) || 0;
        return sizeB - sizeA;
      }
      return 0;
    });

    return result;
  }, [photos, filter]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        user={user}
        syncStatus={syncStatus}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onManualSync={handleManualSync}
        onToggleAutoSync={() =>
          setSyncStatus((prev) => ({
            ...prev,
            autoSyncEnabled: !prev.autoSyncEnabled,
          }))
        }
        onChangeSyncInterval={(interval) =>
          setSyncStatus((prev) => ({ ...prev, syncIntervalSeconds: interval }))
        }
        onOpenGitHubPagesGuide={() => setIsGitHubPagesModalOpen(true)}
        totalPhotos={filteredPhotos.length}
        isAuthenticating={isAuthenticating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner notification if not connected to Google Drive */}
        {!user && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-6 sm:p-8 shadow-xl shadow-blue-500/10">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Đồng bộ trực tiếp từ Google Drive
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  Trưng bày và Tự động Cập nhật Ảnh từ Google Drive
                </h2>
                <p className="text-sm text-blue-100 font-normal leading-relaxed">
                  Liên kết tài khoản Google Drive để hiển thị toàn bộ album cá nhân của bạn.
                  Website sẽ tự động phát hiện và cập nhật ảnh mới, đồng thời sẵn sàng để bạn đưa lên GitHub Pages chỉ với vài thao tác!
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <GoogleSignInButton
                  onClick={handleSignIn}
                  isLoading={isAuthenticating}
                  text="Kết nối Google Drive ngay"
                  className="bg-white text-zinc-900 border-none shadow-lg hover:bg-blue-50 font-semibold"
                />
              </div>
            </div>

            {/* Subtle decorative circles */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute right-1/3 -top-12 w-48 h-48 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
          </div>
        )}

        {/* Error notification banner if any */}
        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 text-red-700 dark:text-red-300 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    {error.includes('unauthorized-domain')
                      ? 'Lỗi tên miền chưa được cấp phép (auth/unauthorized-domain)'
                      : 'Đã xảy ra lỗi kết nối'}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                    {error.includes('unauthorized-domain')
                      ? `Tên miền hiện tại (${typeof window !== 'undefined' ? window.location.hostname : 'GitHub Pages'}) chưa được thêm vào mục Authorized Domains của Firebase Authentication.`
                      : error}
                  </p>

                  {error.includes('unauthorized-domain') && (
                    <div className="mt-3 p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-red-200/80 dark:border-red-900/60 text-xs text-zinc-700 dark:text-zinc-300 space-y-2">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        👉 <strong>Cách khắc phục trong 30 giây (không cần deploy lại):</strong>
                      </p>
                      <ol className="list-decimal pl-4 space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                        <li>
                          Mở trang cài đặt:{' '}
                          <a
                            href="https://console.firebase.google.com/project/gen-lang-client-0673049679/authentication/settings"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-semibold underline inline-flex items-center gap-1"
                          >
                            Firebase Console &gt; Authentication &gt; Settings
                          </a>
                        </li>
                        <li>
                          Cuộn xuống mục <strong>Authorized domains</strong> (Miền được ủy quyền) &gt; bấm <strong>Add domain</strong> (Thêm miền).
                        </li>
                        <li>
                          Nhập tên miền:{' '}
                          <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 font-bold">
                            {typeof window !== 'undefined' ? window.location.hostname : 'nguyentrongtran986817.github.io'}
                          </code>{' '}
                          rồi bấm <strong>Add</strong>.
                        </li>
                        <li>
                          Quay lại đây và bấm nút <strong>"Kết nối Google Drive ngay"</strong> là hoàn tất!
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline shrink-0"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Connected account summary bar */}
        {user && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Nguồn dữ liệu:
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  Google Drive ({user.email})
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tự động đồng bộ: {syncStatus.autoSyncEnabled ? 'Đang bật' : 'Tạm dừng'}
              </span>
              <span>•</span>
              <span>Tổng số: {photos.length} ảnh trong Drive</span>
            </div>
          </div>
        )}

        {/* Folder Selector (Drive albums) */}
        <FolderSelector
          folders={folders}
          selectedFolderId={filter.folderId}
          onSelectFolder={(folderId) =>
            setFilter((prev) => ({ ...prev, folderId }))
          }
          isLoading={isLoadingFolders}
          onRefreshFolders={() => accessToken && loadFolders(accessToken)}
          isConnected={Boolean(user)}
        />

        {/* Filter and View Layout Controls */}
        <FilterBar
          filter={filter}
          onFilterChange={(newFilter) =>
            setFilter((prev) => ({ ...prev, ...newFilter }))
          }
          availableYears={availableYears}
          layout={layout}
          onLayoutChange={setLayout}
          onStartSlideshow={() => {
            if (filteredPhotos.length > 0) {
              setSelectedPhotoIndex(0);
              setIsSlideshowActive(true);
            }
          }}
          totalFilteredPhotos={filteredPhotos.length}
        />

        {/* Photo Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-4/3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredPhotos.length > 0 ? (
          <div
            className={`grid gap-4 sm:gap-6 ${
              layout === 'columns'
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                onClick={() => {
                  setSelectedPhotoIndex(index);
                  setIsSlideshowActive(false);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
              Không tìm thấy bức ảnh nào
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              Thử tìm kiếm với từ khóa khác, hoặc chọn thư mục ảnh khác từ danh mục phía trên.
            </p>
            {(filter.searchQuery || filter.yearFilter !== 'all') && (
              <button
                onClick={() =>
                  setFilter((prev) => ({
                    ...prev,
                    searchQuery: '',
                    yearFilter: 'all',
                  }))
                }
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 mt-12 bg-white/50 dark:bg-zinc-950/50 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              PhotoVault
            </span>
            <span>•</span>
            <span>Đồng bộ tự động từ Google Drive</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGitHubPagesModalOpen(true)}
              className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
            >
              Cách triển khai lên GitHub Pages
            </button>
            <span>•</span>
            <span>{photos.length} ảnh đã nạp</span>
          </div>
        </div>
      </footer>

      {/* Lightbox / Fullscreen Modal */}
      {selectedPhotoIndex !== null && (
        <LightboxModal
          photos={filteredPhotos}
          currentIndex={selectedPhotoIndex}
          onClose={() => {
            setSelectedPhotoIndex(null);
            setIsSlideshowActive(false);
          }}
          onSelectIndex={setSelectedPhotoIndex}
          isSlideshowActive={isSlideshowActive}
          onToggleSlideshow={() => setIsSlideshowActive(!isSlideshowActive)}
        />
      )}

      {/* GitHub Pages Guide & Export Modal */}
      <GitHubPagesModal
        isOpen={isGitHubPagesModalOpen}
        onClose={() => setIsGitHubPagesModalOpen(false)}
        currentPhotos={photos}
      />
    </div>
  );
}
