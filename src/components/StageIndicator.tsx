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
        <div className="absolute top-5 left-0 right-0 h-1.5 bg-muted rounded-full shadow-inner">
          <div
            className="h-full bg-gradient-primary transition-all duration-700 ease-out rounded-full shadow-sm animate-progress-fill"
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
            <div key={index} className="flex flex-col items-center gap-3 relative z-10">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-4 border-background shadow-md",
                  isCompleted && "bg-success text-success-foreground scale-110",
                  isInProgress && "bg-gradient-primary text-primary-foreground animate-pulse",
                  isNotStarted && "bg-muted text-muted-foreground hover:scale-105"
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
                  "text-sm font-semibold text-center max-w-[90px] transition-colors",
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
