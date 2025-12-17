
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Shield } from 'lucide-react';

interface LoginFormProps {
  onNewUser: () => void;
}

const LoginForm = ({ onNewUser }: LoginFormProps) => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (userType: 'usuario' | 'administrador') => {
    // Simulación de login - en producción conectar con backend
    const mockUser = {
      id: userType === 'administrador' ? 'admin-1' : 'user-1',
      nombre: userType === 'administrador' ? 'Admin' : 'Usuario',
      apellido: 'Demo',
      cedula: '12345678',
      telefono: '+58 424 123 4567',
      direccion: 'Caracas, Venezuela',
      correoElectronico: credentials.email || 'demo@sanmarimar.com',
      tipo: userType,
      grupos: []
    };

    login(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800">San Marimar</CardTitle>
          <CardDescription className="text-gray-600">
            Sistema de ahorro colaborativo
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="usuario" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usuario" className="flex items-center gap-2">
                <User size={16} />
                Usuario
              </TabsTrigger>
              <TabsTrigger value="administrador" className="flex items-center gap-2">
                <Shield size={16} />
                Admin
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="usuario" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="user-email">Correo Electrónico</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user-password">Contraseña</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleLogin('usuario')}
              >
                Iniciar Sesión como Usuario
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onNewUser}
              >
                ¿Nuevo usuario? Registrarse
              </Button>
            </TabsContent>
            
            <TabsContent value="administrador" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Correo Electrónico</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@sanmarimar.com"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Contraseña</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleLogin('administrador')}
              >
                Iniciar Sesión como Admin
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
