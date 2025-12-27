import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GroupStatusBadge } from '@/components/atoms';
import { GroupAdminDetails } from '@/lib/types';
import { Users, DollarSign, Package, Calendar, User, CreditCard } from 'lucide-react';

/**
 * Organism: Group Detail View
 * Comprehensive view of group details including members, contributions, and deliveries
 */
interface GroupDetailViewProps {
  /** Group admin details data */
  groupDetails: GroupAdminDetails;
  /** Function to close the detail view */
  onClose: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({
  groupDetails,
  onClose,
}) => {
  const { group, members, contributions, deliveries, stats } = groupDetails;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {group.nombre}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Grupo #{group.id} • {group.duracionMeses} meses
          </p>
        </div>
        <GroupStatusBadge status={group.estado} />
      </div>

      {/* Basic Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Contribuciones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContributions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingContributions} pendientes • {stats.confirmedContributions} confirmadas
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

      {/* Group Timeline */}
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
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Miembros del Grupo ({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay miembros en este grupo
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.user?.nombre} {member.user?.apellido}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.user?.correoElectronico}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      Posición {member.posicion || 'No asignada'}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {member.monedaPago}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contributions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Contribuciones ({contributions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contributions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay contribuciones registradas
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {contributions.map((contribution) => (
                <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {contribution.user?.nombre} {contribution.user?.apellido}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contribution.periodo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(contribution.monto, contribution.moneda)}
                    </p>
                    <Badge
                      variant={contribution.estado === 'CONFIRMADO' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {contribution.estado === 'CONFIRMADO' ? 'Confirmada' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deliveries Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Entregas ({deliveries.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No hay entregas registradas
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {delivery.user?.nombre} {delivery.user?.apellido}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {delivery.productName} - Mes {delivery.mesEntrega}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(delivery.productValue, 'USD')}
                    </p>
                    <Badge
                      variant={delivery.estado === 'ENTREGADO' ? 'default' : 'secondary'}
                      className="mt-1"
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
    </div>
  );
};
