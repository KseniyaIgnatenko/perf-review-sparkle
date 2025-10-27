import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle px-6">
      <div className="text-center space-y-8 animate-fade-in max-w-md">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-primary/5 rounded-full animate-pulse" />
          </div>
          <div className="relative">
            <h1 className="text-9xl font-bold text-primary/20 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <SearchX className="w-24 h-24 text-primary animate-scale-in" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">Страница не найдена</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            К сожалению, запрашиваемая страница не существует или была перемещена.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild className="gradient-primary gap-2 group">
            <Link to="/dashboard">
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              На главную
            </Link>
          </Button>
          <Button asChild variant="outline" className="hover:bg-primary-light transition-all">
            <Link to="/goals">
              Мои цели
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
