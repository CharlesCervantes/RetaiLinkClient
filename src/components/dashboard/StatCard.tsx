import { cn } from "../../lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accent?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, accent, className }: StatCardProps) {
  const accentColor = accent ?? "var(--color-brand)";

  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex flex-col gap-3 relative overflow-hidden transition-all duration-200 hover:shadow-md",
        className
      )}
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow)",
      }}
    >
      {/* Accent bar top-left */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between pl-2">
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {title}
        </p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: accentColor + "22", color: accentColor === "var(--color-brand)" ? "#6b7a00" : accentColor }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="pl-2">
        <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>

        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span
                className={cn("inline-flex items-center gap-0.5 text-xs font-medium")}
                style={{ color: trend.isPositive ? "var(--success)" : "var(--error)" }}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
