import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { Grupo, UserGroup, Contribution, Delivery } from "../../../../shared/types";

interface GroupDetailsViewProps {
  groupId: number;
  onBack: () => void;
}

interface GroupData {
  group: Grupo;
  members: UserGroup[];
  contributions: Contribution[];
  deliveries: Delivery[];
  stats: {
    totalMembers: number;
    totalContributions: number;
    pendingContributions: number;
    confirmedContributions: number;
    totalDeliveries: number;
    completedDeliveries: number;
  };
}

const GroupDetailsView: React.FC<GroupDetailsViewProps> = ({
  groupId,
  onBack,
}) => {
  const [data, setData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getGroupAdminDetails(groupId);

      if (response.success) {
        setData(response.data);
      } else {
        toast({
          title: "Error",
          description:
            response.message || "No se pudieron cargar los detalles del grupo",
          variant: "destructive",
        });
        onBack();
      }
    } catch (error) {
      console.error("Error loading group details:", error);
      toast({
        title: "Error",
        description: "Error al cargar los detalles del grupo",
        variant: "destructive",
      });
      onBack();
    } finally {
      setLoading(false);
    }
  }, [groupId, onBack]);

  useEffect(() => {
    loadGroupDetails();
  }, [loadGroupDetails]);

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      SIN_COMPLETAR: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      LLENO: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      EN_MARCHA: {
        variant: "default" as const,
        icon: TrendingUp,
        color: "text-blue-600",
      },
      COMPLETADO: {
        variant: "outline" as const,
        icon: CheckCircle,
        color: "text-gray-600",
      },
    };

    const config = statusConfig[estado] || statusConfig["SIN_COMPLETAR"];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {estado.replace("_", " ")}
      </Badge>
    );
  };

  const getUserStatusBadge = (estado: string) => {
    const statusConfig = {
      PENDIENTE: { variant: "secondary" as const, icon: Clock },
      APROBADO: { variant: "default" as const, icon: UserCheck },
      RECHAZADO: { variant: "destructive" as const, icon: UserX },
      SUSPENDIDO: { variant: "outline" as const, icon: AlertCircle },
      REACTIVADO: { variant: "default" as const, icon: UserCheck },
    };

    const config = statusConfig[estado] || statusConfig["PENDIENTE"];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {estado}
      </Badge>
    );
  };

  const getContributionStatusBadge = (estado: string) => {
    const statusConfig = {
      PENDIENTE: { variant: "secondary" as const },
      CONFIRMADO: { variant: "default" as const },
      RECHAZADO: { variant: "destructive" as const },
    };

    return (
      <Badge variant={statusConfig[estado]?.variant || "secondary"}>
        {estado}
      </Badge>
    );
  };

  const getDeliveryStatusBadge = (estado: string) => {
    const statusConfig = {
      PENDIENTE: { variant: "secondary" as const },
      ENTREGADO: { variant: "default" as const },
    };

    return (
      <Badge variant={statusConfig[estado]?.variant || "secondary"}>
        {estado}
      </Badge>
    );
  };

  const getProgressValue = () => {
    if (!data) return 0;
    if (data.group.estado === "COMPLETADO") return 100;
    if (data.group.estado === "EN_MARCHA") {
      return Math.min(
        (data.group.turnoActual / data.group.duracionMeses) * 100,
        100
      );
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Cargando detalles del grupo...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No se pudieron cargar los detalles del grupo
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {data.group.nombre}
          </h1>
          <p className="text-gray-600 mt-1">
            ID: {data.group.id} • {data.group.duracionMeses} meses de duración
          </p>
        </div>
        {getStatusBadge(data.group.estado)}
      </div>

      {/* Group Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{data.stats.totalMembers}</p>
                <p className="text-sm text-gray-600">Miembros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data.stats.totalContributions}
                </p>
                <p className="text-sm text-gray-600">Contribuciones</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data.stats.totalDeliveries}
                </p>
                <p className="text-sm text-gray-600">Entregas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{data.group.turnoActual}</p>
                <p className="text-sm text-gray-600">Mes Actual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Grupo</CardTitle>
          <CardDescription>
            Estado actual:{" "}
            {data.group.estado === "EN_MARCHA"
              ? `${data.group.turnoActual}/${data.group.duracionMeses} meses completados`
              : data.group.estado === "COMPLETADO"
              ? "Grupo completado"
              : "Esperando inicio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={getProgressValue()} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>
              Inicio:{" "}
              {data.group.fechaInicio
                ? new Date(data.group.fechaInicio).toLocaleDateString("es-ES")
                : "No iniciado"}
            </span>
            <span>{Math.round(getProgressValue())}% completado</span>
            <span>
              Fin:{" "}
              {data.group.fechaFinal
                ? new Date(data.group.fechaFinal).toLocaleDateString("es-ES")
                : "No definido"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">
            Miembros ({data.stats.totalMembers})
          </TabsTrigger>
          <TabsTrigger value="contributions">
            Contribuciones ({data.stats.totalContributions})
          </TabsTrigger>
          <TabsTrigger value="deliveries">
            Entregas ({data.stats.totalDeliveries})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Miembros del Grupo</CardTitle>
              <CardDescription>
                Lista completa de participantes ordenados por posición
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posición</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Moneda</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <span className="font-medium">#{member.posicion}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {member.user.nombre} {member.user.apellido}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.user.correoElectronico}
                          </p>
                          <p className="text-xs text-gray-400">
                            Cédula: {member.user.cedula}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{member.productoSeleccionado}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{member.monedaPago}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contributions" className="space-y-4">
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-lg font-bold">
                      {data.stats.pendingContributions}
                    </p>
                    <p className="text-sm text-gray-600">Pendientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-lg font-bold">
                      {data.stats.confirmedContributions}
                    </p>
                    <p className="text-sm text-gray-600">Confirmadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-lg font-bold">
                      {data.contributions
                        .reduce(
                          (sum, c) =>
                            sum + (c.estado === "CONFIRMADO" ? c.monto : 0),
                          0
                        )
                        .toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Total Confirmado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-lg font-bold">
                      {data.stats.totalMembers}
                    </p>
                    <p className="text-sm text-gray-600">Miembros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista Principal: Estado de Contribuciones por Miembro */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Contribuciones por Miembro</CardTitle>
              <CardDescription>
                Resumen de pagos de cada participante del grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Estado de Pagos</TableHead>
                    <TableHead>Total Pagado</TableHead>
                    <TableHead>Pagos Confirmados</TableHead>
                    <TableHead>Pagos Pendientes</TableHead>
                    <TableHead>Último Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.members.map((member) => {
                    // Filtrar contribuciones de este miembro
                    const memberContributions = data.contributions.filter(
                      (c) => c.userId === member.user.id
                    );
                    const confirmedPayments = memberContributions.filter(
                      (c) => c.estado === "CONFIRMADO"
                    );
                    const pendingPayments = memberContributions.filter(
                      (c) => c.estado === "PENDIENTE"
                    );
                    const totalPaid = confirmedPayments.reduce(
                      (sum, c) => sum + c.monto,
                      0
                    );
                    const lastPayment = confirmedPayments
                      .filter((c) => c.fechaPago)
                      .sort(
                        (a, b) =>
                          new Date(b.fechaPago!).getTime() -
                          new Date(a.fechaPago!).getTime()
                      )[0];

                    // Calcular progreso esperado (total de meses del grupo)
                    const expectedPayments = data.group.duracionMeses;

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {member.user.nombre[0]}
                                {member.user.apellido[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {member.user.nombre} {member.user.apellido}
                              </p>
                              <p className="text-xs text-gray-500">
                                {member.user.correoElectronico}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            #{member.posicion}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={
                                  (confirmedPayments.length /
                                    expectedPayments) *
                                  100
                                }
                                className="h-2 w-16"
                              />
                              <span className="text-sm font-medium">
                                {confirmedPayments.length}/{expectedPayments}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {confirmedPayments.length === expectedPayments
                                ? "Al día"
                                : confirmedPayments.length > expectedPayments
                                ? "Adelantado"
                                : "Atrasado"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {totalPaid.toFixed(2)} {member.monedaPago}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                          >
                            {confirmedPayments.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {pendingPayments.length}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {lastPayment ? (
                              <div>
                                <p className="font-medium">
                                  {lastPayment.monto.toFixed(2)}{" "}
                                  {lastPayment.moneda}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    lastPayment.fechaPago!
                                  ).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sin pagos</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-lg font-bold">
                      {data.stats.totalDeliveries}
                    </p>
                    <p className="text-sm text-gray-600">Total Entregas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-lg font-bold">
                      {data.stats.completedDeliveries}
                    </p>
                    <p className="text-sm text-gray-600">Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Entregas</CardTitle>
              <CardDescription>
                Productos entregados a los miembros del grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Mes de Entrega</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de Entrega</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {delivery.user.nombre[0]}
                              {delivery.user.apellido[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {delivery.user.nombre} {delivery.user.apellido}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {delivery.productName}
                      </TableCell>
                      <TableCell>{delivery.productValue}</TableCell>
                      <TableCell>{delivery.mesEntrega}</TableCell>
                      <TableCell>
                        {getDeliveryStatusBadge(delivery.estado)}
                      </TableCell>
                      <TableCell>
                        {new Date(delivery.fechaEntrega).toLocaleDateString(
                          "es-ES"
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {delivery.notas || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GroupDetailsView;
