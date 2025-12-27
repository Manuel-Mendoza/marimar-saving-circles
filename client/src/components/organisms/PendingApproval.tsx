import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthTemplate } from '@/components/templates';
import { StatusBadge } from '@/components/atoms';
import { Clock, AlertCircle, Mail, Phone } from 'lucide-react';

interface PendingApprovalProps {
  user?: {
    nombre: string;
    apellido?: string;
    email: string;
    telefono?: string;
  };
  onContactAdmin?: () => void;
}

/**
 * Organism: Vista de aprobación pendiente
 * Muestra estado de registro pendiente de aprobación
 */
const PendingApproval: React.FC<PendingApprovalProps> = ({ user, onContactAdmin }) => {
  return (
    <AuthTemplate>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Registro Pendiente</CardTitle>
            <CardDescription>
              Tu solicitud de registro está siendo revisada por nuestros administradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estado del registro */}
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-600">Estado:</span>
              <StatusBadge status="PENDIENTE" />
            </div>

            {/* Información del usuario */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900">Información registrada:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-700">Nombre:</span>
                  <span>
                    {user?.nombre} {user?.apellido}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{user?.email}</span>
                </div>
                {user?.telefono && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user.telefono}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información sobre el proceso */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>¿Qué sucede ahora?</strong>
                <br />
                Un administrador revisará tu información y la copia de tu cédula de identidad. Una
                vez aprobado, recibirás un correo electrónico de confirmación y podrás acceder a tu
                cuenta.
              </AlertDescription>
            </Alert>

            {/* Información de tiempo estimado */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                El proceso de aprobación usualmente toma entre 24-48 horas hábiles.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button onClick={onContactAdmin} variant="outline" className="w-full">
                Contactar Administrador
              </Button>
              <Button onClick={() => window.location.reload()} variant="ghost" className="w-full">
                Verificar Estado
              </Button>
            </div>

            {/* Información adicional */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                ¿Tienes preguntas? Contáctanos a través del formulario de soporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthTemplate>
  );
};

export default PendingApproval;
