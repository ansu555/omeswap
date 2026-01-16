"use client";

import { useMemo } from "react";

interface RadarChartProps {
    financial: number;
    fundamental: number;
    social: number;
    security: number;
    size?: number;
}

export const RadarChart = ({
    financial,
    fundamental,
    social,
    security,
    size = 200,
}: RadarChartProps) => {
    const center = size / 2;
    const radius = size * 0.4;

    // Convert percentages to coordinates (0-100% to 0-radius)
    const points = useMemo(() => {
        const normalize = (value: number) => (value / 100) * radius;

        return {
            financial: { x: center, y: center - normalize(financial) }, // Top
            social: { x: center + normalize(social), y: center }, // Right
            fundamental: { x: center, y: center + normalize(fundamental) }, // Bottom
            security: { x: center - normalize(security), y: center }, // Left
        };
    }, [financial, fundamental, social, security, center, radius]);

    const pathData = `M ${points.financial.x} ${points.financial.y} 
                     L ${points.social.x} ${points.social.y} 
                     L ${points.fundamental.x} ${points.fundamental.y} 
                     L ${points.security.x} ${points.security.y} Z`;

    return (
        <div className="flex items-center justify-center p-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                {/* Grid lines */}
                <g opacity={0.2}>
                    {[0.25, 0.5, 0.75, 1].map((scale) => (
                        <polygon
                            key={scale}
                            points={`${center},${center - radius * scale} ${center + radius * scale},${center} ${center},${center + radius * scale} ${center - radius * scale},${center}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                        />
                    ))}
                </g>

                {/* Axis lines */}
                <g opacity={0.3}>
                    <line
                        x1={center}
                        y1={center - radius}
                        x2={center}
                        y2={center + radius}
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                    <line
                        x1={center - radius}
                        y1={center}
                        x2={center + radius}
                        y2={center}
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </g>

                {/* Filled area */}
                <path
                    d={pathData}
                    fill="rgba(59, 130, 246, 0.3)"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    className="transition-all duration-500"
                />

                {/* Labels */}
                <text
                    x={center}
                    y={center - radius - 10}
                    textAnchor="middle"
                    className="text-xs fill-foreground font-medium"
                >
                    Financial
                </text>
                <text
                    x={center + radius + 10}
                    y={center + 4}
                    textAnchor="start"
                    className="text-xs fill-foreground font-medium"
                >
                    Social
                </text>
                <text
                    x={center}
                    y={center + radius + 20}
                    textAnchor="middle"
                    className="text-xs fill-foreground font-medium"
                >
                    Fundamental
                </text>
                <text
                    x={center - radius - 10}
                    y={center + 4}
                    textAnchor="end"
                    className="text-xs fill-foreground font-medium"
                >
                    Security
                </text>
            </svg>
        </div>
    );
};

