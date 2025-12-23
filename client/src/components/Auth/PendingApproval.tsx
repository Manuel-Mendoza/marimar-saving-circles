import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, UserCheck, Mail } from 'lucide-react';

const PendingApproval = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Cuenta en Revisión
          </CardTitle>
          <CardDescription className="text-gray-600">
            Tu solicitud de registro está siendo revisada por nuestros administradores
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Verificación de identidad en proceso
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Nombre:</strong> {user?.nombre} {user?.apellido}</p>
              <p><strong>Correo:</strong> {user?.correoElectronico}</p>
              <p><strong>Fecha de registro:</strong> {user?.fechaRegistro.toLocaleDateString('es-ES')}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">
                  ¿Qué sucede ahora?
                </p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Un administrador revisará tu información</li>
                  <li>• Verificarán tu cédula de identidad</li>
                  <li>• Recibirás una notificación cuando sea aprobado</li>
                  <li>• El proceso puede tomar hasta 24-48 horas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">
                  Una vez aprobado podrás:
                </p>
                <ul className="text-green-700 space-y-1">
                  <li>• Acceder a tu dashboard personal</li>
                  <li>• Elegir productos para ahorrar</li>
                  <li>• Unirte a grupos de ahorro colaborativo</li>
                  <li>• Gestionar tus pagos mensuales</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={logout}
              variant="outline"
              className="w-full"
            >
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
