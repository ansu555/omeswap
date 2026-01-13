import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

export const Sparkline = ({
  data,
  width = 100,
  height = 32,
  positive = true,
}: SparklineProps) => {
  const pathD = useMemo(() => {
    if (!data || data.length < 2) return "";

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
      return { x, y };
    });

    return points.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      
      // Smooth curve using quadratic bezier
      const prev = points[index - 1];
      const cpX = (prev.x + point.x) / 2;
      return `${acc} Q ${cpX} ${prev.y} ${point.x} ${point.y}`;
    }, "");
  }, [data, width, height]);

  const strokeColor = positive ? "hsl(var(--success))" : "hsl(var(--destructive))";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient
          id={`sparkline-gradient-${positive ? "up" : "down"}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      {pathD && (
        <>
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
};
