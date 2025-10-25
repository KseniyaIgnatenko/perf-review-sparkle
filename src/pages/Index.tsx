import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Автоматически перенаправляем на Dashboard как основную страницу
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
