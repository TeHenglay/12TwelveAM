'use client';

import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface ProductHeaderProps {
  totalProducts: number;
  currentSort: string;
  onSortChange: (value: string) => void;
  onMobileFilterOpen: () => void;
}

export default function ProductHeader({
  totalProducts,
  currentSort,
  onSortChange,
  onMobileFilterOpen,
}: ProductHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalProducts} {totalProducts === 1 ? 'product' : 'products'} available
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-none">
              <Select value={currentSort} onValueChange={onSortChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
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

            <button
              onClick={onMobileFilterOpen}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open filters"
            >
              <Filter className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
