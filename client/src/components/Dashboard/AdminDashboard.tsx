
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, CheckCircle, Clock, Dice6 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { grupos, productos } = useAppState();

  const gruposSinCompletar = grupos.filter(g => g.estado === 'sin-completar');
  const gruposLlenos = grupos.filter(g => g.estado === 'lleno');
  const gruposEnMarcha = grupos.filter(g => g.estado === 'en-marcha');

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión completa del sistema San Marimar
          </p>
        </div>
      </div>

      {/* Resumen de Todos los Grupos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grupos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grupos.length}</div>
            <p className="text-xs text-muted-foreground">
              Grupos creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Completar</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{gruposSinCompletar.length}</div>
            <p className="text-xs text-muted-foreground">
              Esperando participantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Llenos</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{gruposLlenos.length}</div>
            <p className="text-xs text-muted-foreground">
              Listos para sorteo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Marcha</CardTitle>
            <Dice6 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gruposEnMarcha.length}</div>
            <p className="text-xs text-muted-foreground">
              Activos con sorteos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grupos Sin Completar */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos Sin Completar</CardTitle>
          <CardDescription>
            Grupos que necesitan más participantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gruposSinCompletar.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay grupos sin completar
            </p>
          ) : (
            <div className="space-y-4">
              {gruposSinCompletar.map((grupo) => (
                <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{grupo.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      Participantes: {grupo.participantes.length}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-yellow-600 font-medium">
                      Esperando participantes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grupos Llenos - Listos para Sorteo */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos Llenos - Realizar Sorteo</CardTitle>
          <CardDescription>
            Grupos completos listos para iniciar sorteos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gruposLlenos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay grupos listos para sorteo
            </p>
          ) : (
            <div className="space-y-4">
              {gruposLlenos.map((grupo) => (
                <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div>
                    <h3 className="font-semibold">{grupo.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      Participantes: {grupo.participantes.length}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      Valor: ${grupo.valor.toLocaleString()}
                    </p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Realizar Sorteo
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grupos en Marcha */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos en Marcha</CardTitle>
          <CardDescription>
            Grupos activos con sorteos programados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gruposEnMarcha.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay grupos en marcha
            </p>
          ) : (
            <div className="space-y-4">
              {gruposEnMarcha.map((grupo) => (
                <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <h3 className="font-semibold">{grupo.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      Semana/Mes actual: {grupo.semana || 1}/{grupo.mes || 1}
                    </p>
                    <p className="text-sm text-gray-600">
                      Turno actual: {grupo.turnoActual || 'Por definir'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${grupo.valor.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Valor del grupo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
