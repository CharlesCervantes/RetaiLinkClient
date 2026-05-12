import { cn } from "../../lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn("animate-page-in p-6 space-y-6 min-h-full", className)}>
      {children}
    </div>
  );
}
