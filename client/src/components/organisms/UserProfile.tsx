import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/atoms';
import { UserAvatar } from '@/components/atoms';
import {
  Upload,
  Camera,
  X,
  Check,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
  Award,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UserProfileProps {
  /** Usuario actual */
  user: {
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    telefono: string;
    correoElectronico: string;
    tipo: 'USUARIO' | 'ADMINISTRADOR';
    estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
    imagenCedula?: string;
    imagenPerfil?: string;
    fechaRegistro: string;
    ultimoAcceso?: string;
    aprobadoPor?: number;
    fechaAprobacion?: string;
    motivo?: string;
  };
}

/**
 * Componente Organism para la gestión del perfil de usuario
 * Permite actualizar la imagen de perfil con recarga automática
 */
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar archivo
  const validateFile = (file: File | null) => {
    if (!file) return 'Debes seleccionar una imagen';
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG o WebP';
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'La imagen no puede ser mayor a 5MB';
    }
    return '';
  };

  // Manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    const error = validateFile(file);

    if (error) {
      toast({
        title: 'Error de validación',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // Limpiar selección
  const handleClearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Subir imagen y actualizar perfil
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      // Convertir imagen a base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // Actualizar perfil
      const response = await apiClient.updateProfile(user.id, {
        imagenPerfil: base64,
      });

      if (response.success) {
        toast({
          title: 'Perfil actualizado',
          description: 'Tu imagen de perfil ha sido actualizada exitosamente.',
        });

        // Recargar datos del usuario para actualizar la UI automáticamente
        await refreshUser();

        // Limpiar selección
        handleClearSelection();
      } else {
        throw new Error(response.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la imagen de perfil. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 p-6 space-y-4">
      {/* Header con gradiente */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Mi Perfil</h1>
              <p className="text-blue-100">Gestiona tu información personal</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-blue-100">Estado</p>
                <p className="font-semibold">
                  {user.estado === 'APROBADO'
                    ? '✅ Verificado'
                    : user.estado === 'PENDIENTE'
                      ? '⏳ En revisión'
                      : '❌ ' + user.estado.toLowerCase()}
                </p>
              </div>
              <UserAvatar
                name={user.nombre}
                lastname={user.apellido}
                imageUrl={previewUrl || user.imagenPerfil || user.imagenCedula}
                size="lg"
                className="ring-4 ring-white/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Foto de Perfil Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-600" />
            <span>Foto de Perfil</span>
          </CardTitle>
          <CardDescription>
            Actualiza tu imagen de perfil para una mejor experiencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <UserAvatar
                  name={user.nombre}
                  lastname={user.apellido}
                  imageUrl={previewUrl || user.imagenPerfil || user.imagenCedula}
                  size="lg"
                />
                {selectedFile && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Imagen de perfil</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile ? 'Nueva imagen seleccionada' : 'Haz click para cambiar'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  disabled={isLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="pointer-events-none">
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar
                </Button>
              </div>

              {selectedFile && (
                <>
                  <Button
                    onClick={handleUpload}
                    disabled={isLoading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    <Upload className="h-4 w-4 mr-2" />
                    Subir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearSelection}
                    disabled={isLoading}
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 flex items-center space-x-4">
            <span>• JPG, PNG, WebP</span>
            <span>• Máximo 5MB</span>
          </div>

          {isLoading && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-700 dark:text-blue-300">
                <LoadingSpinner size="sm" />
                <span>Actualizando foto de perfil...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información Personal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Información Personal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nombre completo
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {user.nombre} {user.apellido}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cédula</span>
                <span className="font-semibold text-gray-900 dark:text-white">{user.cedula}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Teléfono
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{user.telefono}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Correo electrónico
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-right max-w-xs truncate">
                  {user.correoElectronico}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estado de la Cuenta */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span>Estado de la Cuenta</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tipo de usuario
                </span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">
                  {user.tipo.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Estado de verificación
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.estado === 'APROBADO'
                      ? 'bg-green-100 text-green-800'
                      : user.estado === 'PENDIENTE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.estado === 'APROBADO'
                    ? '✅ Verificado'
                    : user.estado === 'PENDIENTE'
                      ? '⏳ En revisión'
                      : '❌ ' + user.estado.toLowerCase()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fecha de registro
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {formatDate(user.fechaRegistro)}
                </span>
              </div>

              {user.ultimoAcceso && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Último acceso
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {formatDate(user.ultimoAcceso)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
