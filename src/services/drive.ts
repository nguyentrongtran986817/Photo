import { DrivePhoto, DriveFolder } from '../types/gallery';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';

// Cache for loaded high-res image blob URLs to prevent redundant network calls
const imageBlobCache = new Map<string, string>();

/**
 * List all folders in Google Drive to let the user select a specific photo album folder
 */
export async function fetchDriveFolders(accessToken: string): Promise<DriveFolder[]> {
  try {
    const q = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const url = new URL(`${DRIVE_API_URL}/files`);
    url.searchParams.append('q', q);
    url.searchParams.append('fields', 'files(id, name, mimeType)');
    url.searchParams.append('pageSize', '50');
    url.searchParams.append('orderBy', 'name');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại Google Drive.');
      }
      const errText = await res.text();
      throw new Error(`Lỗi Google Drive API (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err: any) {
    console.error('Error fetching folders:', err);
    throw err;
  }
}

/**
 * Fetch photos from Google Drive with optional folder filtering and search query
 */
export async function fetchDrivePhotos(
  accessToken: string,
  options?: {
    folderId?: string;
    searchQuery?: string;
    pageToken?: string;
    pageSize?: number;
  }
): Promise<{ files: DrivePhoto[]; nextPageToken?: string }> {
  try {
    let q = "mimeType contains 'image/' and trashed = false";

    if (options?.folderId && options.folderId !== 'all') {
      q += ` and '${options.folderId}' in parents`;
    }

    if (options?.searchQuery && options.searchQuery.trim() !== '') {
      const sanitized = options.searchQuery.replace(/'/g, "\\'");
      q += ` and name contains '${sanitized}'`;
    }

    const url = new URL(`${DRIVE_API_URL}/files`);
    url.searchParams.append('q', q);
    url.searchParams.append(
      'fields',
      'nextPageToken, files(id, name, mimeType, description, thumbnailLink, webViewLink, webContentLink, imageMediaMetadata, size, createdTime, modifiedTime, parents)'
    );
    url.searchParams.append('pageSize', String(options?.pageSize || 100));
    url.searchParams.append('orderBy', 'createdTime desc, modifiedTime desc');

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Phiên làm việc Google Drive đã hết hạn.');
      }
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err.error?.message || 'Không thể tải ảnh từ Google Drive');
    }

    const data = await res.json();
    const photos: DrivePhoto[] = (data.files || []).map((file: any) => {
      // Enhance thumbnail quality by default if thumbnailLink exists
      let enhancedThumbnail = file.thumbnailLink;
      if (enhancedThumbnail) {
        // Replace Google thumbnail parameter `=s220` with larger high-res preview `=s1000`
        enhancedThumbnail = enhancedThumbnail.replace(/=s\d+/, '=s1000');
      }

      return {
        ...file,
        id: file.id || String(Math.random()),
        name: file.name || 'Ảnh chưa đặt tên',
        thumbnailLink: enhancedThumbnail,
      };
    });

    return {
      files: photos,
      nextPageToken: data.nextPageToken,
    };
  } catch (err: any) {
    console.error('Error fetching drive photos:', err);
    throw err;
  }
}

/**
 * Fetch full-resolution image data as an Object URL using the access token
 * This guarantees the image displays even when direct webContentLink blocks cookies/CORS
 */
export async function fetchPhotoBlobUrl(fileId: string, accessToken: string): Promise<string> {
  if (imageBlobCache.has(fileId)) {
    return imageBlobCache.get(fileId)!;
  }

  try {
    const res = await fetch(`${DRIVE_API_URL}/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Không thể tải ảnh gốc (${res.status})`);
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    imageBlobCache.set(fileId, blobUrl);
    return blobUrl;
  } catch (err) {
    console.error(`Failed to fetch blob for file ${fileId}:`, err);
    throw err;
  }
}

/**
 * Clean up blob URLs when no longer needed
 */
export function clearImageBlobCache() {
  for (const url of imageBlobCache.values()) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  }
  imageBlobCache.clear();
}

/**
 * Format bytes to readable size safely
 */
export function formatFileSize(bytesStr?: string): string {
  if (!bytesStr) return 'Không rõ';
  const bytes = parseInt(bytesStr, 10);
  if (isNaN(bytes) || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format ISO date string to Vietnamese localized date
 */
export function formatDate(isoString?: string): string {
  if (!isoString) return 'Gần đây';
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}
