import React from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  Columns3,
  Calendar,
  Play,
  X,
} from 'lucide-react';
import { FilterOptions, ViewLayout } from '../types/gallery';

interface FilterBarProps {
  filter: FilterOptions;
  onFilterChange: (newFilter: Partial<FilterOptions>) => void;
  availableYears: string[];
  layout: ViewLayout;
  onLayoutChange: (layout: ViewLayout) => void;
  onStartSlideshow: () => void;
  totalFilteredPhotos: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  availableYears,
  layout,
  onLayoutChange,
  onStartSlideshow,
  totalFilteredPhotos,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3 border-b border-zinc-200 dark:border-zinc-800">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={filter.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Tìm kiếm theo tên ảnh..."
          className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden transition-all"
        />
        {filter.searchQuery && (
          <button
            onClick={() => onFilterChange({ searchQuery: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and View Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Year Filter */}
        {availableYears.length > 0 && (
          <div className="relative">
            <select
              value={filter.yearFilter}
              onChange={(e) => onFilterChange({ yearFilter: e.target.value })}
              className="appearance-none pl-7 pr-8 py-2 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer focus:outline-hidden"
            >
              <option value="all">Tất cả các năm</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Năm {yr}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          </div>
        )}

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={filter.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as FilterOptions['sortBy'],
              })
            }
            className="appearance-none pl-7 pr-8 py-2 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer focus:outline-hidden"
          >
            <option value="date-desc">Mới nhất trước</option>
            <option value="date-asc">Cũ nhất trước</option>
            <option value="name-asc">Tên (A-Z)</option>
            <option value="size-desc">Dung lượng lớn nhất</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>

        {/* Slideshow button */}
        {totalFilteredPhotos > 0 && (
          <button
            onClick={onStartSlideshow}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            title="Bắt đầu trình chiếu ảnh tự động"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-600 dark:fill-indigo-400" />
            <span className="hidden sm:inline">Trình chiếu</span>
          </button>
        )}

        {/* Layout Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <button
            onClick={() => onLayoutChange('grid')}
            title="Bố cục Lưới đều"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              layout === 'grid'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onLayoutChange('columns')}
            title="Bố cục Cột lớn"
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              layout === 'columns'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Columns3 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
