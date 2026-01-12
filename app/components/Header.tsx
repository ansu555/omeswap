"use client";

import React, { useState } from "react";
import MantleWalletConnect from "@/components/features/mantle/mantle-wallet-connect";
import { Logo } from "./logo";
import PillNav, { PillNavItem } from "./ui/pill-nav";

export const Header = () => {

  const navItems: PillNavItem[] = [
    { label: "Explore", href: "/Explore" },
    { label: "Trade", href: "/trade" },
    { label: "Portfolio", href: "/portfolio" },
    // { label: "Tokens", href: "/cryptocurrencies" },
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
