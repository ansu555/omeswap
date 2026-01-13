"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import MantleWalletConnect from "@/components/features/mantle/mantle-wallet-connect";

type NavItem = {
  label: string;
  href?: string;
  dropdown?: { label: string; href: string }[];
};

export const Header = () => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [
    { label: "Explore", href: "/Explore" },
    { label: "Trade", href: "/trade" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Tokens", href: "/cryptocurrencies" },
    { label: "Txns", href: "/transactions" },
  ];

  useEffect(() => {
    // Initial load animation
    const logo = logoRef.current;
    const nav = navRef.current;

    if (logo) {
      gsap.fromTo(logo, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" });
    }
    if (nav) {
      gsap.fromTo(nav, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power3.out" });
    }
  }, []);

  const isActive = (item: NavItem) => {
    if (item.href) return pathname === item.href;
    if (item.dropdown) return item.dropdown.some((d) => pathname === d.href);
    return false;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="relative max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            ref={logoRef}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo />
          </Link>

          {/* Center Navigation */}
          <div ref={navRef} className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                      isActive(item)
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                      isActive(item)
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`} />
                  </button>
                )}

                {/* Dropdown Menu */}
                {item.dropdown && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 py-2 min-w-[160px] bg-[#1a1a2e]/95 backdrop-blur-lg border border-purple-500/20 rounded-xl shadow-xl">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Section - Connect Wallet */}
          <div className="hidden md:flex items-center">
            <MantleWalletConnect 
              variant="outline" 
              className="rounded-full border-purple-500/60 text-purple-400 hover:bg-purple-500/10 hover:text-purple-400"
            />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden flex flex-col gap-1.5 p-2">
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
          </button>
        </nav>
      </div>
    </header>
  );
};
