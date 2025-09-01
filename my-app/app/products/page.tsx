import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import prisma from '@/app/lib/db';
import ProductsClient from './components/ProductsClient';

export const metadata: Metadata = {
  title: 'Products | TwelveAM',
  description: 'Browse our collection of products at TwelveAM.',
};

interface SearchParams {
  page?: string;
  category?: string;
  collection?: string;
  sort?: string;
}

const ITEMS_PER_PAGE = 24;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  if (currentPage < 1) redirect('/products');

  // Parse query parameters
  const categoryId = params.category;
  const collectionId = params.collection;
  const sort = params.sort || 'newest';

  // Build the where clause for filtering
  const where = {
    isArchived: false,
    ...(categoryId && { categoryId }),
    ...(collectionId && { collectionId }),
  };

  // Build the orderBy clause for sorting
  const orderBy = (() => {
    switch (sort) {
      case 'price-asc':
        return { price: 'asc' as const };
      case 'price-desc':
        return { price: 'desc' as const };
      case 'name-asc':
        return { name: 'asc' as const };
      case 'name-desc':
        return { name: 'desc' as const };
      case 'newest':
      default:
        return { createdAt: 'desc' as const };
    }
  })();

  // Fetch products with pagination
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: {
          take: 1,
          orderBy: {
            order: 'asc',
          },
          select: {
            url: true,
          },
        },
        sizes: {
          select: {
            price: true,
          },
        },
        inStock: true,
        discount: {
          select: {
            percentage: true,
            enabled: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Format products for client
  const formattedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: parseFloat(product.price.toString()),
    image: product.images[0]?.url || null,
    inStock: product.inStock,
    minPrice: product.sizes.length > 0
      ? Math.min(...product.sizes.map(s => parseFloat(s.price.toString())))
      : parseFloat(product.price.toString()),
    maxPrice: product.sizes.length > 0
      ? Math.max(...product.sizes.map(s => parseFloat(s.price.toString())))
      : parseFloat(product.price.toString()),
    discount: product.discount ? {
      percentage: parseFloat(product.discount.percentage.toString()),
      enabled: product.discount.enabled,
    } : null,
  }));

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // If current page is greater than total pages and we have pages, redirect to last page
  if (currentPage > totalPages && totalPages > 0) {
    redirect(`/products?page=${totalPages}`);
  }

  // Fetch categories and collections for filters
  const [categories, collections] = await Promise.all([
    prisma.category.findMany({
      where: { 
        products: { some: { isArchived: false } } 
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { 
            products: { 
              where: { isArchived: false } 
            } 
          },
        },
      },
    }),
    prisma.collection.findMany({
      where: { 
        available: true,
        products: { some: { isArchived: false } } 
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { 
            products: { 
              where: { isArchived: false } 
            } 
          },
        },
      },
    }),
  ]);

  return (
    <main className="mt-24">
      <ProductsClient
        initialProducts={formattedProducts}
        categories={categories}
        collections={collections}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </main>
  );
}