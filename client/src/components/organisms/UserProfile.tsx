import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/atoms';
import { UserAvatar } from '@/components/atoms';
import { Upload, Camera, X, Check } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestiona tu información personal y foto de perfil
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del usuario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Tus datos personales y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={user.nombre} disabled />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={user.apellido} disabled />
                </div>
                <div>
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input id="cedula" value={user.cedula} disabled />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" value={user.telefono} disabled />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" type="email" value={user.correoElectronico} disabled />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Tipo de usuario:</span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {user.tipo.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Estado:</span>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {user.estado.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400">Fecha de registro:</span>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(user.fechaRegistro)}
                    </p>
                  </div>
                  {user.ultimoAcceso && (
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Último acceso:</span>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(user.ultimoAcceso)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Foto de perfil */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Actualiza tu foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar actual */}
              <div className="flex justify-center">
                <UserAvatar
                  name={user.nombre}
                  lastname={user.apellido}
                  imageUrl={previewUrl || user.imagenPerfil || user.imagenCedula}
                  size="xl"
                />
              </div>

              {/* Selector de archivo */}
              <div className="space-y-2">
                <Label htmlFor="profile-image">Nueva imagen</Label>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Formatos permitidos: JPG, PNG, WebP. Tamaño máximo: 5MB
                </p>
              </div>

              {/* Acciones */}
              {selectedFile && (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                    <Upload className="h-4 w-4 mr-2" />
                    Subir imagen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearSelection}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Estado de carga */}
              {isLoading && (
                <div className="text-center py-2">
                  <LoadingSpinner size="sm" className="inline mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Actualizando perfil...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
