import { Link, useLocation } from "react-router-dom";
import { Home, Target, ClipboardList, Users, BarChart3, FileText, LogOut, ClipboardCheck } from "lucide-react";
import winkLogo from "@/assets/wink-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfiles";

export const Navigation = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const isManager = profile?.role === 'manager';
  const isHR = profile?.role === 'hr' || profile?.role === 'admin';

  const navItems = [
    { icon: Home, label: "Главная", path: "/dashboard", roles: ['employee', 'manager', 'hr', 'admin'] },
    { icon: Target, label: "Мои цели", path: "/goals", roles: ['employee', 'manager', 'hr', 'admin'] },
    { icon: ClipboardList, label: "Самооценка", path: "/self-assessment", roles: ['employee', 'manager', 'hr', 'admin'] },
    { icon: Users, label: "Оценка коллег", path: "/peer-review", roles: ['employee', 'manager', 'hr', 'admin'] },
    { icon: ClipboardCheck, label: "Панель менеджера", path: "/manager", roles: ['manager'] },
    { icon: BarChart3, label: "HR Аналитика", path: "/hr-analytics", roles: ['hr', 'admin'] },
    { icon: FileText, label: "Отчеты", path: "/reports", roles: ['employee', 'manager', 'hr', 'admin'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(profile?.role || 'employee')
  );
  
  const handleLogout = () => signOut();

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <img src={winkLogo} alt="WINK" className="h-8" />
              <span className="font-bold text-lg">Performance Review</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2",
                      isActive 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2" 
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Выйти</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
