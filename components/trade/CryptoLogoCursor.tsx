"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import "./CryptoLogoCursor.css";

interface CryptoLogoCursorProps {
  /** Array of image URLs to display */
  images: string[];
  /** Minimum distance between spawned logos */
  spacing?: number;
  /** Whether logos should rotate towards mouse direction */
  followMouseDirection?: boolean;
  /** Whether logos should have random floating animation */
  randomFloat?: boolean;
  /** Duration of exit animation */
  exitDuration?: number;
  /** Interval in ms to remove oldest logo */
  removalInterval?: number;
  /** Maximum number of logos on screen */
  maxPoints?: number;
  /** Size of the logo in pixels */
  logoSize?: number;
}

interface TrailItem {
  id: number;
  x: number;
  y: number;
  angle: number;
  imageUrl: string;
  randomX?: number;
  randomY?: number;
  randomRotate?: number;
}

export function CryptoLogoCursor({
  images,
  spacing = 120,
  followMouseDirection = false,
  randomFloat = true,
  exitDuration = 0.5,
  removalInterval = 50,
  maxPoints = 8,
  logoSize = 32,
}: CryptoLogoCursorProps) {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMoveTimeRef = useRef(Date.now());
  const idCounter = useRef(0);

  const getRandomImage = useCallback(() => {
    if (images.length === 0) return "";
    return images[Math.floor(Math.random() * images.length)];
  }, [images]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || images.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const createRandomData = () =>
        randomFloat
          ? {
              randomX: Math.random() * 15 - 7.5,
              randomY: Math.random() * 15 - 7.5,
              randomRotate: Math.random() * 20 - 10,
            }
          : {};

      setTrail((prev) => {
        const newTrail = [...prev];

        if (newTrail.length === 0) {
          newTrail.push({
            id: idCounter.current++,
            x: mouseX,
            y: mouseY,
            angle: 0,
            imageUrl: getRandomImage(),
            ...createRandomData(),
          });
        } else {
          const last = newTrail[newTrail.length - 1];
          const dx = mouseX - last.x;
          const dy = mouseY - last.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance >= spacing) {
            const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const computedAngle = followMouseDirection ? rawAngle : 0;
            const steps = Math.floor(distance / spacing);

            for (let i = 1; i <= steps; i++) {
              const t = (spacing * i) / distance;
              const newX = last.x + dx * t;
              const newY = last.y + dy * t;

              newTrail.push({
                id: idCounter.current++,
                x: newX,
                y: newY,
                angle: computedAngle,
                imageUrl: getRandomImage(),
                ...createRandomData(),
              });
            }
          }
        }

        return newTrail.length > maxPoints
          ? newTrail.slice(newTrail.length - maxPoints)
          : newTrail;
      });

      lastMoveTimeRef.current = Date.now();
    },
    [images.length, spacing, followMouseDirection, randomFloat, maxPoints, getRandomImage]
  );

  useEffect(() => {
    // Use document-level listener so pointer-events: none on container doesn't block it
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastMoveTimeRef.current > 100) {
        setTrail((prev) => (prev.length > 0 ? prev.slice(1) : prev));
      }
    }, removalInterval);
    return () => clearInterval(interval);
  }, [removalInterval]);

  if (images.length === 0) return null;

  return (
    <div ref={containerRef} className="crypto-logo-cursor-container">
      <div className="crypto-logo-cursor-inner">
        <AnimatePresence>
          {trail.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.5, rotate: item.angle }}
              animate={{
                opacity: 0.7,
                scale: 1,
                x: randomFloat ? [0, item.randomX || 0, 0] : 0,
                y: randomFloat ? [0, item.randomY || 0, 0] : 0,
                rotate: randomFloat
                  ? [item.angle, item.angle + (item.randomRotate || 0), item.angle]
                  : item.angle,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                opacity: { duration: exitDuration, ease: "easeOut" },
                scale: { duration: 0.2, ease: "easeOut" },
                ...(randomFloat && {
                  x: {
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror" as const,
                  },
                  y: {
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror" as const,
                  },
                  rotate: {
                    duration: 3,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror" as const,
                  },
                }),
              }}
              className="crypto-logo-cursor-item"
              style={{
                left: item.x,
                top: item.y,
                width: logoSize,
                height: logoSize,
              }}
            >
              <Image
                src={item.imageUrl}
                alt="crypto"
                width={logoSize}
                height={logoSize}
                className="rounded-full"
                unoptimized
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CryptoLogoCursor;
