import Link from 'next/link';

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2 md:hidden z-50">
      <Link href="/">Home</Link>
      <Link href="/products">Products</Link>
      <Link href="/cart">Cart</Link>
      <Link href="/orders">Orders</Link>
    </nav>
  );
}
