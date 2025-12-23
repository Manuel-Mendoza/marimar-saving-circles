
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';

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
    correoElectronico: '',
    password: ''
  });
  const [imagenCedula, setImagenCedula] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!imagenCedula) {
      setError('Debe subir una imagen de su cédula de identidad');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Crear FormData para enviar archivo y datos
      const submitData = new FormData();
      submitData.append('nombre', formData.nombre);
      submitData.append('apellido', formData.apellido);
      submitData.append('cedula', formData.cedula);
      submitData.append('telefono', formData.telefono);
      submitData.append('direccion', formData.direccion);
      submitData.append('correoElectronico', formData.correoElectronico);
      submitData.append('password', formData.password);
      submitData.append('imagenCedula', imagenCedula);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (data.success) {
        // Mostrar mensaje de éxito - cuenta creada y pendiente de aprobación
        setSuccessMessage('¡Cuenta creada exitosamente! Su registro está pendiente de aprobación por un administrador. Recibirá una notificación cuando sea aprobado.');
        setError('');
      } else {
        setError(data.message || 'Error al registrar usuario');
      }
    } catch (error: any) {
      setError('Error de conexión. Verifique que el servidor esté ejecutándose.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagenCedula">Imagen de Cédula de Identidad *</Label>
              <Input
                id="imagenCedula"
                type="file"
                accept="image/*"
                required
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validar tamaño del archivo (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      setError('La imagen no puede ser mayor a 5MB');
                      setImagenCedula(null);
                      e.target.value = '';
                      return;
                    }
                    setImagenCedula(file);
                    setError('');
                  }
                }}
              />
              <p className="text-sm text-gray-600">
                Suba una imagen clara de su cédula de identidad (máx. 5MB)
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-semibold">¡Registro Exitoso!</span>
                </div>
                <p className="text-green-700 text-sm">
                  {successMessage}
                </p>
                <Button
                  onClick={onBack}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Ir al Login
                </Button>
              </div>
            )}

            {!successMessage && (
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
