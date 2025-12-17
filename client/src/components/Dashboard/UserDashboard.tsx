
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, Calendar, TrendingUp } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { grupos, productos } = useAppState();

  const userGroups = grupos.filter(grupo => 
    grupo.participantes.some(p => p.id === user?.id)
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user?.nombre}!
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus grupos de ahorro colaborativo
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Grupos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroups.length}</div>
            <p className="text-xs text-muted-foreground">
              Grupos activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productos.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Sorteo</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Días restantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorros Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mis Grupos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Grupos Activos</CardTitle>
          <CardDescription>
            Lista de grupos en los que participas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userGroups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No tienes grupos activos aún
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Entrar a un Grupo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {userGroups.map((grupo) => (
                <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{grupo.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      Estado: <span className="capitalize">{grupo.estado.replace('-', ' ')}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Participantes: {grupo.participantes.length}
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

      {/* Productos Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Disponibles</CardTitle>
          <CardDescription>
            Explora las opciones de ahorro colaborativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productos.map((producto) => (
              <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{producto.nombre}</h3>
                <p className="text-gray-600 mb-3">{producto.descripcion}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Valor Mensual:</span>
                    <span className="font-semibold">${producto.valorMensual.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Valor Quincenal:</span>
                    <span className="font-semibold">${producto.valorQuincenal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Duración:</span>
                    <span className="font-semibold">{producto.tiempoDuracion} meses</span>
                  </div>
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Entrar a Grupo
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
