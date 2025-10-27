import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  color: string;
}

const StatItem = ({ icon, label, value, trend, color }: StatItemProps) => {
  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-semibold",
                trend >= 0 ? "text-success" : "text-destructive"
              )}>
                <TrendingUp className={cn("w-4 h-4", trend < 0 && "rotate-180")} />
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
            color
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const QuickStats = () => {
  const stats = [
    {
      icon: <Target className="w-7 h-7 text-primary" />,
      label: "Активных целей",
      value: 3,
      trend: 20,
      color: "bg-primary-light",
    },
    {
      icon: <CheckCircle2 className="w-7 h-7 text-success" />,
      label: "Выполнено",
      value: "65%",
      trend: 12,
      color: "bg-success-light",
    },
    {
      icon: <Clock className="w-7 h-7 text-warning" />,
      label: "Дней до дедлайна",
      value: 14,
      color: "bg-warning-light",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {stats.map((stat, index) => (
        <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
          <StatItem {...stat} />
        </div>
      ))}
    </div>
  );
};
