import { Link, useLocation } from "react-router-dom";
import { Home, Target, ClipboardList, Users, BarChart3, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: Home, label: "Главная", path: "/" },
  { icon: Target, label: "Мои цели", path: "/goals" },
  { icon: ClipboardList, label: "Самооценка", path: "/self-assessment" },
  { icon: Users, label: "Оценка коллег", path: "/peer-review", badge: 2 },
  { icon: BarChart3, label: "Аналитика", path: "/analytics" },
  { icon: FileText, label: "Отчеты", path: "/reports" },
];

export const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none">WINK</h1>
                <p className="text-xs text-muted-foreground">Performance Review</p>
              </div>
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
                      relative px-4 py-2 rounded-lg transition-base flex items-center gap-2
                      ${isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <Button variant="ghost" size="sm" className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
