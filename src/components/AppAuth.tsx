import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

interface AppAuthProps {
  children: React.ReactNode;
}

export const AppAuth = ({ children }: AppAuthProps) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const COMMON_PASSWORD = "uclouvain";

  useEffect(() => {
    const authStatus = localStorage.getItem("app_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    if (password === COMMON_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("app_authenticated", "true");
      toast({
        title: "Accès autorisé",
        description: "Bienvenue dans l'application UCLouvain",
      });
    } else {
      toast({
        title: "Accès refusé",
        description: "Mot de passe incorrect",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">UCLouvain</CardTitle>
            <p className="text-muted-foreground">Gestion des Cours</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Mot de passe d'accès"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Accéder à l'application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};