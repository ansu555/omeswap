"use client";

import { ReactNode } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";

export function RainbowKitWrapper({ children }: { children: ReactNode }) {
  return (
    <RainbowKitProvider theme={darkTheme()} modalSize="compact">
      {children}
    </RainbowKitProvider>
  );
}
