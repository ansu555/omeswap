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

### Prerequisites

1. **CoinMarketCap API Key** (Required)
   - Sign up at [CoinMarketCap API](https://coinmarketcap.com/api/)
   - Get your API key from the dashboard

2. **OpenAI API Key** (Required for AI analysis)
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key from the API keys section

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # CoinMarketCap API Key (Required for live token data)
   COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here
   
   # OpenAI API Key (Required for AI-generated token analysis)
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   Replace the placeholder values with your actual API keys.

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Environment Variables

- `COINMARKETCAP_API_KEY` - Your CoinMarketCap API key (required for live token data and graphs)
- `OPENAI_API_KEY` - Your OpenAI API key (required for AI-generated fundamental and technical analysis)

### Features

- **Live Token Data**: Real-time cryptocurrency data from CoinMarketCap API
- **Token Analysis Pages**: Detailed analysis with audit scores, charts, and metrics
- **AI-Powered Analysis**: OpenAI-generated fundamental and technical analysis for each token
- **Historical Charts**: Price history visualization with multiple time ranges (24h, 7d, 1m, 3m, 1y, Max)
- **Audit Scores**: Comprehensive scoring system (Financial, Fundamental, Social, Security)
- **Similar Tokens**: Recommendations for related cryptocurrencies

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion, GSAP
- **Wallet**: wagmi + viem
- **Language**: TypeScript
