
import React, { useState, useCallback } from 'react';
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
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Users, Package, Calendar, TrendingUp, MapPin, Clock, CheckCircle, AlertCircle, Menu, Home, ShoppingCart, DollarSign, Search, Filter, X, Shuffle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGroupRealtime, DrawMessage } from '@/hooks/useGroupRealtime';
import { motion } from 'framer-motion';
import { Confetti } from '@/components/ui/confetti';

// This component handles the real-time connection for a single group and
// surfaces events. It does not render any UI itself.
const GroupRealtimeHandler = ({
  groupId,
  onDrawStarted,
}: {
  groupId: number;
  onDrawStarted: (message: DrawMessage) => void;
}) => {
  const { lastMessage } = useGroupRealtime(groupId);

  React.useEffect(() => {
    if (lastMessage?.type === 'DRAW_STARTED') {
      onDrawStarted(lastMessage);
    }
  }, [lastMessage, onDrawStarted]);

  return null; // Headless component
};


const UserDashboard = () => {
  // Animation component for the draw
  const DrawAnimation = ({ data, onComplete }: { data: DrawMessage, onComplete?: () => void }) => {
    const [revealedPositions, setRevealedPositions] = React.useState<number[]>([]);
    const [animationCompleted, setAnimationCompleted] = React.useState(false);
    const [showConfetti, setShowConfetti] = React.useState(false);
    const [onCompleteCalled, setOnCompleteCalled] = React.useState(false);
    const timeoutsRef = React.useRef<NodeJS.Timeout[]>([]);
    const animationStartedRef = React.useRef(false);

    React.useEffect(() => {
      if (!data || animationCompleted || animationStartedRef.current) return;

      animationStartedRef.current = true;

      // Clear any existing timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];

      // Schedule each position reveal based on backend delays
      data.animationSequence.forEach((item, index) => {
        const timeout = setTimeout(() => {
          setRevealedPositions(prev => [...prev, item.position]);

          // Check if this is the last position
          if (index === data.animationSequence.length - 1) {
            setAnimationCompleted(true);
            setShowConfetti(true);
            // Confeti duration is handled by the Confetti component itself (6 seconds)
          }
        }, item.delay);

        timeoutsRef.current.push(timeout);
      });

      return () => {
        timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        timeoutsRef.current = [];
        animationStartedRef.current = false; // Reset for next animation
      };
    }, [data, animationCompleted]);

    // Call onComplete when animation completes (only once)
    React.useEffect(() => {
      if (animationCompleted && !onCompleteCalled) {
        setOnCompleteCalled(true);
        onComplete?.();
      }
    }, [animationCompleted, onComplete, onCompleteCalled]);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            ¡Sorteo de Posiciones Iniciado!
          </h3>
          <p className="text-sm text-gray-600">
            Las posiciones se están asignando en tiempo real
          </p>
        </div>

        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.finalPositions.map((pos, index) => (
            <motion.div
              key={pos.userId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: revealedPositions.includes(index + 1) ? 1 : 0.3,
                scale: revealedPositions.includes(index + 1) ? 1 : 0.8
              }}
              transition={{ duration: 0.3 }}
              className={`p-2 rounded-md border ${
                revealedPositions.includes(index + 1)
                  ? 'border-green-400 bg-green-50 shadow-sm'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-full flex items-center justify-center font-bold text-sm text-white ${
                    revealedPositions.includes(index + 1) ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px'
                  }}
                >
                  {pos.position}
                </div>
                <span className={`text-sm truncate ${
                  revealedPositions.includes(index + 1) ? 'text-gray-900 font-medium' : 'text-gray-500'
                }`}>
                  {revealedPositions.includes(index + 1) ? pos.name : '???'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {showConfetti && <Confetti intensity="extreme" duration={8000} />}
      </div>
    );
  };
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

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentPeriod, setSelectedPaymentPeriod] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'VES' | 'USD'>('VES');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  // Filters for mobile-first UX
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');

  // Real-time draw state
  const [showDrawDialog, setShowDrawDialog] = useState(false);
  const [drawData, setDrawData] = useState<DrawMessage | null>(null);

  // Find user's group memberships
  const myUserGroups = userGroups.filter(ug => ug.userId === user?.id);
  const myGroups = grupos.filter(g => myUserGroups.some(ug => ug.groupId === g.id));
  const myContributions = contributions.filter(c => c.userId === user?.id);
  const myDeliveries = deliveries.filter(d => d.userId === user?.id);

  // Define the callback for when a draw starts
  const handleDrawStarted = useCallback((message: DrawMessage) => {
    setDrawData(message);
    setShowDrawDialog(true);
  }, []);

  // Handle draw animation completion
  const handleDrawComplete = () => {
    setShowDrawDialog(false);
    setDrawData(null);
    refreshData(); // Refresh data to show updated positions
  };

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
    ? new Date(new Date(currentGroup.fechaInicio).getTime() + monthsUntilDelivery * 30 * 24 * 60 * 60 * 1000)
    : null;

  const hasGroups = myUserGroups.length > 0;
  const hasAvailableGroups = grupos.length > 0; // Grupos disponibles para unirse

  const isGroupInStandby = currentGroup?.estado === 'SIN_COMPLETAR';

  // Filter and sort products for mobile-first UX
  const filteredProducts = productos.filter(product => {
    if (!product.activo) return false;

    // Search filter
    const matchesSearch = searchTerm === '' ||
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    // Duration filter
    const matchesDuration = selectedDuration === null || product.tiempoDuracion === selectedDuration;

    // Tags filter
    const matchesTags = selectedTags.length === 0 ||
      (product.tags && selectedTags.every(selectedTag => product.tags?.includes(selectedTag)));

    return matchesSearch && matchesDuration && matchesTags;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.precioUsd - b.precioUsd;
      case 'price-high':
        return b.precioUsd - a.precioUsd;
      case 'newest':
        return b.id - a.id; // Assuming higher ID means newer
      case 'popular':
      default:
        return 0; // Keep original order for popular
    }
  });

  // Get unique durations and tags for filters
  const availableDurations = [...new Set(productos.filter(p => p.activo).map(p => p.tiempoDuracion))].sort((a, b) => a - b);
  const availableTags = [...new Set(productos.filter(p => p.activo && p.tags).flatMap(p => p.tags || []))].sort();

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDuration(null);
    setSelectedTags([]);
    setSortBy('popular');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleProductSelect = (producto: any) => {
    setSelectedProduct(producto);
    setShowCurrencyModal(true);
  };

  const handleCurrencySelect = async (currency: 'VES' | 'USD') => {
    if (!selectedProduct || !user) return;



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

  const handleSubmitPaymentRequest = async () => {
    if (!currentGroup || !user) return;

    setIsSubmittingPayment(true);

    try {
      const myUserGroup = myUserGroups.find(ug => ug.groupId === currentGroup?.id);
      const selectedProduct = productos.find(p => p.nombre === myUserGroup?.productoSeleccionado);

      if (!selectedProduct || !myUserGroup) {
        alert('Error: No se pudo encontrar la información del producto');
        return;
      }

      const monthlyAmount = myUserGroup.monedaPago === 'USD' ? selectedProduct.precioUsd : selectedProduct.precioVes;

      // Prepare payment data
      const paymentData = {
        groupId: currentGroup.id,
        periodo: selectedPaymentPeriod,
        monto: monthlyAmount,
        moneda: myUserGroup.monedaPago as 'VES' | 'USD',
        metodoPago: paymentMethod || 'Efectivo',
        referenciaPago: paymentReference || undefined,
        comprobantePago: undefined // For now, we'll implement file upload later
      };

      const response = await apiClient.createPaymentRequest(paymentData);

      if (response.success) {
        setSuccessMessage('¡Solicitud de pago enviada exitosamente! El administrador la revisará pronto.');
        setShowSuccessDialog(true);
        setShowPaymentModal(false);

        // Reset form
        setPaymentMethod('');
        setPaymentReference('');
        setPaymentReceipt(null);
        setSelectedPaymentPeriod('');

        // Refresh data to show the new request
        await refreshData();
      } else {
        alert('Error al enviar la solicitud: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error submitting payment request:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Websocket handlers - these don't render anything */}
      {myGroups.map(group => (
        <GroupRealtimeHandler
          key={group.id}
          groupId={group.id}
          onDrawStarted={handleDrawStarted}
        />
      ))}
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
                    <CardTitle className="text-sm font-medium">Valor Mensual</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(() => {
                        const myUserGroup = myUserGroups.find(ug => ug.groupId === currentGroup?.id);
                        const selectedProduct = productos.find(p => p.nombre === myUserGroup?.productoSeleccionado);
                        const price = selectedProduct ? (myUserGroup?.monedaPago === 'USD' ? selectedProduct.precioUsd : selectedProduct.precioVes) : 0;
                        return price.toLocaleString();
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pago mensual
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Moneda de Pago</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(() => {
                        const myUserGroup = myUserGroups.find(ug => ug.groupId === currentGroup?.id);
                        return myUserGroup?.monedaPago === 'USD' ? 'Dólares' : 'Bolívares';
                      })()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Opción seleccionada
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

              {/* Sección de Pagos - Solo mostrar si el grupo está activo */}
              {currentGroup && !isGroupInStandby && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Realizar Pago</CardTitle>
                    <CardDescription>
                      Realiza tu contribución mensual al grupo de ahorro
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Información del pago */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                  ${(() => {
                                    const myUserGroup = myUserGroups.find(ug => ug.groupId === currentGroup?.id);
                                    const selectedProduct = productos.find(p => p.nombre === myUserGroup?.productoSeleccionado);
                                    const monthlyPrice = selectedProduct ? (myUserGroup?.monedaPago === 'USD' ? selectedProduct.precioUsd : selectedProduct.precioVes) : 0;
                                    return monthlyPrice.toFixed(0);
                                  })()}
                                </div>
                                <div className="text-sm text-gray-600">Pago mensual</div>
                              </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {(() => {
                                const myUserGroup = myUserGroups.find(ug => ug.groupId === currentGroup?.id);
                                return myUserGroup?.monedaPago === 'USD' ? 'USD' : 'VES';
                              })()}
                            </div>
                            <div className="text-sm text-gray-600">Moneda de pago</div>
                          </div>
                        </div>
                      </div>

                      {/* Estado de pagos del mes actual */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Estado del mes actual</h4>
                        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              currentGroupContributions.some(c => c.estado === 'CONFIRMADO' && c.periodo === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
                                ? 'bg-green-500'
                                : currentGroupContributions.some(c => c.estado === 'PENDIENTE' && c.periodo === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-300'
                            }`}></div>
                            <div>
                              <p className="font-medium">
                                Mes {currentGroup?.turnoActual || 0} - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {currentGroupContributions.some(c => c.estado === 'CONFIRMADO' && c.periodo === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
                                  ? 'Pago realizado'
                                  : currentGroupContributions.some(c => c.estado === 'PENDIENTE' && c.periodo === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
                                    ? 'Pago pendiente de confirmación'
                                    : 'Pago requerido'
                                }
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const currentPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                              setSelectedPaymentPeriod(currentPeriod);
                              setShowPaymentModal(true);
                            }}
                            disabled={currentGroupContributions.some(c =>
                              (c.estado === 'CONFIRMADO' || c.estado === 'PENDIENTE') &&
                              c.periodo === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
                            )}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            {currentGroupContributions.some(c => c.estado === 'CONFIRMADO' && c.periodo === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`)
                              ? 'Pagado'
                              : 'Realizar Pago'
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                  {currentGroupContributions.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No hay contribuciones para este grupo aún</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentGroupContributions.slice().reverse().map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className={`h-5 w-5 ${contribution.estado === 'CONFIRMADO' ? 'text-green-500' : 'text-yellow-500'}`} />
                            <div>
                              <p className="font-medium">{contribution.periodo}</p>
                              <p className="text-sm text-gray-600">
                                {contribution.fechaPago ? new Date(contribution.fechaPago).toLocaleDateString('es-ES') : 'Pendiente'}
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
            /* Productos Disponibles - Mobile-First Design */
            <div className="space-y-4">
              {/* Search and Filters - Mobile First */}
              <Card className="sticky top-0 z-10 shadow-sm">
                <CardContent className="p-4">
                  {/* Search Bar and Filter Button in one line */}
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4"
                      />
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="shrink-0">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtros
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
                        <SheetHeader>
                          <SheetTitle>Filtros</SheetTitle>
                        </SheetHeader>
                        <div className="py-6 space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Duración del plan</label>
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                variant={selectedDuration === null ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedDuration(null)}
                              >
                                Todos
                              </Button>
                              {availableDurations.map(duration => (
                                <Button
                                  key={duration}
                                  variant={selectedDuration === duration ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedDuration(duration)}
                                >
                                  {duration}m
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Categorías</label>
                            <div className="grid grid-cols-2 gap-2">
                              {availableTags.map((tag) => (
                                <Button
                                  key={tag}
                                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleTag(tag)}
                                  className={`text-xs h-8 ${selectedTags.includes(tag) ? "" : getTagColor(tag)}`}
                                >
                                  {tag}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant={sortBy === 'popular' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSortBy('popular')}
                              >
                                Popular
                              </Button>
                              <Button
                                variant={sortBy === 'price-low' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSortBy('price-low')}
                              >
                                Precio Menor
                              </Button>
                              <Button
                                variant={sortBy === 'price-high' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSortBy('price-high')}
                              >
                                Precio Mayor
                              </Button>
                              <Button
                                variant={sortBy === 'newest' ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSortBy('newest')}
                              >
                                Nuevo
                              </Button>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="w-full"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Limpiar Filtros
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>

                  {/* Active Filters Display */}
                  {(searchTerm || selectedDuration || selectedTags.length > 0) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                      <span className="text-sm text-gray-600">Filtros activos:</span>
                      {searchTerm && (
                        <Badge variant="secondary" className="text-xs">
                          "{searchTerm}"
                          <button
                            onClick={() => setSearchTerm('')}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {selectedDuration && (
                        <Badge variant="secondary" className="text-xs">
                          {selectedDuration} meses
                          <button
                            onClick={() => setSelectedDuration(null)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {selectedTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            onClick={() => toggleTag(tag)}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs h-6 px-2 ml-auto"
                      >
                        Limpiar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Products Grid - Mobile Optimized */}
              <div className="space-y-4">
                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                      <p className="text-gray-600 mb-4">
                        Intenta ajustar tus filtros de búsqueda
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Limpiar filtros
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Results count */}
                    <div className="flex items-center justify-between text-sm text-gray-600 px-1">
                      <span>{filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Products */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredProducts.map((producto) => (
                        <Card key={producto.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            {/* Mobile-first layout */}
                            <div className="space-y-3">
                              {/* Header with title and badges */}
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-semibold text-lg text-gray-900 leading-tight flex-1">
                                  {producto.nombre}
                                </h3>
                                {producto.tags && producto.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 shrink-0">
                                    {producto.tags.slice(0, 2).map((tag, index) => (
                                      <Badge key={index} className={`text-xs ${getTagColor(tag)}`}>
                                        {tag}
                                      </Badge>
                                    ))}
                                    {producto.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{producto.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Description - hidden on very small screens */}
                              <p className="text-gray-600 text-sm leading-relaxed hidden sm:block">
                                {producto.descripcion}
                              </p>

                              {/* Price and Duration - Mobile optimized */}
                              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <SimplePriceDisplay
                                  vesPrice={producto.precioVes}
                                  usdPrice={producto.precioUsd}
                                />
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-700">Plan:</span>
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                    {producto.tiempoDuracion} meses
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-700">Pago mensual:</span>
                                  <span className="font-semibold text-green-600">
                                    ${(producto.precioUsd / producto.tiempoDuracion).toFixed(0)} USD
                                  </span>
                                </div>
                              </div>

                              {/* Action Button */}
                              <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
                                onClick={() => handleProductSelect(producto)}
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Unirme al Grupo
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
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

      {/* Draw Animation Dialog */}
      <Dialog open={showDrawDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center">¡Sorteo de Posiciones!</DialogTitle>
          </DialogHeader>
          {drawData && <DrawAnimation data={drawData} onComplete={handleDrawComplete} />}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Realizar Pago Mensual</DialogTitle>
            <DialogDescription>
              Selecciona la moneda en la que deseas realizar tu pago mensual para el período {selectedPaymentPeriod}
            </DialogDescription>
          </DialogHeader>

          {/* Payment Information */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Grupo:</span>
                <span className="text-sm">{currentGroup?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Período:</span>
                <span className="text-sm">{selectedPaymentPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Monto mensual:</span>
                <span className="text-sm font-bold">
                  ${(() => {
                    const myUserGroup = myUserGroups.find(ug => ug.groupId === currentGroup?.id);
                    const selectedProduct = productos.find(p => p.nombre === myUserGroup?.productoSeleccionado);
                    const monthlyPrice = selectedProduct ? (myUserGroup?.monedaPago === 'USD' ? selectedProduct.precioUsd : selectedProduct.precioVes) : 0;
                    return monthlyPrice.toFixed(0);
                  })()} {(() => {
                    const myUserGroup = myUserGroups.find(ug => ug.groupId === currentGroup?.id);
                    return myUserGroup?.monedaPago === 'USD' ? 'USD' : 'VES';
                  })()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={async () => {
                setSelectedCurrency('VES');
                await handleSubmitPaymentRequest();
              }}
              disabled={isSubmittingPayment}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmittingPayment && selectedCurrency === 'VES' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
              Pagar en Bolívares (VES)
            </Button>
            <Button
              onClick={async () => {
                setSelectedCurrency('USD');
                await handleSubmitPaymentRequest();
              }}
              disabled={isSubmittingPayment}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSubmittingPayment && selectedCurrency === 'USD' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <DollarSign className="h-4 w-4 mr-2" />
              )}
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
