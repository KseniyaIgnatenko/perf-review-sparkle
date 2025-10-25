import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Target, ClipboardList, Users, BarChart3, FileText, LogOut } from "lucide-react";
import winkLogo from "@/assets/wink-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: Home, label: "Главная", path: "/dashboard" },
  { icon: Target, label: "Мои цели", path: "/goals" },
  { icon: ClipboardList, label: "Самооценка", path: "/self-assessment" },
  { icon: Users, label: "Оценка коллег", path: "/peer-review", badge: 2 },
  { icon: BarChart3, label: "HR Аналитика", path: "/hr-analytics" },
  { icon: FileText, label: "Отчеты", path: "/reports" },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => navigate("/login");

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <img src={winkLogo} alt="WINK" className="h-8" />
              <span className="font-bold text-lg">Performance Review</span>
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

          <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
