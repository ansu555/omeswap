"use client";

import React, { useEffect, useRef } from 'react';
import { Suspense, lazy } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { NavBar } from '@/components/ui/nav-bar';
import { Compass, ArrowLeftRight, Wallet, Coins, Receipt } from 'lucide-react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

const Spline = lazy(() => import('@splinetool/react-spline'));

const navItems = [
  { name: "Explore", url: "/explore", icon: Compass },
  { name: "Trade", url: "/trade", icon: ArrowLeftRight },
  { name: "Portfolio", url: "/portfolio", icon: Wallet },
  { name: "Tokens", url: "/cryptocurrencies", icon: Coins },
  { name: "Txns", url: "/transactions", icon: Receipt },
];

function HeroSplineBackground() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      pointerEvents: 'auto',
      overflow: 'hidden',
    }}>
      <Suspense fallback={
        <div className="w-full h-screen bg-gradient-to-br from-black via-[#1a0d2e] to-black" />
      }>
        <Spline
          style={{
            width: '100%',
            height: '100vh',
            pointerEvents: 'auto',
          }}
          scene="https://prod.spline.design/us3ALejTXl6usHZ7/scene.splinecode"
        />
      </Suspense>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: `
            linear-gradient(to right, rgba(0, 0, 0, 0.8), transparent 30%, transparent 70%, rgba(0, 0, 0, 0.8)),
            linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.9))
          `,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function ScreenshotSection({ screenshotRef }: { screenshotRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section className="relative z-10 container mx-auto px-4 md:px-6 lg:px-8 mt-11 md:mt-12">
      <div ref={screenshotRef} className="bg-black rounded-xl overflow-hidden shadow-2xl border border-purple-500/20 w-full md:w-[80%] lg:w-[70%] mx-auto">
        <Image
          src="/swap-preview.png"
          alt="Omeswap Interface Preview"
          width={3420}
          height={2224}
          className="w-full h-auto"
          priority
        />
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <div className="text-left text-white pt-16 sm:pt-24 md:pt-32 px-4 max-w-3xl">
      <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 leading-tight tracking-wide">
        Trade smarter <br className="sm:hidden" />on Mantle<br className="sm:hidden" /> with Omeswap.
      </h1>
      <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-80 max-w-xl">
        The next-generation decentralized exchange on Mantle Network. Swap tokens instantly with minimal fees, deep liquidity, and a seamless trading experience.
      </p>
      <div className="flex pointer-events-auto flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
        <Link
          href="/trade"
          className="bg-purple-600/20 hover:bg-purple-600/30 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 w-full sm:w-auto border border-purple-500/30 text-center"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          Launch App
        </Link>
        <Link
          href="/explore"
          className="pointer-events-auto bg-black/50 border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-full transition duration-300 flex items-center justify-center w-full sm:w-auto"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Explore Tokens
        </Link>
      </div>
    </div>
  );
}

function LandingHeader() {
  const logoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
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

          {/* Center Navigation - Lamp NavBar */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <NavBar items={navItems} />
          </div>

          {/* Right Section - Launch App Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/trade"
              className="flex items-center gap-2.5 rounded-full bg-primary/10 border border-primary/30 backdrop-blur-lg shadow-lg px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              Launch App
            </Link>
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
}

const stats = [
  { label: "All time volume", value: "$4.0T", highlight: false },
  { label: "Total value locked", value: "$3.5B", highlight: false },
  { label: "All time swappers", value: "119.0M", highlight: false },
  { label: "24H swap volume", value: "$2.5B", highlight: true },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function ProtocolStatsSection() {
  return (
    <section className="pt-0 pb-24 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white leading-tight mb-32">
              DeFi&apos;s leading protocol.<br />
              Powering trillions.
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-4 max-w-lg">
              Omeswap delivers every piece of the onchain economy in one platform.
            </p>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg">
              Get no fees trading, proven security, and deep liquidity, all backed by crypto&apos;s most trusted DEX.
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-[#1a1a24] hover:bg-[#252532] text-white font-medium py-3 px-6 rounded-full transition-all duration-300 border border-gray-700/50 hover:border-gray-600 group"
            >
              Trade without fees
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>

          {/* Right Stats Grid */}
          <div className="w-full max-w-xl">
            {/* Header with dotted pattern */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4 }}
              className="relative bg-[#1c1c24] rounded-2xl px-6 py-5 mb-4 overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, #5a5a62 1.5px, transparent 1.5px)',
                  backgroundSize: '16px 16px',
                }}
              />
              <div className="relative flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-gray-200 text-base font-medium">Omeswap Protocol stats</span>
              </div>
            </motion.div>

            {/* 2x2 Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className="relative bg-[#1c1c24] rounded-3xl px-7 pt-6 pb-8 md:px-8 md:pt-7 md:pb-10 h-full flex flex-col justify-between min-h-[180px] md:min-h-[200px]">
                    <p className={`text-base md:text-lg ${stat.highlight ? 'text-green-500' : 'text-gray-400'}`}>
                      {stat.label}
                    </p>
                    <p className={`text-4xl md:text-5xl font-semibold tracking-tight ${stat.highlight ? 'text-green-500' : 'text-white'}`}>
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSection() {
  const screenshotRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (screenshotRef.current && heroContentRef.current) {
        requestAnimationFrame(() => {
          const scrollPosition = window.pageYOffset;
          if (screenshotRef.current) {
            screenshotRef.current.style.transform = `translateY(-${scrollPosition * 0.5}px)`;
          }

          const maxScroll = 400;
          const opacity = 1 - Math.min(scrollPosition / maxScroll, 1);
          if (heroContentRef.current) {
            heroContentRef.current.style.opacity = opacity.toString();
          }
        });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-transparent font-basel">
      <LandingHeader />

      <div className="relative min-h-screen">
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <HeroSplineBackground />
        </div>

        <div ref={heroContentRef} style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh',
          display: 'flex', justifyContent: 'flex-start', alignItems: 'center', zIndex: 10, pointerEvents: 'none'
        }}>
          <div className="container mx-auto">
            <HeroContent />
          </div>
        </div>
      </div>

      <div className="bg-transparent relative z-10" style={{ marginTop: '-10vh' }}>
        <ScreenshotSection screenshotRef={screenshotRef} />
        <ProtocolStatsSection />
      </div>
    </div>
  );
}
