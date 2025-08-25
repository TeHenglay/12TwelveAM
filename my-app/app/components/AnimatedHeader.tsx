'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CardNav from './CardNav';
import { useCart } from '../store/useCart';

const AnimatedHeader: React.FC = () => {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const cartItemCount = getTotalItems();

  const navItems = [
    {
      label: "Shop",
      bgColor: "#1a1a1a",
      textColor: "#fff",
      links: [
        { label: "All Products", href: "/products", ariaLabel: "View all products" },
        { label: "New Arrivals", href: "/products?new=true", ariaLabel: "Browse new arrivals" },
        { label: "Categories", href: "/products", ariaLabel: "Browse by category" }
      ]
    },
    {
      label: "Cart", 
      bgColor: "#2a2a2a",
      textColor: "#fff",
      links: [
        { label: `Items (${cartItemCount})`, href: "/cart", ariaLabel: "View shopping cart" },
        { label: "Checkout", href: "/checkout", ariaLabel: "Proceed to checkout" },
        { label: "Wishlist", href: "/products", ariaLabel: "View wishlist" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#3a3a3a", 
      textColor: "#fff",
      links: [
        { label: "Facebook", href: "https://facebook.com", ariaLabel: "Visit our Facebook page" },
        { label: "Instagram", href: "https://instagram.com", ariaLabel: "Follow us on Instagram" },
        { label: "Telegram", href: "https://t.me", ariaLabel: "Contact us on Telegram" }
      ]
    }
  ];

  const handleGetStartedClick = () => {
    router.push('/products');
  };

  return (
    <div className="relative">
      <CardNav
        logo="/images/logo_black.png"
        logoAlt="E-Shop Logo"
        logoSize="w-40"
        items={navItems}
        baseColor="#ffffff"
        menuColor="#000000"
        buttonBgColor="#111111"
        buttonTextColor="#ffffff"
        ease="power3.out"
        onGetStartedClick={handleGetStartedClick}
      />
    </div>
  );
};

export default AnimatedHeader;
