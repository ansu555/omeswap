'use client';

import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-background/5 border border-border backdrop-blur-lg shadow-lg px-4 py-2">
      <Image
        src="/logo.png"
        alt="Logo"
        width={32}
        height={32}
        className="flex-shrink-0"
      />
      <span className="text-lg font-semibold text-foreground">
        Omeswap
      </span>
    </div>
  );
}
