'use client';

import { useState } from 'react';
import { useCart } from '@/app/store/useCart';

interface Size {
  id: string;
  size: string;
  price: number;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  inStock: boolean;
  images: ProductImage[];
  sizes: Size[];
  discount?: {
    percentage: number;
    enabled: boolean;
  } | null;
}

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
}

export default function AddToCartButton({ product, disabled = false }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | null>(
    product.sizes.length > 0 && product.sizes[0].stock > 0 ? product.sizes[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // Calculate the price to use
  const getPrice = () => {
    const basePrice = selectedSize ? parseFloat(selectedSize.price.toString()) : parseFloat(product.price.toString());
    
    if (product.discount && product.discount.enabled) {
      const discountPercent = parseFloat(product.discount.percentage.toString());
      return basePrice * (1 - discountPercent / 100);
    }
    
    return basePrice;
  };
  
  // Get max available quantity
  const getMaxQuantity = () => {
    if (!product.inStock) return 0;
    if (selectedSize) return selectedSize.stock;
    return 10; // Default max if no sizes
  };
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(parseInt(e.target.value));
  };
  
  // Handle size change
  const handleSizeChange = (size: Size) => {
    if (size.stock > 0) {
      setSelectedSize(size);
      // Reset quantity if it's more than available stock
      if (quantity > size.stock) {
        setQuantity(1);
      }
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (disabled || !product.inStock || (selectedSize && selectedSize.stock < 1)) {
      return;
    }
    
    setIsAdding(true);
    
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: getPrice(),
        image: product.images.length > 0 ? product.images[0].url : '',
        quantity,
        variant: selectedSize ? {
          size: selectedSize.size,
        } : undefined,
      });
      
      // Show success message or animation
      setTimeout(() => {
        setIsAdding(false);
      }, 500);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setIsAdding(false);
    }
  };
  
  const isOutOfStock = !product.inStock || (selectedSize ? selectedSize.stock < 1 : false);
  
  return (
    <div>
      {/* Size Selection */}
      {product.sizes.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => handleSizeChange(size)}
                disabled={size.stock < 1}
                className={`
                  px-4 py-2 text-sm rounded-md
                  ${size.stock < 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 
                    selectedSize?.id === size.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                `}
              >
                {size.size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Quantity Selection */}
      <div className="mb-4">
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
          Quantity
        </label>
        <select
          id="quantity"
          value={quantity}
          onChange={handleQuantityChange}
          disabled={isOutOfStock}
          className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-gray-400 focus:border-gray-400 sm:text-sm"
        >
          {[...Array(Math.min(getMaxQuantity(), 10))].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={disabled || isOutOfStock || isAdding}
        className={`
          w-full flex items-center justify-center px-6 py-3 rounded-md text-base font-medium text-white
          ${isOutOfStock || disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : isAdding
            ? 'bg-gray-800'
            : 'bg-gray-900 hover:bg-black'}
          transition-colors duration-200
        `}
      >
        {isAdding ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </span>
        ) : isOutOfStock ? (
          'Out of Stock'
        ) : (
          'Add to Cart'
        )}
      </button>
    </div>
  );
}
