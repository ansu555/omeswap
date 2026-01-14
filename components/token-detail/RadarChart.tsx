"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface RadarChartProps {
  data: {
    financial: number;
    fundamental: number;
    social: number;
    security: number;
  };
}

// Score-based color thresholds (matching ScoreCard)
function getScoreColor(score: number): string {
  if (score >= 95) return "#22c55e"; // Forest Green
  if (score >= 85) return "#10b981"; // Emerald
  if (score >= 75) return "#84cc16"; // Lime/Chartreuse
  if (score >= 65) return "#eab308"; // Yellow
  if (score >= 50) return "#f97316"; // Orange
  return "#ef4444"; // Red
}

export function RadarChart({ data }: RadarChartProps) {
  const size = 240;
  const center = size / 2;
  const maxRadius = 90;

  const categories = [
    { key: "financial", label: "Financial", angle: -90 },
    { key: "social", label: "Social", angle: 0 },
    { key: "fundamental", label: "Fundamental", angle: 90 },
    { key: "security", label: "Security", angle: 180 },
  ] as const;

  const getPoint = (angle: number, value: number) => {
    const normalizedValue = (value / 100) * maxRadius;
    const radians = (angle * Math.PI) / 180;
    return {
      x: center + Math.cos(radians) * normalizedValue,
      y: center + Math.sin(radians) * normalizedValue,
    };
  };

  const gridLevels = [20, 40, 60, 80, 100];

  const dataPoints = useMemo(() => {
    return categories.map((cat) => ({
      ...getPoint(cat.angle, data[cat.key]),
      score: data[cat.key],
      color: getScoreColor(data[cat.key]),
    }));
  }, [data]);

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Calculate average color for gradient
  const avgScore = (data.financial + data.fundamental + data.social + data.security) / 4;
  const avgColor = getScoreColor(avgScore);

  return (
    <div className="relative">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          {/* Gradient fill for polygon */}
          <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={avgColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={avgColor} stopOpacity="0.1" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Point glow filter */}
          <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circles for depth */}
        {gridLevels.map((level, i) => {
          const radius = (level / 100) * maxRadius;
          return (
            <circle
              key={`grid-circle-${level}`}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity={0.15 + i * 0.05}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Grid polygons */}
        {gridLevels.map((level, i) => (
          <motion.polygon
            key={level}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2 + i * 0.05, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            points={categories
              .map((cat) => {
                const p = getPoint(cat.angle, level);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {categories.map((cat, i) => {
          const endPoint = getPoint(cat.angle, 100);
          return (
            <motion.line
              key={cat.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.05 }}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon with gradient fill and glow */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.3,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          points={polygonPoints}
          fill="url(#radarGradient)"
          stroke={avgColor}
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#glow)"
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points with score-based colors */}
        {dataPoints.map((point, i) => (
          <motion.g key={i}>
            {/* Outer glow ring */}
            <motion.circle
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              cx={point.x}
              cy={point.y}
              r="8"
              fill={point.color}
              filter="url(#pointGlow)"
            />
            {/* Main point */}
            <motion.circle
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.5 + i * 0.1,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={point.color}
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
          </motion.g>
        ))}
      </svg>

      {/* Labels */}
      {categories.map((cat, i) => {
        const labelPoint = getPoint(cat.angle, 125);
        const score = data[cat.key];
        const color = getScoreColor(score);

        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
            className="absolute text-sm font-medium whitespace-nowrap"
            style={{
              left: labelPoint.x,
              top: labelPoint.y,
              transform: "translate(-50%, -50%)",
              color: color,
            }}
          >
            {cat.label}
          </motion.div>
        );
      })}
    </div>
  );
}
