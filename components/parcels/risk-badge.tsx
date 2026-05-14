import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getRiskConfig(score: number) {
  if (score <= 30) {
    return {
      label: "Low Risk",
      bg: "rgba(34, 197, 94, 0.12)",
      text: "#22c55e",
      border: "rgba(34, 197, 94, 0.3)",
      barColor: "#22c55e",
    };
  } else if (score <= 60) {
    return {
      label: "Moderate Risk",
      bg: "rgba(234, 179, 8, 0.12)",
      text: "#eab308",
      border: "rgba(234, 179, 8, 0.3)",
      barColor: "#eab308",
    };
  } else if (score <= 80) {
    return {
      label: "Elevated Risk",
      bg: "rgba(249, 115, 22, 0.12)",
      text: "#f97316",
      border: "rgba(249, 115, 22, 0.3)",
      barColor: "#f97316",
    };
  } else {
    return {
      label: "High Risk",
      bg: "rgba(239, 68, 68, 0.12)",
      text: "#ef4444",
      border: "rgba(239, 68, 68, 0.3)",
      barColor: "#ef4444",
    };
  }
}

export function RiskBadge({ score, showScore = true, size = "md", className }: RiskBadgeProps) {
  const config = getRiskConfig(score);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold border",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.text }}
      />
      {config.label}
      {showScore && <span className="opacity-80">({score})</span>}
    </span>
  );
}

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RiskGauge({ score, size = "md", showLabel = true }: RiskGaugeProps) {
  const config = getRiskConfig(score);

  const dimensions = {
    sm: { width: 80, height: 40, strokeWidth: 6 },
    md: { width: 120, height: 60, strokeWidth: 8 },
    lg: { width: 160, height: 80, strokeWidth: 10 },
  };

  const { width, height, strokeWidth } = dimensions[size];
  const radius = (width / 2) - strokeWidth;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const cx = width / 2;
  const cy = height;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth} ${cy} A ${radius} ${radius} 0 0 1 ${width - strokeWidth} ${cy}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth} ${cy} A ${radius} ${radius} 0 0 1 ${width - strokeWidth} ${cy}`}
          fill="none"
          stroke={config.barColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
        {/* Score text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={config.text}
          fontSize={size === "lg" ? "20" : size === "md" ? "16" : "12"}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span
          className="text-xs font-semibold"
          style={{ color: config.text }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}

interface TrustBadgeProps {
  score: number;
  showScore?: boolean;
  className?: string;
}

export function TrustBadge({ score, showScore = true, className }: TrustBadgeProps) {
  let label: string;
  let style: { backgroundColor: string; color: string; borderColor: string };

  if (score >= 80) {
    label = "High Confidence";
    style = {
      backgroundColor: "rgba(34, 197, 94, 0.12)",
      color: "#22c55e",
      borderColor: "rgba(34, 197, 94, 0.3)",
    };
  } else if (score >= 60) {
    label = "Medium Confidence";
    style = {
      backgroundColor: "rgba(234, 179, 8, 0.12)",
      color: "#eab308",
      borderColor: "rgba(234, 179, 8, 0.3)",
    };
  } else if (score >= 40) {
    label = "Low Confidence";
    style = {
      backgroundColor: "rgba(249, 115, 22, 0.12)",
      color: "#f97316",
      borderColor: "rgba(249, 115, 22, 0.3)",
    };
  } else {
    label = "Critical";
    style = {
      backgroundColor: "rgba(239, 68, 68, 0.12)",
      color: "#ef4444",
      borderColor: "rgba(239, 68, 68, 0.3)",
    };
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border",
        className
      )}
      style={style}
    >
      {label}
      {showScore && <span className="opacity-80">({score})</span>}
    </span>
  );
}
