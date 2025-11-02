import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Target, ClipboardList, Users, BarChart3, FileText, LogOut, ClipboardCheck, User, Building2, UserCircle, TrendingUp } from "lucide-react";
import winkLogo from "@/assets/wink-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useManagerMode } from "@/contexts/ManagerModeContext";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { hasRole, isManager } = useUserRoles();
  const { mode, toggleMode } = useManagerMode();

  const navItems = [
    { icon: Home, label: "Главная", path: "/dashboard", roles: ['employee', 'manager', 'hr', 'admin'], visibleInManagerMode: false },
    { icon: Target, label: "Мои цели", path: "/goals", roles: ['employee', 'manager', 'hr', 'admin'], visibleInManagerMode: false },
    { icon: ClipboardList, label: "Самооценка", path: "/self-assessment", roles: ['employee', 'manager', 'hr', 'admin'], visibleInManagerMode: false },
    { icon: Users, label: "Оценка коллег", path: "/peer-review", roles: ['employee', 'manager', 'hr', 'admin'], visibleInManagerMode: false },
    { icon: ClipboardCheck, label: "Моя команда", path: "/manager", roles: ['manager'], visibleInManagerMode: true },
    { icon: TrendingUp, label: "Оценка потенциала", path: "/manager/potential-assessment", roles: ['manager'], visibleInManagerMode: true },
    { icon: BarChart3, label: "HR Аналитика", path: "/hr-analytics", roles: ['hr', 'admin'], visibleInManagerMode: true },
    { icon: FileText, label: "Отчеты", path: "/reports", roles: ['employee', 'manager', 'hr', 'admin'], visibleInManagerMode: false },
  ];

  const visibleNavItems = navItems.filter(item => {
    const hasRequiredRole = item.roles.some(role => hasRole(role as any));
    
    // Если менеджер в режиме менеджера, показываем только менеджерские пункты
    if (isManager && mode === 'manager') {
      return hasRequiredRole && item.visibleInManagerMode;
    }
    
    // В режиме сотрудника показываем только пункты для сотрудников
    return hasRequiredRole && !item.visibleInManagerMode;
  });
  
  const handleLogout = () => signOut();

  const handleModeToggle = () => {
    toggleMode();
    // При переключении на режим менеджера - переходим на страницу команды
    // При переключении на режим сотрудника - переходим на главную
    if (mode === 'employee') {
      navigate('/manager');
    } else {
      navigate('/dashboard');
    }
  };

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

          <div className="flex items-center gap-2">
            {isManager && (
              <Button
                variant={mode === 'manager' ? 'default' : 'outline'}
                size="sm"
                onClick={handleModeToggle}
                className="gap-2"
              >
                {mode === 'manager' ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span className="hidden md:inline">Режим менеджера</span>
                  </>
                ) : (
                  <>
                    <UserCircle className="w-4 h-4" />
                    <span className="hidden md:inline">Режим сотрудника</span>
                  </>
                )}
              </Button>
            )}
            
            <Link to="/profile">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">Профиль</span>
              </Button>
            </Link>

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
      </div>
    </nav>
  );
};
