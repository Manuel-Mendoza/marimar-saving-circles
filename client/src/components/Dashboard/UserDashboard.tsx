
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { getTagColor } from '@/lib/tagUtils';
import { SimplePriceDisplay } from '@/components/ui/price-display';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Users, Package, Calendar, TrendingUp, MapPin, Clock, CheckCircle, AlertCircle, Menu, Home, ShoppingCart } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { grupos, productos, userGroups, contributions, deliveries, addUserGroup, refreshData } = useAppState();

  // State declarations first
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // Users can switch between products and their groups
  const [currentView, setCurrentView] = useState<'products' | 'groups' | 'group'>('products');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  // Find user's group memberships
  const myUserGroups = userGroups.filter(ug => ug.userId === user?.id);
  const myGroups = grupos.filter(g => myUserGroups.some(ug => ug.groupId === g.id));
  const myContributions = contributions.filter(c => c.userId === user?.id);
  const myDeliveries = deliveries.filter(d => d.userId === user?.id);

  // Calculate payment progress
  const totalPaid = myContributions
    .filter(c => c.estado === 'CONFIRMADO')
    .reduce((sum, c) => sum + c.monto, 0);

  // Get current group info - use selectedGroupId if set, otherwise first group
  const currentGroup = selectedGroupId
    ? myGroups.find(g => g.id === selectedGroupId) || myGroups[0]
    : myGroups[0];
  const myPosition = myUserGroups.find(ug => ug.groupId === currentGroup?.id)?.posicion;
  const groupProgress = currentGroup ? (currentGroup.turnoActual / currentGroup.duracionMeses) * 100 : 0;

  // Filter contributions and deliveries for current group
  const currentGroupContributions = contributions.filter(c => c.groupId === currentGroup?.id);
  const currentGroupDeliveries = deliveries.filter(d => d.groupId === currentGroup?.id);

  // Calculate when user will receive product
  const monthsUntilDelivery = myPosition ? myPosition - (currentGroup?.turnoActual || 0) : 0;
  const estimatedDeliveryDate = monthsUntilDelivery > 0 && currentGroup?.fechaInicio
    ? new Date(currentGroup.fechaInicio.getTime() + monthsUntilDelivery * 30 * 24 * 60 * 60 * 1000)
    : null;

  const hasGroups = myUserGroups.length > 0;
  const hasAvailableGroups = grupos.length > 0; // Grupos disponibles para unirse

  const isGroupInStandby = currentGroup?.estado === 'SIN_COMPLETAR';

  const handleProductSelect = (producto: any) => {
    setSelectedProduct(producto);
    setShowCurrencyModal(true);
  };

  const handleCurrencySelect = async (currency: 'VES' | 'USD') => {
    if (!selectedProduct || !user) return;

    console.log('Selected product:', selectedProduct);
    console.log('Currency:', currency);
    console.log('Product ID:', selectedProduct.id, 'Type:', typeof selectedProduct.id);

    try {
      const response = await apiClient.joinGroup(selectedProduct.id, currency);

      if (response.success && response.data) {
        // Add the new userGroup to the context
        const newUserGroup = {
          id: Date.now(), // Temporary ID, should come from backend
          userId: user.id,
          groupId: response.data.groupId,
          posicion: response.data.position,
          productoSeleccionado: selectedProduct.nombre,
          monedaPago: currency,
          fechaUnion: new Date()
        };
        addUserGroup(newUserGroup);

        // Refresh all data to ensure UI is updated
        await refreshData();

        setShowCurrencyModal(false);
        setSelectedProduct(null);
        // Show success dialog
        setSuccessMessage('¡Te has unido exitosamente al grupo!');
        setShowSuccessDialog(true);
      } else {
        alert('Error al unirse al grupo: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-40 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col space-y-4 mt-6">
            <Button
              variant={currentView === 'products' ? 'default' : 'ghost'}
              className="justify-start"
              onClick={() => setCurrentView('products')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ver Productos
            </Button>
            {hasGroups && (
              <Button
                variant={currentView === 'groups' ? 'default' : 'ghost'}
                className="justify-start"
                onClick={() => setCurrentView('groups')}
              >
                <Users className="h-4 w-4 mr-2" />
                Mis Grupos
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-lg font-semibold text-gray-900">Marimar</h2>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <Button
                variant={currentView === 'products' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setCurrentView('products')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Productos
              </Button>
              {hasGroups && (
                <Button
                  variant={currentView === 'groups' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setCurrentView('groups')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Mis Grupos
                </Button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido, {user?.nombre}!
            </h1>
            <p className="text-gray-600 mt-1">
              {currentView === 'products'
                ? 'Elige un producto para comenzar tu ahorro colaborativo'
                : 'Tu progreso en círculos de ahorro colaborativo'
              }
            </p>
          </div>

          {currentView === 'group' ? (
            <>
              {/* Estadísticas principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mi Posición</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isGroupInStandby ? 'Pendiente' : `#${myPosition || 'N/A'}`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isGroupInStandby ? 'El admin debe iniciar el grupo' : 'En el grupo'}
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
                      {isGroupInStandby
                        ? 'Pendiente'
                        : estimatedDeliveryDate
                          ? estimatedDeliveryDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
                          : 'N/A'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isGroupInStandby
                        ? 'El grupo debe ser iniciado'
                        : monthsUntilDelivery > 0
                          ? `En ${monthsUntilDelivery} meses`
                          : '¡Pronto!'
                      }
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
                      <Badge variant={
                        currentGroup?.estado === 'EN_MARCHA'
                          ? 'default'
                          : currentGroup?.estado === 'SIN_COMPLETAR'
                            ? 'outline'
                            : 'secondary'
                      }>
                        {currentGroup?.estado === 'SIN_COMPLETAR'
                          ? 'En Espera'
                          : currentGroup?.estado?.replace('_', ' ') || 'SIN GRUPO'
                        }
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mes {currentGroup?.turnoActual || 0} de {currentGroup?.duracionMeses || 0}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progreso del Grupo - Solo mostrar si no está en standby */}
              {currentGroup && !isGroupInStandby && (
                <Card className="mb-6">
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
              <Card className="mb-6">
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
                                {contribution.fechaPago ? contribution.fechaPago.toLocaleDateString('es-ES') : 'Pendiente'}
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
                    {isGroupInStandby && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium text-orange-800">Grupo en espera</p>
                          <p className="text-sm text-orange-700">
                            El administrador debe iniciar el grupo para comenzar con los pagos
                          </p>
                        </div>
                      </div>
                    )}

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
          ) : currentView === 'groups' ? (
            <div className="space-y-6">
              {/* Mis Grupos */}
              {hasGroups && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Grupos</CardTitle>
                    <CardDescription>
                      Grupos a los que ya te has unido
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myGroups.map((grupo) => {
                        const myUserGroup = myUserGroups.find(ug => ug.groupId === grupo.id);
                        const currentMembers = userGroups.filter(ug => ug.groupId === grupo.id).length;

                        return (
                          <div key={grupo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{grupo.nombre}</h3>
                              <Badge variant={
                                grupo.estado === 'EN_MARCHA'
                                  ? 'default'
                                  : grupo.estado === 'SIN_COMPLETAR'
                                    ? 'outline'
                                    : 'secondary'
                              }>
                                {grupo.estado === 'SIN_COMPLETAR'
                                  ? 'En Espera'
                                  : grupo.estado?.replace('_', ' ') || 'Activo'
                                }
                              </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Producto:</span>
                                <span className="font-semibold text-green-600">{myUserGroup?.productoSeleccionado}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Tu posición:</span>
                                <span className="font-semibold text-blue-600">
                                  {grupo.estado === 'SIN_COMPLETAR' ? 'Sin definir' : `#${myUserGroup?.posicion}`}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Duración:</span>
                                <span className="font-semibold text-purple-600">{grupo.duracionMeses} meses</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Estado:</span>
                                <span className="font-semibold">
                                  {grupo.estado === 'SIN_COMPLETAR'
                                    ? 'Esperando inicio'
                                    : `Mes ${grupo.turnoActual} de ${grupo.duracionMeses}`
                                  }
                                </span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => {
                                setSelectedGroupId(grupo.id);
                                setCurrentView('group');
                              }}
                            >
                              <Home className="h-4 w-4 mr-2" />
                              Ver Grupo
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
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
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="electrodomésticos">Electrodomésticos</TabsTrigger>
                    <TabsTrigger value="línea blanca">Línea Blanca</TabsTrigger>
                    <TabsTrigger value="celulares">Celulares</TabsTrigger>
                    <TabsTrigger value="tv">TV</TabsTrigger>
                    <TabsTrigger value="cama">Cama</TabsTrigger>
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
                                    <Badge key={index} className={`text-xs border ${getTagColor(tag)}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                            <div className="space-y-3 mb-4">
                              <SimplePriceDisplay vesPrice={producto.precioVes} usdPrice={producto.precioUsd} />
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Duración del plan:</span>
                                <span className="font-semibold text-purple-600">{producto.tiempoDuracion} meses</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleProductSelect(producto)}
                            >
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
                                    <Badge key={index} className={`text-xs border ${getTagColor(tag)}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                            <div className="space-y-3 mb-4">
                              <SimplePriceDisplay vesPrice={producto.precioVes} usdPrice={producto.precioUsd} />
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Duración del plan:</span>
                                <span className="font-semibold text-purple-600">{producto.tiempoDuracion} meses</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleProductSelect(producto)}
                            >
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
                                    <Badge key={index} className={`text-xs border ${getTagColor(tag)}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                            <div className="space-y-3 mb-4">
                              <SimplePriceDisplay vesPrice={producto.precioVes} usdPrice={producto.precioUsd} />
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Duración del plan:</span>
                                <span className="font-semibold text-purple-600">{producto.tiempoDuracion} meses</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleProductSelect(producto)}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Unirme al Grupo de {producto.tiempoDuracion} meses
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="línea blanca">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productos.filter(p => p.activo && p.tags?.includes('línea blanca')).map((producto) => {
                        const pagoMensual = Math.round(producto.precioUsd / producto.tiempoDuracion);
                        return (
                          <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                              {producto.tags && producto.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {producto.tags.map((tag, index) => (
                                    <Badge key={index} className={`text-xs border ${getTagColor(tag)}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                            <div className="space-y-3 mb-4">
                              <SimplePriceDisplay vesPrice={producto.precioVes} usdPrice={producto.precioUsd} />
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Duración del plan:</span>
                                <span className="font-semibold text-purple-600">{producto.tiempoDuracion} meses</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleProductSelect(producto)}
                            >
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
                                    <Badge key={index} className={`text-xs border ${getTagColor(tag)}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                            <div className="space-y-3 mb-4">
                              <SimplePriceDisplay vesPrice={producto.precioVes} usdPrice={producto.precioUsd} />
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Duración del plan:</span>
                                <span className="font-semibold text-purple-600">{producto.tiempoDuracion} meses</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleProductSelect(producto)}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Unirme al Grupo de {producto.tiempoDuracion} meses
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="cama">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productos.filter(p => p.activo && p.tags?.includes('cama')).map((producto) => {
                        const pagoMensual = Math.round(producto.precioUsd / producto.tiempoDuracion);
                        return (
                          <div key={producto.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                              {producto.tags && producto.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {producto.tags.map((tag, index) => (
                                    <Badge key={index} className={`text-xs border ${getTagColor(tag)}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{producto.descripcion}</p>

                            <div className="space-y-3 mb-4">
                              <SimplePriceDisplay vesPrice={producto.precioVes} usdPrice={producto.precioUsd} />
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Duración del plan:</span>
                                <span className="font-semibold text-purple-600">{producto.tiempoDuracion} meses</span>
                              </div>
                            </div>

                            <Button
                              className="w-full bg-green-600 hover:bg-green-700"
                              onClick={() => handleProductSelect(producto)}
                            >
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
      </div>

      {/* Currency Selection Modal */}
      <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar Moneda de Pago</DialogTitle>
            <DialogDescription>
              ¿En qué moneda deseas realizar los pagos para {selectedProduct?.nombre}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => handleCurrencySelect('VES')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Pagar en Bolívares (VES)
            </Button>
            <Button
              onClick={() => handleCurrencySelect('USD')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Pagar en Dólares (USD)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-green-800">
              <CheckCircle className="h-6 w-6 text-green-600" />
              ¡Éxito!
            </DialogTitle>
            <DialogDescription className="text-center">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
