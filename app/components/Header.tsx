"use client";

import React, { useState } from "react";
import MantleWalletConnect from "@/components/features/mantle/mantle-wallet-connect";
import { Logo } from "./logo";
import PillNav, { PillNavItem } from "./ui/pill-nav";

export const Header = () => {
  
  const navItems: PillNavItem[] = [
    { label: "Home", href: "/" },
    { label: "Trade", href: "/trade" },
    { label: "Launchpad", href: "/launchpad" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Developers", href: "/developers" },
    { label: "Tokens", href: "/cryptocurrencies" },
    { label: "Pool", href: "/pool" },
    { label: "Txns", href: "/transactions" },
  ];

  return (
    <header className="z-50 relative">
      <PillNav 
        items={navItems}
        LogoComponent={<Logo />}
        initialLoadAnimation={true}
        baseColor="#111"
        pillColor="#fff"
        pillTextColor="#111"
        hoveredPillTextColor="#fff"
        rightContent={<MantleWalletConnect variant="default" />}
      />
    </header>
  );
};
