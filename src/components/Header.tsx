import React from 'react';
import { User } from 'firebase/auth';
import {
  Camera,
  RefreshCw,
  Clock,
  LogOut,
  Github,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';
import { SyncStatus } from '../types/gallery';

interface HeaderProps {
  user: User | null;
  syncStatus: SyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
  onManualSync: () => void;
  onToggleAutoSync: () => void;
  onChangeSyncInterval: (interval: number) => void;
  onOpenGitHubPagesGuide: () => void;
  totalPhotos: number;
  isAuthenticating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  syncStatus,
  onSignIn,
  onSignOut,
  onManualSync,
  onToggleAutoSync,
  onChangeSyncInterval,
  onOpenGitHubPagesGuide,
  totalPhotos,
  isAuthenticating,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-zinc-950/85 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  PhotoVault
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-3 h-3 text-blue-500" /> Drive Sync
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal hidden sm:block">
                Bộ sưu tập ảnh cá nhân • Sẵn sàng cho GitHub Pages
              </p>
            </div>
          </div>

          {/* Sync Control & Status Center */}
          <div className="hidden md:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            {/* Auto sync switch */}
            <button
              onClick={onToggleAutoSync}
              title={syncStatus.autoSyncEnabled ? 'Bấm để tạm dừng tự động đồng bộ' : 'Bấm để bật tự động đồng bộ'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                syncStatus.autoSyncEnabled
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus.autoSyncEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                }`}
              />
              {syncStatus.autoSyncEnabled ? 'Tự động cập nhật' : 'Đồng bộ thủ công'}
            </button>

            {/* Sync interval dropdown */}
            {syncStatus.autoSyncEnabled && (
              <select
                value={syncStatus.syncIntervalSeconds}
                onChange={(e) => onChangeSyncInterval(Number(e.target.value))}
                className="text-xs bg-transparent text-zinc-600 dark:text-zinc-400 focus:outline-hidden py-1 px-1.5 rounded-lg border-none cursor-pointer"
                title="Tần suất quét ảnh mới"
              >
                <option value={15}>15 giây</option>
                <option value={30}>30 giây</option>
                <option value={60}>1 phút</option>
                <option value={120}>2 phút</option>
                <option value={300}>5 phút</option>
              </select>
            )}

            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />

            {/* Sync Now button */}
            <button
              onClick={onManualSync}
              disabled={syncStatus.isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
              title="Đồng bộ ảnh từ Google Drive ngay bây giờ"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${
                  syncStatus.isSyncing ? 'animate-spin' : ''
                }`}
              />
              <span>{syncStatus.isSyncing ? 'Đang quét...' : 'Đồng bộ ngay'}</span>
            </button>

            {/* Last synced time */}
            {syncStatus.lastSyncedAt && (
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1 pl-1 pr-2">
                <Clock className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                {syncStatus.lastSyncedAt.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Right Action buttons & Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* GitHub Pages Modal Button */}
            <button
              onClick={onOpenGitHubPagesGuide}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer"
              title="Xem hướng dẫn triển khai lên GitHub Pages"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub Pages</span>
            </button>

            {/* User Profile or Google Sign In */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                <div className="relative group">
                  <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Google Account'}
                        className="w-8 h-8 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="hidden lg:block text-left pr-2">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[120px]">
                        {user.displayName || 'Tài khoản Google'}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Drive đã kết nối
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onSignOut}
                  className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Đăng xuất Google Drive"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onSignIn}
                isLoading={isAuthenticating}
                text="Kết nối Google Drive"
                className="py-2 text-xs"
              />
            )}
          </div>
        </div>

        {/* Mobile Sync status row */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleAutoSync}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                syncStatus.autoSyncEnabled
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus.autoSyncEnabled ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
              />
              {syncStatus.autoSyncEnabled ? 'Tự cập nhật: BẬT' : 'Tự cập nhật: TẮT'}
            </button>
            <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">
              {totalPhotos} ảnh
            </span>
          </div>

          <button
            onClick={onManualSync}
            disabled={syncStatus.isSyncing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium text-xs disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3 h-3 ${syncStatus.isSyncing ? 'animate-spin' : ''}`}
            />
            {syncStatus.isSyncing ? 'Đang quét...' : 'Đồng bộ ngay'}
          </button>
        </div>
      </div>
    </header>
  );
};
