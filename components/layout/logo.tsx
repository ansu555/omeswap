'use client';

import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image 
        src="/logo.png" 
        alt="Logo" 
        width={120} 
        height={40}
        className="flex-shrink-0"
      />
    </div>
  );
}
