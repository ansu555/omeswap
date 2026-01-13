# Mantle Dex

A modern decentralized exchange application built on the Mantle Network.

## Project Structure

```
Mantle_Dex/
├── app/                      # Next.js App Router (pages & layouts only)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── explore/              # Explore route
│   └── portfolio/            # Portfolio route
│
├── components/               # Reusable React components
│   ├── explore/              # Explore page components
│   ├── features/             # Feature-specific components
│   │   └── mantle/           # Mantle wallet integration
│   ├── layout/               # Layout components (Header, Footer, etc.)
│   ├── portfolio/            # Portfolio page components
│   ├── providers/            # Context providers
│   ├── shared/               # Shared/common components
│   └── ui/                   # Base UI components (shadcn/ui)
│
├── constants/                # Application constants
│   └── index.ts              # Centralized constants
│
├── hooks/                    # Custom React hooks
│   ├── use-mantle-wallet.tsx # Wallet hook
│   └── use-mobile.tsx        # Mobile detection hook
│
├── lib/                      # Utility functions & configurations
│   ├── utils.ts              # Helper utilities
│   └── chains/               # Blockchain configurations
│       └── mantle.ts         # Mantle chain config
│
├── public/                   # Static assets
│
└── types/                    # TypeScript type definitions
    └── index.ts              # Global types
```

## Key Conventions

### Naming Conventions

- **Files**: Use kebab-case for files (e.g., `mantle-wallet-connect.tsx`)
- **Components**: Use PascalCase for component names
- **Routes**: Use lowercase for route folders (e.g., `/explore`, `/portfolio`)
- **Hooks**: Prefix with `use-` (e.g., `use-mobile.tsx`)

### Import Organization

```typescript
// 1. External packages
import { useState } from 'react';

// 2. Internal aliases (@/)
import { Button } from '@/components/ui/button';

// 3. Relative imports
import { Logo } from './logo';
```

### Component Structure

Each feature folder should have an `index.ts` barrel file for clean exports:

```typescript
// components/layout/index.ts
export { Header } from './header';
export { Logo } from './logo';
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion, GSAP
- **Wallet**: wagmi + viem
- **Language**: TypeScript
