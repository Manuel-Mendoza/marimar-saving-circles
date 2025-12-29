import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { GroupStatusBadge } from '@/components/atoms';
import { GroupAdminDetails } from '@/lib/types';
import { Users, DollarSign, Package, Calendar, User, CreditCard, BarChart3, X } from 'lucide-react';

interface GroupDetailModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Datos detallados del grupo */
  groupDetails: GroupAdminDetails | null;
  /** Si está cargando */
  isLoading?: boolean;
  /** Función para avanzar mes del grupo */
  onAdvanceMonth?: (group: { id: number; nombre: string; estado: string }) => void;
  /** Estado de carga para acciones */
  actionLoading?: boolean;
}

/**
 * Organism: Group Detail Modal
 * Modal para mostrar detalles completos de un grupo
 */
export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  isOpen,
  onClose,
  groupDetails,
  isLoading = false,
  onAdvanceMonth,
  actionLoading = false,
}) => {
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);

  if (!isOpen) return null;

  if (!groupDetails && !isLoading) return null;

  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Cargando detalles del grupo...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!groupDetails) return null;

  const { group, members, contributions, deliveries, stats } = groupDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{group.nombre}</span>
              <GroupStatusBadge status={group.estado} />
            </div>
            <Badge variant="outline">Grupo #{group.id}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="resumen" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resumen" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="miembros" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Miembros ({members.length})
            </TabsTrigger>
            <TabsTrigger value="contribuciones" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Contribuciones ({contributions.length})
            </TabsTrigger>
            <TabsTrigger value="entregas" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Entregas ({deliveries.length})
            </TabsTrigger>
          </TabsList>

          {/* Resumen Tab */}
          <TabsContent value="resumen" className="space-y-6 mt-6">
            <ScrollArea className="max-h-[60vh] pr-4">
              {/* Basic Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contribuciones</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalMembers}</div>
                    <p className="text-xs text-muted-foreground">
                      de {group.duracionMeses} requeridos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progreso del Grupo</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {group.turnoActual} / {group.duracionMeses}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mes {group.turnoActual} de {group.duracionMeses} completado
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Entregas</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.completedDeliveries} completadas
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Group Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Información del Grupo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Fecha de Inicio
                      </label>
                      <p className="text-lg font-semibold">
                        {group.fechaInicio ? formatDate(group.fechaInicio) : 'No iniciado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Fecha de Finalización
                      </label>
                      <p className="text-lg font-semibold">
                        {group.fechaFinal ? formatDate(group.fechaFinal) : 'No finalizado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Turno Actual
                      </label>
                      <p className="text-lg font-semibold">
                        {group.turnoActual > 0 ? group.turnoActual : 'No iniciado'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Estado
                      </label>
                      <div className="mt-1">
                        <GroupStatusBadge status={group.estado} />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {group.estado === 'EN_MARCHA' && onAdvanceMonth && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Gestión del Grupo
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Avanzar al siguiente mes cuando todos los pagos estén confirmados
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            console.log('🔘 Botón "Avanzar Mes" presionado - abriendo diálogo');
                            setShowAdvanceConfirm(true);
                          }}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800 transition-colors"
                        >
                          {actionLoading ? 'Avanzando...' : 'Avanzar Mes'}
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Miembros Tab */}
          <TabsContent value="miembros" className="space-y-6 mt-6">
            <ScrollArea className="max-h-[60vh] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Miembros del Grupo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No hay miembros en este grupo
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {members.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {member.user?.nombre} {member.user?.apellido}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {member.user?.correoElectronico}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {group.fechaInicio ? (
                              <Badge variant="outline" className="text-xs px-2 py-1">
                                {member.posicion ? `#${member.posicion}` : '?'}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs px-2 py-1">
                                Sin pos.
                              </Badge>
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {member.monedaPago}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Contribuciones Tab */}
          <TabsContent value="contribuciones" className="space-y-6 mt-6">
            <ScrollArea className="max-h-[60vh] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Historial de Contribuciones</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pagos recientes realizados por los miembros del grupo
                  </p>
                </CardHeader>
                <CardContent>
                  {contributions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay contribuciones registradas
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Mostrar todas las contribuciones únicas por usuario y periodo */}
                      {contributions
                        .filter(c => c.fechaPago) // Solo pagos realizados
                        .sort((a, b) => {
                          // Ordenar por fecha descendente, luego por periodo descendente
                          const dateCompare =
                            new Date(b.fechaPago!).getTime() - new Date(a.fechaPago!).getTime();
                          if (dateCompare !== 0) return dateCompare;
                          return b.periodo.localeCompare(a.periodo);
                        })
                        // Eliminar duplicados por usuario + periodo (mantener el más reciente)
                        .filter(
                          (contribution, index, self) =>
                            index ===
                            self.findIndex(
                              c =>
                                c.userId === contribution.userId &&
                                c.periodo === contribution.periodo
                            )
                        )
                        .slice(0, 15) // Limitar a 15 para performance
                        .map((contribution, index) => {
                          const isRecent = index < 3; // Marcar los 3 más recientes
                          const daysSincePayment = contribution.fechaPago
                            ? Math.floor(
                                (new Date().getTime() -
                                  new Date(contribution.fechaPago).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : null;

                          return (
                            <div
                              key={contribution.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                isRecent
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isRecent
                                      ? 'bg-green-500 text-white'
                                      : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                  }`}
                                >
                                  {isRecent ? (
                                    <span className="text-xs font-bold">#{index + 1}</span>
                                  ) : (
                                    <DollarSign className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <p className="font-medium text-sm truncate">
                                      {contribution.user?.nombre} {contribution.user?.apellido}
                                    </p>
                                    {isRecent && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 border-green-300"
                                      >
                                        Reciente
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {contribution.periodo}
                                  </p>
                                  {contribution.fechaPago && (
                                    <p
                                      className={`text-xs truncate ${
                                        isRecent
                                          ? 'text-green-700 dark:text-green-300 font-medium'
                                          : 'text-gray-500 dark:text-gray-500'
                                      }`}
                                    >
                                      {formatDate(contribution.fechaPago)}
                                      {daysSincePayment !== null && daysSincePayment <= 7 && (
                                        <span className="ml-1">
                                          (
                                          {daysSincePayment === 0
                                            ? 'hoy'
                                            : daysSincePayment === 1
                                              ? 'ayer'
                                              : `${daysSincePayment} días`}
                                          )
                                        </span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <Badge
                                  variant={
                                    contribution.estado === 'CONFIRMADO' ? 'default' : 'secondary'
                                  }
                                  className="text-xs px-2 py-1"
                                >
                                  {contribution.estado === 'CONFIRMADO'
                                    ? 'Confirmada'
                                    : 'Pendiente'}
                                </Badge>
                                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                  {formatCurrency(contribution.monto, contribution.moneda)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* Entregas Tab */}
          <TabsContent value="entregas" className="space-y-6 mt-6">
            <ScrollArea className="max-h-[60vh] pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Historial de Entregas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deliveries.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No hay entregas registradas
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {deliveries.map(delivery => (
                        <div
                          key={delivery.id}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="font-medium text-base">
                                {delivery.user?.nombre} {delivery.user?.apellido}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {delivery.productName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                Mes {delivery.mesEntrega} • {formatDate(delivery.fechaEntrega)}
                              </p>
                              {delivery.notas && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Nota: {delivery.notas}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              {formatCurrency(delivery.productValue, 'USD')}
                            </p>
                            <Badge
                              variant={delivery.estado === 'ENTREGADO' ? 'default' : 'secondary'}
                              className="mt-2"
                            >
                              {delivery.estado === 'ENTREGADO' ? 'Entregado' : 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Confirmation Dialog for Advance Month */}
      <Dialog
        open={showAdvanceConfirm}
        onOpenChange={open => {
          console.log('🔄 Confirmation Dialog onOpenChange:', open);
          setShowAdvanceConfirm(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Avance de Mes</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que deseas avanzar al siguiente mes del grupo "{group.nombre}"?
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Esta acción:</p>
              <div className="text-sm text-muted-foreground space-y-1 ml-4">
                <div>• Verificará que todos los pagos estén confirmados</div>
                <div>• Creará automáticamente una entrega para el usuario correspondiente</div>
                <div>• Avanzará el turno del grupo al siguiente mes</div>
                <div>• Completará el grupo si llega al último mes</div>
              </div>
            </div>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              disabled={actionLoading}
              onClick={() => {
                console.log('❌ Cancelar presionado');
                setShowAdvanceConfirm(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                console.log('🎯 Confirmar Avance presionado');
                console.log('📤 onAdvanceMonth disponible:', !!onAdvanceMonth);
                console.log('📊 group data:', {
                  id: group.id,
                  nombre: group.nombre,
                  estado: group.estado,
                });
                console.log('🔄 Cerrando diálogo de confirmación...');
                setShowAdvanceConfirm(false);
                try {
                  console.log('📞 Llamando onAdvanceMonth...');
                  onAdvanceMonth?.({ id: group.id, nombre: group.nombre, estado: group.estado });
                  console.log('✅ onAdvanceMonth llamado exitosamente');
                } catch (error) {
                  console.error('❌ Error llamando onAdvanceMonth:', error);
                }
              }}
              disabled={actionLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {actionLoading ? 'Avanzando...' : 'Confirmar Avance'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
