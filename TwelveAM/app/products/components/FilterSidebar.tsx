'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface FilterSidebarProps {
  categories: Array<{
    id: string;
    name: string;
    _count: { products: number };
  }>;
  collections: Array<{
    id: string;
    name: string;
    _count: { products: number };
  }>;
  selectedCategory?: string;
  selectedCollection?: string;
  onCategoryChange: (id: string) => void;
  onCollectionChange: (id: string) => void;
  onReset: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  currentSort: string;
  onSortChange: (value: string) => void;
}

export default function FilterSidebar({
  categories,
  collections,
  selectedCategory,
  selectedCollection,
  onCategoryChange,
  onCollectionChange,
  onReset,
  isMobileOpen,
  onMobileClose,
  currentSort,
  onSortChange
}: FilterSidebarProps) {
  const [isCategoryExpanded, setCategoryExpanded] = useState(true);
  const [isCollectionExpanded, setCollectionExpanded] = useState(true);

  const sidebarContent = (
    <div className="space-y-4">
      {/* Header - Mobile Only */}
      <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button onClick={onMobileClose} className="p-2">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Sort Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
        <Select value={currentSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Section */}
      <div>
        <button
          onClick={() => setCategoryExpanded(!isCategoryExpanded)}
          className="flex items-center justify-between w-full py-1 text-left text-sm font-medium"
        >
          <span>Categories</span>
          {isCategoryExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isCategoryExpanded && (
          <div className="mt-2 space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`block w-full px-3 py-1.5 text-left text-xs rounded transition-colors
                  ${selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100'
                  }`}
              >
                {category.name}
                <span className="ml-2 text-xs opacity-60">
                  ({category._count.products})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div>
        <button
          onClick={() => setCollectionExpanded(!isCollectionExpanded)}
          className="flex items-center justify-between w-full py-1 text-left text-sm font-medium"
        >
          <span>Collections</span>
          {isCollectionExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {isCollectionExpanded && (
          <div className="mt-2 space-y-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => onCollectionChange(collection.id)}
                className={`block w-full px-3 py-1.5 text-left text-xs rounded transition-colors
                  ${selectedCollection === collection.id
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100'
                  }`}
              >
                {collection.name}
                <span className="ml-2 text-xs opacity-60">
                  ({collection._count.products})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset Filters */}
      {(selectedCategory || selectedCollection) && (
        <button
          onClick={onReset}
          className="w-full px-4 py-2 text-sm text-gray-600 hover:text-black
                     border border-gray-300 rounded-lg hover:border-black transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-48 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isMobileOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl p-6 z-50 lg:hidden
                   transform transition-transform duration-300 ease-in-out
                   ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {sidebarContent}
      </motion.div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
        />
      )}
    </>
  );
}
