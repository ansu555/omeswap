"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Zap, Check, Sparkles, BarChart3, Code2 } from 'lucide-react';

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

function BentoCard({ children, className = "", href = "#" }: BentoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        fontFamily: "'Basel', sans-serif",
      }}
      className={`relative overflow-hidden rounded-[2rem] transition-shadow duration-300 ${
        isHovered ? "shadow-xl shadow-purple-500/10" : ""
      } ${className}`}
    >
      <Link href={href} className="block h-full">
        {children}
      </Link>
    </motion.div>
  );
}

function UniswapXCard() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * -15, y: y * -15 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <BentoCard
      className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border border-purple-500/10 h-full"
      href="/trade"
    >
      <div
        ref={contentRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full p-6 md:p-8 lg:p-10 flex flex-col overflow-hidden"
      >
        {/* Background smoke effect */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          animate={{
            x: mousePosition.x * 0.5,
            y: mousePosition.y * 0.5,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          <Image
            src="/bento/UniswapX-bg.svg"
            alt=""
            fill
            className="object-contain opacity-50"
            style={{ filter: 'hue-rotate(-20deg) saturate(1.5)', transform: 'scale(0.7)', transformOrigin: 'center right' }}
          />
        </motion.div>

        {/* Header badge */}
        <div className="relative z-10 flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-purple-500" fill="currentColor" />
          <span className="text-purple-500 text-base font-medium">OmeX</span>
        </div>

        {/* Content */}
        <h3 className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-medium text-purple-500 mb-4">
          Smarter swaps. Aggregated<br />liquidity.
        </h3>
        <p className="relative z-10 text-gray-400 text-base md:text-lg mb-6 max-w-md leading-relaxed">
          Enjoy fast swaps, smart protection,<br />and deep liquidity.
        </p>

        {/* CTA */}
        <div className="relative z-10 mt-auto">
          <span className="inline-flex items-center gap-2 bg-[#1a1a24] hover:bg-[#252532] text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 group cursor-pointer" style={{ color: '#a855f7' }}>
            Try OmeX
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>

        {/* Feature badges - bottom right */}
        <motion.div
          className="absolute bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-8 lg:right-8 z-10 flex flex-col items-end gap-2"
          animate={{
            x: mousePosition.x * -0.8,
            y: mousePosition.y * -0.8,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          {/* MEV protection */}
          <span className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-purple-500/40 backdrop-blur-sm text-sm text-white font-medium">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
            </svg>
            MEV protection
          </span>
          
          {/* Bottom row */}
          <div className="flex gap-2">
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/80 backdrop-blur-sm text-sm text-white font-medium">
              <Check className="w-4 h-4 text-white" />
              Best swap
            </span>
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-400/60 backdrop-blur-sm text-sm text-white font-medium">
              <Image src="/bento/UniswapX.svg" alt="" width={16} height={16} className="w-4 h-4" />
              Free
            </span>
          </div>
        </motion.div>
      </div>
    </BentoCard>
  );
}

function LiquidityProvisionCard() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * -20, y: y * -20 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <BentoCard
      className="bg-gradient-to-br from-[#0d1a1a] to-[#0a1515] border border-emerald-500/10 h-full"
      href="/pools"
    >
      <div
        ref={contentRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full p-6 md:p-8 flex flex-col"
      >
        {/* Floating tokens */}
        <motion.div
          className="absolute -top-4 -right-12 w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80"
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          <Image
            src="/bento/LiquidityProvisions.svg"
            alt=""
            width={384}
            height={384}
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Header badge */}
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 text-base font-medium">Liquidity Provision</span>
        </div>

        {/* Content */}
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-emerald-400 mb-4">
          Provide liquidity,<br />earn fees.
        </h3>
        <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md leading-relaxed">
          Earn by powering onchain markets<br />with Liquidity Pools.
        </p>

        {/* CTA */}
        <div className="mt-auto">
          <span className="inline-flex items-center gap-2 bg-[#1a1a24] hover:bg-[#252532] text-emerald-400 text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-300 group cursor-pointer">
            Explore pools
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </BentoCard>
  );
}

function TradingAPICard() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * -15, y: y * -15 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <BentoCard
      className="bg-gradient-to-br from-[#2a1a0a] to-[#1a1008] border border-orange-500/10 h-full"
      href="/developers"
    >
      <div
        ref={contentRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full p-6 md:p-8 flex flex-col overflow-hidden"
      >
        {/* Background API illustration */}
        <motion.div
          className="absolute -bottom-8 -right-8 w-48 h-48 md:w-64 md:h-64 opacity-80"
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          <Image
            src="/bento/TradingAPI.svg"
            alt=""
            width={256}
            height={256}
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Header badge */}
        <div className="flex items-center gap-2 mb-6">
          <Code2 className="w-5 h-5 text-orange-400" />
          <span className="text-orange-400 text-base font-medium">Trading API</span>
        </div>

        {/* Content */}
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-orange-400 mb-4">
          DeFi for your users,<br />at no cost.
        </h3>
        <p className="text-gray-400 text-base md:text-lg mb-6 max-w-md leading-relaxed">
          Use the same API that powers Omeswap Apps. Join leading teams who trust the API to access deep crypto liquidity.
        </p>

        {/* Code snippet decoration */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/20 w-fit">
          <code className="text-xs text-orange-300 font-mono">omeswap-v4-sdk</code>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mt-auto group">
          <span>Integrate the Omeswap API</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </BentoCard>
  );
}

function UnichainCard() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current) return;
    const rect = contentRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * -25, y: y * -25 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <BentoCard
      className="bg-gradient-to-br from-[#2a0a2a] to-[#1a081a] border border-pink-500/10 h-full"
      href="/mantle"
    >
      <div
        ref={contentRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full p-6 md:p-8 flex flex-col overflow-hidden"
      >
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(219, 39, 119, 0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(219, 39, 119, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Floating geometric shape */}
        <motion.div
          className="absolute -bottom-4 -right-4 w-40 h-40 md:w-56 md:h-56"
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
            rotate: mousePosition.x * 0.5,
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
          <Image
            src="/bento/Unichain.svg"
            alt=""
            width={224}
            height={224}
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Header badge */}
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span className="text-pink-400 text-base font-medium">Mantle</span>
        </div>

        {/* Content */}
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-pink-400 mb-4 relative z-10">
          The DeFi chain.
        </h3>
        <p className="text-gray-400 text-base md:text-lg mb-6 max-w-md leading-relaxed relative z-10">
          Join the community building on the fast, decentralized Ethereum L2 built to be the home for DeFi.
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-pink-400 text-sm font-medium mt-auto group relative z-10">
          <span>Start building</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </BentoCard>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export function BentoGrid() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-black font-basel">
      <div className="container mx-auto max-w-[90rem]">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-left mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white">
            Built for all the ways you swap
          </h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8"
        >
          {/* First row */}
          <motion.div variants={itemVariants} className="min-h-[320px] md:min-h-[380px]">
            <UniswapXCard />
          </motion.div>
          <motion.div variants={itemVariants} className="min-h-[320px] md:min-h-[380px]">
            <LiquidityProvisionCard />
          </motion.div>

          {/* Second row */}
          <motion.div variants={itemVariants} className="min-h-[320px] md:min-h-[380px]">
            <TradingAPICard />
          </motion.div>
          <motion.div variants={itemVariants} className="min-h-[320px] md:min-h-[380px]">
            <UnichainCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
