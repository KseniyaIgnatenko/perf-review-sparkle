import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center space-y-4", className)}>
      <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary animate-scale-in">
        {icon}
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gradient-primary mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
