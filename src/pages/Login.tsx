import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import winkLogo from "@/assets/wink-logo.png";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailOrName.trim() || !password.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Все поля обязательны для заполнения",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(emailOrName, password);
    
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: error.message === "Invalid login credentials"
          ? "Неверный email/ФИО или пароль"
          : error.message,
      });
      return;
    }

    toast({
      title: "Успешный вход",
      description: "Добро пожаловать в систему WINK Performance Review",
    });
    navigate("/dashboard");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Все поля обязательны для заполнения",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Неверный формат email",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пароль должен содержать минимум 6 символов",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка регистрации",
        description: error.message === "User already registered"
          ? "Пользователь с таким email уже зарегистрирован"
          : error.message,
      });
      return;
    }

    toast({
      title: "Регистрация успешна",
      description: "Вы можете войти в систему",
    });
    
    // Auto login after successful signup
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <img src={winkLogo} alt="WINK" className="h-16 mx-auto" />
            <h1 className="text-3xl font-bold">Performance Review</h1>
            <p className="text-muted-foreground text-lg">
              Система целеполагания и оценки
            </p>
          </div>

          <Tabs defaultValue="signin" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Вход</TabsTrigger>
              <TabsTrigger value="signup">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email или ФИО</Label>
                  <Input
                    id="signin-email"
                    type="text"
                    placeholder="example@company.com или Иванов Иван Иванович"
                    value={emailOrName}
                    onChange={(e) => setEmailOrName(e.target.value)}
                    maxLength={100}
                    className="h-12"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Пароль</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base gradient-primary"
                  disabled={isLoading || !emailOrName.trim() || !password.trim()}
                >
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">ФИО</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Иванов Иван Иванович"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    maxLength={100}
                    className="h-12"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={100}
                    className="h-12"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Пароль</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base gradient-primary"
                  disabled={isLoading || !email.trim() || !password.trim() || !fullName.trim()}
                >
                  {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground">
            Возникли проблемы со входом? Свяжитесь с технической поддержкой
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
              <div className="text-3xl font-bold">OKR</div>
              <div className="text-sm opacity-80">Методология</div>
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
