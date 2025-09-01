import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/app/lib/db';
import AddToCartButton from './components/AddToCartButton';
import ProductUpdateNotification from '@/app/components/ProductUpdateNotification';
import ImageMagnifier from './components/ImageMagnifier';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Fetch product data
  const product = await prisma.product.findUnique({
    where: {
      slug,
      isArchived: false,
    },
    select: {
      name: true,
      description: true,
      images: {
        orderBy: {
          order: 'asc',
        },
        take: 1,
      },
    },
  });
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found',
    };
  }
  
  return {
    title: `${product.name} - TwelveAM Store`,
    description: product.description?.slice(0, 160) || '',
    openGraph: {
      images: product.images.length > 0 ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  
  // Fetch product data
  const product = await prisma.product.findUnique({
    where: {
      slug,
      isArchived: false,
    },
    include: {
      category: true,
      collection: true,
      images: {
        orderBy: {
          order: 'asc',
        },
      },
      sizes: {
        orderBy: {
          price: 'asc',
        },
      },
      discount: true,
    },
  });
  
  if (!product) {
    notFound();
  }
  
  // Format price display
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };
  
  // Calculate discounted price
  const getDiscountedPrice = (price: number) => {
    if (product.discount && product.discount.enabled) {
      return price * (1 - parseFloat(product.discount.percentage.toString()) / 100);
    }
    return price;
  };
  
  // Check if product is in stock
  const isInStock = product.inStock && 
    (product.sizes.length === 0 || product.sizes.some(size => size.stock > 0));
  
  return (
    <div className="container mx-auto px-4 py-8 mt-24">
      {/* Product-specific update notification */}
      <ProductUpdateNotification productSlug={product.slug} />
      
      <div className="mb-4">
        <nav className="text-sm text-gray-500">
          <Link href="/products" className="hover:text-rose-600">
            Products
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.categoryId}`} className="hover:text-rose-600">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          {product.images.length > 0 ? (
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <ImageMagnifier
                  src={product.images[0].url}
                  alt={product.name}
                  width={600}
                  height={600}
                  magnifierHeight={200}
                  magnifierWidth={200}
                  zoomLevel={2.5}
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <div key={image.id} className="aspect-square relative overflow-hidden rounded-md group">
                      <Image
                        src={image.url}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-staatliches text-gray-900 mb-2">{product.name}</h1>
          
          {/* Price */}
          <div className="mb-4">
            {product.discount && product.discount.enabled ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold text-rose-600">
                  {formatPrice(getDiscountedPrice(parseFloat(product.price.toString())))}
                </span>
                <span className="ml-2 text-gray-500 line-through">
                  {formatPrice(parseFloat(product.price.toString()))}
                </span>
                <span className="ml-2 bg-rose-100 text-rose-800 text-xs font-medium px-2 py-1 rounded">
                  {product.discount.percentage.toString()}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(parseFloat(product.price.toString()))}
              </span>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="mb-6">
            {isInStock ? (
              <span className="text-green-600 font-medium">In Stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>
          
          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Available Sizes</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map(size => (
                  <div 
                    key={size.id}
                    className={`border rounded-md p-3 text-center ${
                      size.stock > 0 
                        ? 'hover:border-rose-600 cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">{size.size}</div>
                    <div className="text-sm text-gray-500">
                      {product.discount && product.discount.enabled 
                        ? formatPrice(getDiscountedPrice(parseFloat(size.price.toString())))
                        : formatPrice(parseFloat(size.price.toString()))}
                    </div>
                    {size.stock === 0 && (
                      <div className="text-xs text-red-600 mt-1">Out of stock</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add to Cart */}
          <div className="mb-8">
            <AddToCartButton 
              product={{
                ...product,
                price: parseFloat(product.price.toString()),
                sizes: product.sizes.map(size => ({
                  ...size,
                  price: parseFloat(size.price.toString())
                })),
                discount: product.discount ? {
                  ...product.discount,
                  percentage: parseFloat(product.discount.percentage.toString())
                } : null
              }}
              disabled={!isInStock}
            />
          </div>
          
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <div className="prose prose-rose">
              <p>{product.description}</p>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link href={`/products?category=${product.categoryId}`} className="hover:text-rose-600">
                    {product.category.name}
                  </Link>
                </dd>
              </div>
              
              {product.collection && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Collection</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Link href={`/products?collection=${product.collectionId}`} className="hover:text-rose-600">
                      {product.collection.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}