import React from 'react';
import { Folder, FolderOpen, Images, Sparkles, RefreshCw } from 'lucide-react';
import { DriveFolder } from '../types/gallery';

interface FolderSelectorProps {
  folders: DriveFolder[];
  selectedFolderId: string;
  onSelectFolder: (folderId: string) => void;
  isLoading: boolean;
  onRefreshFolders: () => void;
  isConnected: boolean;
}

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  isLoading,
  onRefreshFolders,
  isConnected,
}) => {
  if (!isConnected) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none no-scrollbar">
      {/* "All Photos" button */}
      <button
        onClick={() => onSelectFolder('all')}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
          selectedFolderId === 'all'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
        }`}
      >
        <Images className="w-3.5 h-3.5" />
        <span>Tất cả ảnh Drive</span>
      </button>

      {/* Individual folders list */}
      {folders.map((folder) => {
        const isSelected = selectedFolderId === folder.id;
        return (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {isSelected ? (
              <FolderOpen className="w-3.5 h-3.5 text-blue-200" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{folder.name}</span>
          </button>
        );
      })}

      {/* Refresh folders list button */}
      <button
        onClick={onRefreshFolders}
        disabled={isLoading}
        title="Quét lại danh sách thư mục Drive"
        className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};
