"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { Compass, ArrowLeftRight, Wallet, Coins, Receipt, Bot } from "lucide-react";
import { gsap } from "gsap";
import { AvalancheWalletConnect } from "@/components/features/avalanche";
import { NavBar } from "@/components/ui/nav-bar";

const navItems = [
  { name: "Explore", url: "/explore", icon: Compass },
  { name: "Trade", url: "/trade", icon: ArrowLeftRight },
  { name: "Portfolio", url: "/portfolio", icon: Wallet },
  { name: "Agent", url: "/agent-builder", icon: Bot },
  { name: "Tokens", url: "/cryptocurrencies", icon: Coins },
  { name: "Txns", url: "/transactions", icon: Receipt },
];

export const Header = () => {
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // Initial load animation
    const logo = logoRef.current;

    if (logo) {
      gsap.fromTo(logo, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" });
    }
  }, []);

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

          {/* Center Navigation - New Lamp NavBar */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <NavBar items={navItems} />
          </div>

          {/* Right Section - Connect Wallet */}
          <div className="hidden md:flex items-center">
            <AvalancheWalletConnect />
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden flex flex-col gap-1.5 p-2">
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
          </button>
        </nav>
      </div>

      {/* Mobile Bottom NavBar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-6 md:hidden">
        <NavBar items={navItems} />
      </div>
    </header>
  );
};
