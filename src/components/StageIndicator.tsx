import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stage {
  label: string;
  status: "not-started" | "in-progress" | "completed";
}

interface StageIndicatorProps {
  stages: Stage[];
  className?: string;
}

export const StageIndicator = ({ stages, className }: StageIndicatorProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
          <div
            className="h-full bg-primary transition-smooth"
            style={{
              width: `${(stages.filter(s => s.status === "completed").length / stages.length) * 100}%`,
            }}
          />
        </div>

        {/* Stages */}
        {stages.map((stage, index) => {
          const isCompleted = stage.status === "completed";
          const isInProgress = stage.status === "in-progress";
          const isNotStarted = stage.status === "not-started";

          return (
            <div key={index} className="flex flex-col items-center gap-2 relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-smooth border-4 border-background",
                  isCompleted && "bg-success text-success-foreground",
                  isInProgress && "bg-primary text-primary-foreground",
                  isNotStarted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[80px]",
                  isCompleted && "text-success",
                  isInProgress && "text-primary",
                  isNotStarted && "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
