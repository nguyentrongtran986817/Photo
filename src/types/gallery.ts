export interface DrivePhoto {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    rotation?: number;
    time?: string;
    cameraMake?: string;
    cameraModel?: string;
    exposureTime?: number;
    aperture?: number;
    flashUsed?: boolean;
    focalLength?: number;
    isoSpeed?: number;
    lens?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      altitude?: number;
    };
  };
  // Runtime UI metadata
  isNew?: boolean;
  blobUrl?: string;
  folderName?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  mimeType: string;
}

export type ViewLayout = 'grid' | 'masonry' | 'columns';

export interface FilterOptions {
  folderId: string; // 'all' or folder ID
  searchQuery: string;
  sortBy: 'date-desc' | 'date-asc' | 'name-asc' | 'size-desc';
  yearFilter: string; // 'all' or '2024', etc.
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  autoSyncEnabled: boolean;
  syncIntervalSeconds: number;
  newPhotosCount: number;
  error: string | null;
}
