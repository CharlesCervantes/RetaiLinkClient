import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: "var(--color-brand)", color: "#000" }}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
