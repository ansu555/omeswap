"use client";

import React, { useState } from "react";
import AlgorandWalletConnect from "@/components/features/algorand/algorand-wallet-connect";
import { useWalletConnection } from "@/components/providers/txnlab-wallet-provider";
import { Logo } from "./logo";
import PillNav, { PillNavItem } from "./ui/pill-nav";

export const Header = () => {
  const { activeAccount } = useWalletConnection();
  
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
        rightContent={<AlgorandWalletConnect variant="compact" />}
      />
    </header>
  );
};
