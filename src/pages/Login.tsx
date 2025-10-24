import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Поле обязательно для заполнения",
      });
      return;
    }

    if (email.includes("@") && !validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Неверный формат email",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в систему WINK Performance Review",
      });
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4">
              <span className="text-primary-foreground font-bold text-3xl">W</span>
            </div>
            <h1 className="text-3xl font-bold">WINK Performance Review</h1>
            <p className="text-muted-foreground text-lg">
              Система целеполагания и оценки
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">ФИО или Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                className="h-12"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base gradient-primary"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Возникли проблемы со входом?{" "}
            <a href="#" className="text-primary hover:underline">
              Связаться с поддержкой
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-8">
        <div className="max-w-lg text-center space-y-6 text-white">
          <h2 className="text-4xl font-bold">
            Развивайте потенциал команды
          </h2>
          <p className="text-xl opacity-90">
            Комплексная система управления целями, оценки результатов и развития сотрудников
          </p>
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold">360°</div>
              <div className="text-sm opacity-80">Оценка</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">5+</div>
              <div className="text-sm opacity-80">Целей</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm opacity-80">Прозрачность</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
