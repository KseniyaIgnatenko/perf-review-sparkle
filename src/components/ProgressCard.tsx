import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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
    <Card className={cn("shadow-card transition-smooth hover:shadow-lg", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", config.bgColor, config.color)}>
              {icon}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <span className={cn("text-sm font-medium", config.color)}>
            {config.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
