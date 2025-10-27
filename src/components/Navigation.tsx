import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Target, ClipboardList, Users, BarChart3, FileText, LogOut } from "lucide-react";
import winkLogo from "@/assets/wink-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Главная", path: "/dashboard" },
  { icon: Target, label: "Мои цели", path: "/goals" },
  { icon: ClipboardList, label: "Самооценка", path: "/self-assessment" },
  { icon: Users, label: "Оценка коллег", path: "/peer-review", badge: 2, badgeTooltip: "Ожидают вашей оценки" },
  { icon: BarChart3, label: "HR Аналитика", path: "/hr-analytics" },
  { icon: FileText, label: "Отчеты", path: "/reports" },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => navigate("/login");

  return (
    <nav className="bg-card/95 backdrop-blur-lg border-b border-border sticky top-0 z-50 shadow-md transition-all">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <img src={winkLogo} alt="WINK" className="h-8 transition-transform group-hover:scale-105" />
              <span className="font-bold text-lg group-hover:text-primary transition-colors">Performance Review</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 group
                      ${isActive 
                        ? "bg-gradient-primary text-primary-foreground shadow-md" 
                        : "text-muted-foreground hover:text-foreground hover:bg-primary-light/50 hover:scale-105"
                      }
                    `}
                  >
                    <Icon className={cn(
                      "w-4 h-4 transition-transform",
                      isActive && "scale-110"
                    )} />
                    <span className="text-sm font-semibold">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        className="ml-1 h-5 min-w-5 flex items-center justify-center px-1.5 bg-destructive text-destructive-foreground animate-pulse shadow-sm"
                        title={item.badgeTooltip || ""}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary-foreground rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-all group" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline font-medium">Выйти</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
