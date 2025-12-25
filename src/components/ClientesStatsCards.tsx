import React from "react";
import { LucideIcon } from "lucide-react";

export interface ClientsStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: "gray" | "blue" | "green" | "red" | "orange" | "purple";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
};

export const ClientsStatsCard: React.FC<ClientsStatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = "gray",
  trend,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>

          {trend && (
            <div
              className={`text-xs mt-1 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[iconColor]}`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

// Grid de stats para layouts
export interface ClientsStatsGridProps {
  stats: ClientsStatCardProps[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const StatsGrid: React.FC<ClientsStatsGridProps> = ({
  stats,
  columns = 4,
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-6",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <ClientsStatsCard key={index} {...stat} />
      ))}
    </div>
  );
};
