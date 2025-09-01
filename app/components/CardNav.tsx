'use client';

import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";
import { HiShoppingCart, HiShoppingBag } from "react-icons/hi";
import { useCart } from "@/app/store/useCart";

// Utility function to adjust color brightness
const adjustColor = (color: string, amount: number) => {
  const cleanHex = color.replace('#', '');
  const num = parseInt(cleanHex, 16);

  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;

  r = Math.min(Math.max(0, r), 255);
  g = Math.min(Math.max(0, g), 255);
  b = Math.min(Math.max(0, b), 255);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: string;
  logoAlt?: string;
  logoSize?: string;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  onGetStartedClick?: () => void;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = "Logo",
  items,
  className = "",
  ease = "power3.out",
  baseColor = "#fff",
  menuColor,
  buttonBgColor,
  buttonTextColor,
  onGetStartedClick,
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const cartItemCount = useCart((state) => state.getTotalItems());
  const cartBadgeRef = useRef<HTMLSpanElement | null>(null);
  const prevCountRef = useRef<number>(0);

  // Animate the red cart badge when count changes
  useLayoutEffect(() => {
    const badge = cartBadgeRef.current;
    if (!badge) return;

    const prev = prevCountRef.current;
    const curr = cartItemCount;

    if (curr > 0 && curr !== prev) {
      gsap.fromTo(
        badge,
        { scale: 0.2, y: -6, opacity: 0 },
        { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: "back.out(1.8)" }
      );
      gsap.to(badge, {
        keyframes: [{ rotate: 8 }, { rotate: -8 }, { rotate: 0 }],
        duration: 0.25,
        delay: 0.1,
        ease: "power2.out",
      });
    }

    prevCountRef.current = curr;
  }, [cartItemCount]);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content") as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = "visible";
        contentEl.style.pointerEvents = "auto";
        contentEl.style.position = "static";
        contentEl.style.height = "auto";

        // force reflow
        contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      "-=0.1"
    );

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div
      // changed to fixed so it stays sticky on top
      className={`card-nav-container fixed left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[0.8rem] md:top-[1.2rem] ${className}`}
    >
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? "open" : ""} block h-[60px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height]`}
        style={{ backgroundColor: baseColor }}
      >
        {/* Top bar */}
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          {/* Hamburger */}
          <div
            className={`hamburger-menu ${isHamburgerOpen ? "open" : ""} group white h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? "Close menu" : "Open menu"}
            tabIndex={0}
            style={{ color: menuColor || "#000" }}
          >
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""
              } group-hover:opacity-75`}
            />
            <div
              className={`hamburger-line w-[30px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${
                isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""
              } group-hover:opacity-75`}
            />
          </div>

          {/* Logo */}
          <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
            <a href="/" className="transition-opacity hover:opacity-90">
              <img src={logo} alt={logoAlt} className="logo h-[36px]" />
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mr-4">
            <button
              type="button"
              onClick={onGetStartedClick}
              className="hidden md:flex items-center justify-center hover:opacity-75 transition-opacity"
              style={{ color: menuColor || "#000" }}
              aria-label="Products"
            >
              <HiShoppingBag size={30} />
            </button>

            <a
              href="/cart"
              className="hidden md:flex items-center justify-center hover:opacity-75 transition-opacity relative"
              style={{ color: menuColor || "#000" }}
              aria-label={`Shopping Cart${cartItemCount > 0 ? ` (${cartItemCount} items)` : ''}`}
            >
              <HiShoppingCart size={30} />
              {cartItemCount > 0 && (
                <span
                  ref={cartBadgeRef}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center leading-none shadow-md"
                >
                  {cartItemCount}
                </span>
              )}
            </a>
          </div>
        </div>

        {/* Expandable content */}
        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] ${
            isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"
          } md:flex-row md:items-end md:gap-[12px]`}
          aria-hidden={!isExpanded}
        >
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h=[60px] md:h-full md:min-h-0 md:flex-[1_1_0%] shadow-lg backdrop-blur-sm border border-white/10 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:border-white/20"
              ref={setCardRef(idx)}
              style={{
                background: `linear-gradient(145deg, ${item.bgColor}, ${adjustColor(item.bgColor, -15)})`,
                color: item.textColor,
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              }}
            >
              <div className="nav-card-label font-sans font-medium tracking-[-0.5px] text-[18px] md:text-[22px]">
                {item.label}
              </div>
              <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                {item.links?.map((lnk, i) => (
                  <a
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px] font-sans"
                    href={lnk.href}
                    aria-label={lnk.ariaLabel}
                  >
                    <GoArrowUpRight className="nav-card-link-icon shrink-0" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
