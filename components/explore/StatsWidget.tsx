"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// A function to generate a smooth SVG path from data points
const generateSmoothPath = (points: number[], width: number, height: number): string => {
    if (!points || points.length < 2) {
        return `M 0 ${height}`;
    }

    const xStep = width / (points.length - 1);
    const maxPoint = Math.max(...points);
    const minPoint = Math.min(...points);
    const range = maxPoint - minPoint || 1;

    const pathData = points.map((point, i) => {
        const x = i * xStep;
        // Normalize point to 0-100 range, then scale to height
        const normalized = ((point - minPoint) / range) * 100;
        const y = height - (normalized / 100) * (height * 0.8) - (height * 0.1);
        return [x, y];
    });

    let path = `M ${pathData[0][0]} ${pathData[0][1]}`;

    for (let i = 0; i < pathData.length - 1; i++) {
        const x1 = pathData[i][0];
        const y1 = pathData[i][1];
        const x2 = pathData[i + 1][0];
        const y2 = pathData[i + 1][1];
        const midX = (x1 + x2) / 2;
        path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
    }

    return path;
};

interface StatsWidgetProps {
    label: string;
    value: string;
    change?: number;
    chartData?: number[];
    className?: string;
}

export const StatsWidget = ({ label, value, change = 0, chartData, className }: StatsWidgetProps) => {
    const linePathRef = useRef<SVGPathElement>(null);
    const areaPathRef = useRef<SVGPathElement>(null);

    // SVG viewbox dimensions
    const svgWidth = 150;
    const svgHeight = 60;

    // Generate random chart data if not provided
    const displayChartData = useMemo(() => {
        if (chartData && chartData.length >= 2) return chartData;
        // Generate some default chart data based on change direction
        const baseData = [30, 45, 35, 55, 50, 65, 60];
        return change >= 0 
            ? baseData.map((v, i) => v + i * 5) 
            : baseData.map((v, i) => v - i * 3);
    }, [chartData, change]);

    // Generate the SVG path for the line
    const linePath = useMemo(
        () => generateSmoothPath(displayChartData, svgWidth, svgHeight),
        [displayChartData]
    );

    // Generate the SVG path for the gradient area
    const areaPath = useMemo(() => {
        if (!linePath.startsWith("M")) return "";
        return `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
    }, [linePath]);

    // Animate the line graph on change
    useEffect(() => {
        const path = linePathRef.current;
        const area = areaPathRef.current;

        if (path && area) {
            const length = path.getTotalLength();
            // Animate Line
            path.style.transition = 'none';
            path.style.strokeDasharray = length + ' ' + length;
            path.style.strokeDashoffset = String(length);

            // Animate Area
            area.style.transition = 'none';
            area.style.opacity = '0';

            // Trigger reflow
            path.getBoundingClientRect();

            // Start Transitions
            path.style.transition = 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease';
            path.style.strokeDashoffset = '0';

            area.style.transition = 'opacity 0.8s ease-in-out 0.2s, fill 0.5s ease';
            area.style.opacity = '1';
        }
    }, [linePath]);

    const isPositive = change >= 0;
    const strokeColor = isPositive ? '#22C55E' : '#F97316';
    const gradientId = isPositive ? 'areaGradientSuccess' : 'areaGradientDestructive';

    return (
        <div
            className={cn(
                "w-full glass-card text-card-foreground rounded-2xl p-5",
                className
            )}
        >
            <div className="flex justify-between items-center gap-4">
                {/* Left side content */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="truncate">{label}</span>
                        <span className={cn(
                            "flex items-center font-semibold",
                            isPositive ? "text-green-500" : "text-orange-500"
                        )}>
                            {Math.abs(change).toFixed(2)}%
                            {isPositive ? (
                                <ArrowUp size={14} className="ml-0.5" />
                            ) : (
                                <ArrowDown size={14} className="ml-0.5" />
                            )}
                        </span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-1 truncate">
                        {value}
                    </p>
                </div>

                {/* Right side chart */}
                <div className="w-24 md:w-32 h-12 md:h-14 flex-shrink-0">
                    <svg 
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                        className="w-full h-full" 
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="areaGradientSuccess" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="areaGradientDestructive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <path
                            ref={areaPathRef}
                            d={areaPath}
                            fill={`url(#${gradientId})`}
                        />
                        <path
                            ref={linePathRef}
                            d={linePath}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

interface StatsWidgetsGridProps {
    metrics: Array<{
        label: string;
        value: string;
        change?: number;
        chartData?: number[];
    }>;
    className?: string;
}

export const StatsWidgetsGrid = ({ metrics, className }: StatsWidgetsGridProps) => {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {metrics.map((metric) => (
                <StatsWidget
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    change={metric.change}
                    chartData={metric.chartData}
                />
            ))}
        </div>
    );
};
