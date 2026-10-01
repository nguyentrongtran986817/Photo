import React, { useState } from 'react';
import {
  X,
  Github,
  Check,
  Copy,
  ExternalLink,
  Download,
  Terminal,
  ShieldCheck,
  Globe,
  FileCode,
} from 'lucide-react';
import { DrivePhoto } from '../types/gallery';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotos: DrivePhoto[];
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({
  isOpen,
  onClose,
  currentPhotos,
}) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'oauth' | 'export'>('deploy');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(currentPhotos, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'gallery-photos-export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const gitCommands = `# 1. Khởi tạo kho lưu trữ Git
git init
git add .
git commit -m "Initial commit: Photo Gallery with Google Drive Sync"

# 2. Đổi tên nhánh chính sang main
git branch -M main

# 3. Liên kết với kho lưu trữ GitHub của bạn
git remote add origin https://github.com/<tai-khoan-github>/<ten-repo>.git

# 4. Đẩy mã nguồn lên GitHub
git push -u origin main`;

  const workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Hướng dẫn triển khai lên GitHub Pages
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Đưa website trưng bày ảnh cá nhân lên tên miền miễn phí GitHub Pages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'deploy'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>1. Các bước đẩy lên GitHub Pages</span>
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`py-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'oauth'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Cấu hình Google Drive trên GitHub Pages</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>3. Xuất bản tĩnh (Static Showcase)</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 text-xs text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Đã cấu hình sẵn sàng cho GitHub Pages:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Tệp <code>vite.config.ts</code> đã cấu hình <code>base: './'</code> để tải tài nguyên chính xác trên bất kỳ thư mục con nào.</li>
                  <li>Tệp GitHub Actions <code>.github/workflows/deploy.yml</code> đã được tạo sẵn trong dự án để tự động build và deploy mỗi khi bạn push code lên GitHub.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Bước 1: Tạo Repository mới trên GitHub
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Truy cập <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">github.com/new</a> và tạo kho lưu trữ mới (Public).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Bước 2: Chạy lệnh Git để đưa mã nguồn lên
                  </h4>
                  <button
                    onClick={() => copyToClipboard(gitCommands, 'git')}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {copiedText === 'git' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Đã sao chép!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Sao chép lệnh
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto border border-zinc-800">
                  {gitCommands}
                </pre>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  Bước 3: Bật GitHub Pages trong mục Settings
                </h4>
                <ol className="list-decimal pl-4 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li>Vào <strong>Settings</strong> của repository trên GitHub.</li>
                  <li>Chọn menu <strong>Pages</strong> ở cột bên trái.</li>
                  <li>Tại mục <strong>Build and deployment &gt; Source</strong>, chọn <strong>GitHub Actions</strong>.</li>
                  <li>Website sẽ được tự động triển khai tại địa chỉ <code>https://&lt;tai-khoan&gt;.github.io/&lt;ten-repo&gt;/</code> !</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'oauth' && (
            <div className="space-y-4 text-xs">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-amber-800 dark:text-amber-200">
                <p className="font-semibold mb-1">
                  Quan trọng: Cho phép tên miền GitHub Pages kết nối Google Drive
                </p>
                <p>
                  Để tính năng đăng nhập Google Drive hoạt động trơn tru trên tên miền GitHub Pages của bạn (ví dụ: <code>https://username.github.io</code>), bạn chỉ cần thêm tên miền này vào Google Cloud Console:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                    1. Mở Google Cloud Console
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Truy cập trang <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">APIs & Services &gt; Credentials</a>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                    2. Chỉnh sửa OAuth 2.0 Client ID
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Nhấp vào Client ID web của dự án của bạn (đã được tạo sẵn trong cấu hình Firebase).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                  <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                    3. Thêm Authorized JavaScript Origins
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-2">
                    Thêm URL GitHub Pages của bạn vào danh sách nguồn gốc được ủy quyền:
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 text-zinc-200 font-mono">
                    <span>https://&lt;username&gt;.github.io</span>
                    <button
                      onClick={() => copyToClipboard('https://<username>.github.io', 'origin')}
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {copiedText === 'origin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4 text-xs">
              <p className="text-zinc-600 dark:text-zinc-400">
                Nếu bạn muốn đưa lên GitHub Pages như một trang <strong>Portfolio Ảnh Tĩnh</strong> (để bất kỳ ai vào trang web của bạn đều xem được ảnh ngay lập tức mà không cần họ phải đăng nhập Google Drive cá nhân của bạn), bạn có thể xuất danh sách ảnh hiện tại thành file JSON:
              </p>

              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    Xuất danh sách ({currentPhotos.length} ảnh)
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    Bao gồm đường dẫn ảnh phân giải cao, tên, ngày chụp và thông số EXIF.
                  </p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file JSON</span>
                </button>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                💡 <strong>Mẹo hay:</strong> Bạn có thể lưu file JSON này vào thư mục <code>src/data/samplePhotos.ts</code> để thư viện ảnh luôn hiển thị các bức ảnh tuyệt đẹp của bạn làm mặc định cho khách tham quan!
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-medium bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            Đã hiểu, đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
