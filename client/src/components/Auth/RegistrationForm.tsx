
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface RegistrationFormProps {
  onBack: () => void;
}

const RegistrationForm = ({ onBack }: RegistrationFormProps) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    direccion: '',
    correoElectronico: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser = {
      id: `user-${Date.now()}`,
      ...formData,
      tipo: 'usuario' as const,
      grupos: []
    };

    login(newUser);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold text-blue-800">
                Registro de Usuario
              </CardTitle>
              <CardDescription>
                Complete el formulario para crear su cuenta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  placeholder="Juan"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  required
                  value={formData.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  placeholder="Pérez"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula *</Label>
              <Input
                id="cedula"
                required
                value={formData.cedula}
                onChange={(e) => handleChange('cedula', e.target.value)}
                placeholder="12.345.678"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                required
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+58 424 123 4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección *</Label>
              <Input
                id="direccion"
                required
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                placeholder="Caracas, Venezuela"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="correoElectronico">Correo Electrónico *</Label>
              <Input
                id="correoElectronico"
                type="email"
                required
                value={formData.correoElectronico}
                onChange={(e) => handleChange('correoElectronico', e.target.value)}
                placeholder="usuario@ejemplo.com"
              />
            </div>
            
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Crear Cuenta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
