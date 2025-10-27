import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getProgressColor } from "@/utils/progressHelpers";

interface ProgressCardProps {
  title: string;
  icon: ReactNode;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  children?: ReactNode;
  className?: string;
}

const statusConfig = {
  "not-started": {
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Не начато",
  },
  "in-progress": {
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "В процессе",
  },
  completed: {
    color: "text-success",
    bgColor: "bg-success-light",
    label: "Завершено",
  },
};

export const ProgressCard = ({
  title,
  icon,
  progress,
  status,
  children,
  className,
}: ProgressCardProps) => {
  const config = statusConfig[status];

  return (
    <Card className={cn("shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl transition-transform hover:scale-110", config.bgColor, config.color)}>
              {icon}
            </div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          </div>
          <span className={cn("text-sm font-semibold px-3 py-1.5 rounded-full", config.color, config.bgColor)}>
            {config.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Прогресс</span>
            <span className={cn("font-bold text-base", getProgressColor(progress))}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2.5" progressColor={progress} />
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
