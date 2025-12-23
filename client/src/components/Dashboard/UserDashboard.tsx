
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Package, Calendar, TrendingUp, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { grupos, productos, userGroups, contributions, deliveries } = useAppState();

  // Find user's group memberships
  const myUserGroups = userGroups.filter(ug => ug.userId === user?.id);
  const myGroups = grupos.filter(g => myUserGroups.some(ug => ug.groupId === g.id));
  const myContributions = contributions.filter(c => c.userId === user?.id);
  const myDeliveries = deliveries.filter(d => d.userId === user?.id);

  // Calculate payment progress
  const totalPaid = myContributions
    .filter(c => c.estado === 'CONFIRMADO')
    .reduce((sum, c) => sum + c.monto, 0);

  // Get current group info
  const currentGroup = myGroups[0]; // Assuming user is in one group for now
  const myPosition = myUserGroups.find(ug => ug.groupId === currentGroup?.id)?.posicion;
  const groupProgress = currentGroup ? (currentGroup.turnoActual / currentGroup.duracionMeses) * 100 : 0;

  // Calculate when user will receive product
  const monthsUntilDelivery = myPosition ? myPosition - (currentGroup?.turnoActual || 0) : 0;
  const estimatedDeliveryDate = monthsUntilDelivery > 0 && currentGroup?.fechaInicio
    ? new Date(currentGroup.fechaInicio.getTime() + monthsUntilDelivery * 30 * 24 * 60 * 60 * 1000)
    : null;

  const hasChosenProduct = myUserGroups.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user?.nombre}!
          </h1>
          <p className="text-gray-600 mt-1">
            {hasChosenProduct
              ? 'Tu progreso en círculos de ahorro colaborativo'
              : 'Elige un producto para comenzar tu ahorro colaborativo'
            }
          </p>
        </div>
      </div>

      {hasChosenProduct ? (
        <>
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Posición</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{myPosition || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              En el grupo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              En contribuciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Entrega</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estimatedDeliveryDate
                ? estimatedDeliveryDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {monthsUntilDelivery > 0 ? `En ${monthsUntilDelivery} meses` : '¡Pronto!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Grupo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={currentGroup?.estado === 'EN_MARCHA' ? 'default' : 'secondary'}>
                {currentGroup?.estado.replace('_', ' ') || 'SIN GRUPO'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Mes {currentGroup?.turnoActual || 0} de {currentGroup?.duracionMeses || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso del Grupo */}
      {currentGroup && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso de {currentGroup.nombre}</CardTitle>
            <CardDescription>
              Avance del círculo de ahorro - {currentGroup.duracionMeses} meses de duración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del grupo</span>
                <span>{Math.round(groupProgress)}%</span>
              </div>
              <Progress value={groupProgress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentGroup.turnoActual}</div>
                <div className="text-sm text-gray-600">Meses completados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{myDeliveries.length}</div>
                <div className="text-sm text-gray-600">Entregas realizadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {myContributions.filter(c => c.estado === 'PENDIENTE').length}
                </div>
                <div className="text-sm text-gray-600">Pagos pendientes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {currentGroup.duracionMeses - currentGroup.turnoActual}
                </div>
                <div className="text-sm text-gray-600">Meses restantes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial de Pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Contribuciones</CardTitle>
          <CardDescription>
            Tus pagos mensuales al grupo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myContributions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay contribuciones registradas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myContributions.slice().reverse().map((contribution) => (
                <div key={contribution.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`h-5 w-5 ${contribution.estado === 'CONFIRMADO' ? 'text-green-500' : 'text-yellow-500'}`} />
                    <div>
                      <p className="font-medium">{contribution.periodo}</p>
                      <p className="text-sm text-gray-600">
                        {contribution.fechaPago.toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${contribution.monto} {contribution.moneda}</p>
                    <Badge variant={contribution.estado === 'CONFIRMADO' ? 'default' : 'secondary'}>
                      {contribution.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificaciones/Próximas acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Acciones</CardTitle>
          <CardDescription>
            Mantente al día con tus responsabilidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {myContributions.some(c => c.estado === 'PENDIENTE') && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Pago pendiente</p>
                  <p className="text-sm text-yellow-700">Tienes contribuciones por confirmar</p>
                </div>
              </div>
            )}

            {monthsUntilDelivery <= 1 && monthsUntilDelivery > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">¡Tu turno se acerca!</p>
                  <p className="text-sm text-blue-700">
                    Recibirás tu producto en {monthsUntilDelivery} mes{monthsUntilDelivery > 1 ? 'es' : ''}
                  </p>
                </div>
              </div>
            )}

            {myDeliveries.length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">¡Producto recibido!</p>
                  <p className="text-sm text-green-700">
                    Has completado exitosamente tu ciclo de ahorro
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </>
      ) : (
        /* Productos Disponibles */
        <Card>
          <CardHeader>
            <CardTitle>Elegir Producto</CardTitle>
            <CardDescription>
              Selecciona el producto que deseas adquirir mediante ahorro colaborativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="electrodomésticos">Electrodomésticos</TabsTrigger>
                <TabsTrigger value="celulares">Celulares</TabsTrigger>
                <TabsTrigger value="tv">TV</TabsTrigger>
              </TabsList>

              <TabsContent value="todos">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos.filter(p => p.activo).map((producto) => {
                    const pagoMensual = Math.round(producto.precioUsd / producto.tiempoDuracion);
                    return (
                      <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                          {producto.tags && producto.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {producto.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm">Precio USD:</span>
                            <span className="font-semibold">${producto.precioUsd}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Precio VES:</span>
                            <span className="font-semibold">Bs. {producto.precioVes.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pago mensual:</span>
                            <span className="font-semibold">${pagoMensual}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Duración:</span>
                            <span className="font-semibold">{producto.tiempoDuracion} meses</span>
                          </div>
                        </div>

                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Package className="h-4 w-4 mr-2" />
                          Unirme al Grupo de {producto.tiempoDuracion} meses
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="electrodomésticos">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos.filter(p => p.activo && p.tags?.includes('electrodomésticos')).map((producto) => {
                    const pagoMensual = Math.round(producto.precioUsd / producto.tiempoDuracion);
                    return (
                      <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                          {producto.tags && producto.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {producto.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm">Precio USD:</span>
                            <span className="font-semibold">${producto.precioUsd}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Precio VES:</span>
                            <span className="font-semibold">Bs. {producto.precioVes.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pago mensual:</span>
                            <span className="font-semibold">${pagoMensual}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Duración:</span>
                            <span className="font-semibold">{producto.tiempoDuracion} meses</span>
                          </div>
                        </div>

                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Package className="h-4 w-4 mr-2" />
                          Unirme al Grupo de {producto.tiempoDuracion} meses
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="celulares">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos.filter(p => p.activo && p.tags?.includes('celulares')).map((producto) => {
                    const pagoMensual = Math.round(producto.precioUsd / producto.tiempoDuracion);
                    return (
                      <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                          {producto.tags && producto.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {producto.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm">Precio USD:</span>
                            <span className="font-semibold">${producto.precioUsd}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Precio VES:</span>
                            <span className="font-semibold">Bs. {producto.precioVes.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pago mensual:</span>
                            <span className="font-semibold">${pagoMensual}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Duración:</span>
                            <span className="font-semibold">{producto.tiempoDuracion} meses</span>
                          </div>
                        </div>

                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Package className="h-4 w-4 mr-2" />
                          Unirme al Grupo de {producto.tiempoDuracion} meses
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="tv">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos.filter(p => p.activo && p.tags?.includes('tv')).map((producto) => {
                    const pagoMensual = Math.round(producto.precioUsd / producto.tiempoDuracion);
                    return (
                      <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                          {producto.tags && producto.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {producto.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm">Precio USD:</span>
                            <span className="font-semibold">${producto.precioUsd}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Precio VES:</span>
                            <span className="font-semibold">Bs. {producto.precioVes.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pago mensual:</span>
                            <span className="font-semibold">${pagoMensual}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Duración:</span>
                            <span className="font-semibold">{producto.tiempoDuracion} meses</span>
                          </div>
                        </div>

                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <Package className="h-4 w-4 mr-2" />
                          Unirme al Grupo de {producto.tiempoDuracion} meses
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
