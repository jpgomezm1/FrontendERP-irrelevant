import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, loading } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Por favor ingrese usuario y contraseña");
      return;
    }
    
    try {
      const email = username.includes("@") ? username : `${username}@stayirrelevant.com`;
      console.log("Attempting login with:", email);
      
      await signIn(email, password);
    } catch (err) {
      console.error("Error in login component:", err);
      setError("Error al intentar iniciar sesión");
      toast.error('Error de inicio de sesión', {
        description: 'Verifique sus credenciales'
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f0b2a] bg-gradient-to-br from-[#0f0b2a] to-[#1a1542]">
      {/* Logo Container */}
      <div className="mb-8">
        <img 
          src="https://storage.googleapis.com/cluvi/nuevo_irre-removebg-preview.png"
          alt="Irrelevant Logo"
          className="w-48 h-auto"
        />
      </div>
      
      <Card className="w-full max-w-md border-0 bg-[#1a1647]/70 backdrop-blur-sm text-white shadow-lg shadow-purple-900/20">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-center text-white">Sistema de control</CardTitle>
          <CardDescription className="text-center text-purple-200/70">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-purple-200">Usuario</Label>
              <Input
                id="username"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="bg-[#241e5a] border-purple-700/50 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-200">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-[#241e5a] border-purple-700/50 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-red-300 bg-red-900/30 border border-red-700/50 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 transition-all text-white font-medium py-5" 
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-8 text-xs text-purple-300/50">
        © 2025 Irrelevant • Expertos en Automatización con IA
      </div>
    </div>
  );
};

export default LoginPage;