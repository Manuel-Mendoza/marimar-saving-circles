import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppState } from "@/contexts/AppStateContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Package,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Eye,
  LayoutDashboard,
  Settings,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Trash,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PendingUser {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correoElectronico: string;
  tipo: "USUARIO" | "ADMINISTRADOR";
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "SUSPENDIDO" | "REACTIVADO";
  imagenCedula?: string;
  fechaRegistro: Date;
}

type ActiveView =
  | "dashboard"
  | "approvals"
  | "users"
  | "groups"
  | "products"
  | "reports";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { grupos, productos } = useAppState();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [processingUser, setProcessingUser] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [userToReject, setUserToReject] = useState<any>(null);
  const [reason, setReason] = useState("");

  // Cargar usuarios pendientes
  useEffect(() => {
    if (activeView === "approvals" || activeView === "dashboard") {
      fetchPendingUsers();
    }
  }, [activeView]);

  // Cargar todos los usuarios cuando se selecciona la vista de usuarios
  useEffect(() => {
    if (activeView === "users") {
      fetchAllUsers();
    }
  }, [activeView]);

  const fetchAllUsers = async () => {
    console.log('🔄 fetchAllUsers called - refreshing user data');
    setUsersLoading(true);
    try {
      const response = await apiClient.getAllUsers();
      console.log('🔄 fetchAllUsers response:', response);
      if (response.success && response.data) {
        const usersWithDates = response.data.users.map((user: any) => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
          ultimoAcceso: user.ultimoAcceso ? new Date(user.ultimoAcceso) : null,
          fechaAprobacion: user.fechaAprobacion
            ? new Date(user.fechaAprobacion)
            : null,
        }));
        console.log('🔄 fetchAllUsers setting users:', usersWithDates.length, 'users');
        console.log('🔄 User details:', usersWithDates.map(u => ({ id: u.id, nombre: u.nombre, estado: u.estado })));
        setAllUsers(usersWithDates);
      } else {
        console.log('🔄 fetchAllUsers failed or no data, clearing users');
        setAllUsers([]);
      }
    } catch (error) {
      console.error("🔄 Error cargando todos los usuarios:", error);
      setAllUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await apiClient.getPendingUsers();
      if (response.success && response.data) {
        const usersWithDates = response.data.users.map((user: any) => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
        }));
        setPendingUsers(usersWithDates);
      }
    } catch (error) {
      console.error("Error cargando usuarios pendientes:", error);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    const userExists = allUsers.some(u => u.id === userId) || pendingUsers.some(u => u.id === userId);
    if (!userExists) {
      toast({
        title: "Usuario no encontrado",
        description: "Este usuario ya no está disponible para procesamiento.",
        variant: "destructive",
      });
      fetchPendingUsers();
      fetchAllUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.approveUser(userId);
      if (response.success) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        setAllUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, estado: "APROBADO", fechaAprobacion: new Date() }
              : user
          )
        );
        toast({
          title: "Usuario aprobado",
          description: "El usuario ha sido aprobado exitosamente y ahora puede acceder al sistema.",
        });
      }
    } catch (error: any) {
      console.error("Error aprobando usuario:", error);
      const errorMessage = error.message?.includes("ya procesado") || error.message?.includes("no encontrado")
        ? "Este usuario ya ha sido procesado anteriormente o no existe."
        : error.message || "No se pudo aprobar al usuario. Inténtalo de nuevo.";

      fetchPendingUsers();
      fetchAllUsers();

      toast({
        title: "Error al aprobar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleRejectUser = async (userId: number) => {
    const userExists = allUsers.some(u => u.id === userId) || pendingUsers.some(u => u.id === userId);

    if (!userExists) {
      toast({
        title: "Usuario no encontrado",
        description: "Este usuario ya no está disponible para procesamiento.",
        variant: "destructive",
      });
      fetchPendingUsers();
      fetchAllUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.rejectUser(userId);
      if (response.success) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
        setAllUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, estado: "RECHAZADO", fechaAprobacion: new Date() }
              : user
          )
        );
        toast({
          title: "Usuario rechazado",
          description: "El usuario ha sido rechazado y no podrá acceder al sistema.",
        });
      }
    } catch (error: any) {
      console.error("Error rechazando usuario:", error);
      const errorMessage = error.message?.includes("ya procesado") || error.message?.includes("no encontrado")
        ? "Este usuario ya ha sido procesado anteriormente o no existe."
        : error.message || "No se pudo rechazar al usuario. Inténtalo de nuevo.";

      fetchPendingUsers();
      fetchAllUsers();

      toast({
        title: "Error al rechazar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    const userExists = allUsers.some(u => u.id === userId);
    const userData = allUsers.find(u => u.id === userId);

    console.log('handleSuspendUser Debug:', {
      userId,
      userExists,
      userData: userData ? {
        id: userData.id,
        nombre: userData.nombre,
        apellido: userData.apellido,
        estado: userData.estado,
        tipo: userData.tipo
      } : null,
      allUsersCount: allUsers.length,
      allUsersIds: allUsers.map(u => ({ id: u.id, estado: u.estado, nombre: u.nombre }))
    });

    if (!userExists) {
      toast({
        title: "Usuario no encontrado",
        description: "Este usuario ya no está disponible para procesamiento.",
        variant: "destructive",
      });
      fetchAllUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.suspendUser(userId);
      if (response.success) {
        setAllUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, estado: "SUSPENDIDO", fechaAprobacion: new Date() }
              : user
          )
        );
        toast({
          title: "Usuario suspendido",
          description: "El usuario ha sido suspendido y no podrá acceder al sistema.",
        });
      }
    } catch (error: any) {
      console.error("Error suspendiendo usuario:", error);
      const errorMessage = error.message?.includes("ya procesado") || error.message?.includes("no encontrado")
        ? "Este usuario ya no existe en el sistema. Los datos se actualizarán automáticamente."
        : error.message || "No se pudo suspender al usuario. Inténtalo de nuevo.";

      console.warn("🔄 Desincronización detectada - forzando recarga completa de datos");
      fetchAllUsers();
      fetchPendingUsers();

      toast({
        title: "Datos desactualizados",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleReactivateUser = async (userId: number) => {
    const userExists = allUsers.some(u => u.id === userId);

    if (!userExists) {
      toast({
        title: "Usuario no encontrado",
        description: "Este usuario ya no está disponible para procesamiento.",
        variant: "destructive",
      });
      fetchAllUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.reactivateUser(userId);
      if (response.success) {
        setAllUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, estado: "REACTIVADO", fechaAprobacion: new Date() }
              : user
          )
        );
        toast({
          title: "Usuario reactivado",
          description: "El usuario ha sido reactivado y ahora puede acceder al sistema.",
        });
      }
    } catch (error: any) {
      console.error("Error reactivando usuario:", error);
      const errorMessage = error.message?.includes("ya procesado") || error.message?.includes("no encontrado")
        ? "Este usuario ya ha sido procesado anteriormente o no existe."
        : error.message || "No se pudo reactivar al usuario. Inténtalo de nuevo.";

      fetchAllUsers();

      toast({
        title: "Error al reactivar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setProcessingUser(userToDelete.id);
    try {
      const response = await apiClient.deleteUser(userToDelete.id);
      if (response.success) {
        setAllUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
        setUserToDelete(null);
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado permanentemente del sistema.",
        });
      }
    } catch (error: any) {
      console.error("Error eliminando usuario:", error);
      const errorMessage = error.message?.includes("no encontrado")
        ? "Este usuario ya no existe."
        : error.message || "No se pudo eliminar al usuario. Inténtalo de nuevo.";

      fetchAllUsers();

      toast({
        title: "Error al eliminar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const openDeleteDialog = (user: any) => {
    setUserToDelete(user);
  };

  const closeDeleteDialog = () => {
    setUserToDelete(null);
    setReason("");
  };

  const openRejectDialog = (user: any) => {
    setUserToReject(user);
    setReason("");
  };

  const closeRejectDialog = () => {
    setUserToReject(null);
    setReason("");
  };

  const handleRejectUserWithReason = async () => {
    if (!userToReject || !reason.trim()) return;

    setProcessingUser(userToReject.id);
    try {
      const response = await apiClient.rejectUser(userToReject.id, reason.trim());
      if (response.success) {
        setPendingUsers((prev) => prev.filter((u) => u.id !== userToReject.id));
        setAllUsers((prev) =>
          prev.map((user) =>
            user.id === userToReject.id
              ? { ...user, estado: "RECHAZADO", fechaAprobacion: new Date() }
              : user
          )
        );
        closeRejectDialog();
        toast({
          title: "Usuario rechazado",
          description: "El usuario ha sido rechazado y no podrá acceder al sistema.",
        });
      }
    } catch (error: any) {
      console.error("Error rechazando usuario:", error);
      const errorMessage = error.message?.includes("ya procesado") || error.message?.includes("no encontrado")
        ? "Este usuario ya ha sido procesado anteriormente o no existe."
        : error.message || "No se pudo rechazar al usuario. Inténtalo de nuevo.";

      fetchPendingUsers();
      fetchAllUsers();

      toast({
        title: "Error al rechazar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleDeleteUserWithReason = async () => {
    if (!userToDelete || !reason.trim()) return;

    setProcessingUser(userToDelete.id);
    try {
      const response = await apiClient.deleteUser(userToDelete.id, reason.trim());
      if (response.success) {
        setAllUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
        closeDeleteDialog();
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado permanentemente del sistema.",
        });
      }
    } catch (error: any) {
      console.error("Error eliminando usuario:", error);
      const errorMessage = error.message?.includes("no encontrado")
        ? "Este usuario ya no existe."
        : error.message || "No se pudo eliminar al usuario. Inténtalo de nuevo.";

      fetchAllUsers();

      toast({
        title: "Error al eliminar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const chartData = [
    { month: "Ene", usuarios: 12, contribuciones: 2450, grupos: 3 },
    { month: "Feb", usuarios: 19, contribuciones: 3200, grupos: 5 },
    { month: "Mar", usuarios: 28, contribuciones: 4100, grupos: 7 },
    { month: "Abr", usuarios: 35, contribuciones: 5800, grupos: 9 },
    { month: "May", usuarios: 42, contribuciones: 7200, grupos: 11 },
    { month: "Jun", usuarios: 51, contribuciones: 8900, grupos: 13 },
  ];

  const chartConfig = {
    usuarios: {
      label: "Nuevos Usuarios",
      color: "hsl(var(--chart-1))",
    },
    contribuciones: {
      label: "Contribuciones ($)",
      color: "hsl(var(--chart-2))",
    },
    grupos: {
      label: "Grupos Activos",
      color: "hsl(var(--chart-3))",
    },
  };

  const renderDashboardView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-1">Gestión de usuarios y sistema de ahorro colaborativo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">Esperando aprobación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{grupos.length}</div>
            <p className="text-xs text-muted-foreground">Grupos de ahorro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{productos.length}</div>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <p className="text-xs text-muted-foreground">Productos entregados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Crecimiento del Sistema
          </CardTitle>
          <CardDescription>Estadísticas mensuales de usuarios, contribuciones y grupos activos</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="usuarios" fill="var(--color-usuarios)" radius={4} />
              <Bar dataKey="contribuciones" fill="var(--color-contribuciones)" radius={4} />
              <Bar dataKey="grupos" fill="var(--color-grupos)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Crecimiento Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+19%</div>
            <p className="text-sm text-muted-foreground">Más usuarios que el mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contribuciones Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$31,650</div>
            <p className="text-sm text-muted-foreground">Acumuladas en los últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Grupos Creados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">48</div>
            <p className="text-sm text-muted-foreground">Grupos activos en total</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderApprovalsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprobación de Usuarios</h1>
        <p className="text-gray-600 mt-1">Gestiona las solicitudes de registro de nuevos usuarios</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Usuarios Pendientes de Aprobación
          </CardTitle>
          <CardDescription>Revisar y aprobar solicitudes de registro de nuevos usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando usuarios pendientes...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios pendientes de aprobación</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{pendingUser.nombre} {pendingUser.apellido}</h3>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Cédula:</strong> {pendingUser.cedula}</p>
                        <p><strong>Teléfono:</strong> {pendingUser.telefono}</p>
                      </div>
                      <div>
                        <p><strong>Email:</strong> {pendingUser.correoElectronico}</p>
                        <p><strong>Registro:</strong> {pendingUser.fechaRegistro.toLocaleDateString("es-ES")}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingUser.imagenCedula && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Cédula
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Cédula de Identidad - {pendingUser.nombre} {pendingUser.apellido}</DialogTitle>
                            <DialogDescription>Documento de identidad del usuario registrado</DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-center">
                            <img
                              src={pendingUser.imagenCedula}
                              alt={`Cédula de ${pendingUser.nombre} ${pendingUser.apellido}`}
                              className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Imagen+no+disponible";
                                target.alt = "Imagen no disponible";
                              }}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      onClick={() => handleApproveUser(pendingUser.id)}
                      disabled={processingUser === pendingUser.id}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      {processingUser === pendingUser.id ? "Procesando..." : "Aprobar"}
                    </Button>
                    <Button
                      onClick={() => openRejectDialog(pendingUser)}
                      disabled={processingUser === pendingUser.id}
                      variant="destructive"
                      size="sm"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersView = () => {
    const filteredUsers = allUsers.filter((user) => {
      const matchesSearch =
        searchTerm === "" ||
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cedula.includes(searchTerm);

      const matchesStatus = statusFilter === "all" || user.estado === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra todos los usuarios registrados en el sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{allUsers.length}</div>
              <p className="text-xs text-muted-foreground">Registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {allUsers.filter((u) => u.estado === "APROBADO").length}
              </div>
              <p className="text-xs text-muted-foreground">Usuarios activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {allUsers.filter((u) => u.estado === "SUSPENDIDO").length}
              </div>
              <p className="text-xs text-muted-foreground">Usuarios suspendidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reactivados</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {allUsers.filter((u) => u.estado === "REACTIVADO").length}
              </div>
              <p className="text-xs text-muted-foreground">Usuarios con historial de suspensión</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar y Filtrar Usuarios</CardTitle>
            <CardDescription>Utiliza los controles para encontrar usuarios específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, apellido, email o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="APROBADO">Aprobados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                  <SelectItem value="RECHAZADO">Rechazados</SelectItem>
                  <SelectItem value="SUSPENDIDO">Suspendidos</SelectItem>
                  <SelectItem value="REACTIVADO">Reactivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Registrados</CardTitle>
            <CardDescription>
              {filteredUsers.length} usuario{filteredUsers.length !== 1 ? "s" : ""} encontrado{filteredUsers.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando usuarios...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron usuarios con los criterios de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{user.nombre} {user.apellido}</h3>
                        <Badge variant={user.tipo === "ADMINISTRADOR" ? "default" : "secondary"}>
                          {user.tipo}
                        </Badge>
                        <Badge
                          variant={
                            user.estado === "APROBADO" ? "default" :
                            user.estado === "PENDIENTE" ? "secondary" :
                            user.estado === "SUSPENDIDO" ? "outline" :
                            user.estado === "REACTIVADO" ? "outline" : "destructive"
                          }
                          className={
                            user.estado === "SUSPENDIDO" ? "border-orange-500 text-orange-700 bg-orange-50" :
                            user.estado === "REACTIVADO" ? "border-blue-500 text-blue-700 bg-blue-50" : ""
                          }
                        >
                          {user.estado === "SUSPENDIDO" ? "Suspendido" :
                           user.estado === "REACTIVADO" ? "Reactivado" : user.estado}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Cédula:</strong> {user.cedula}</p>
                          <p><strong>Teléfono:</strong> {user.telefono}</p>
                          <p><strong>Email:</strong> {user.correoElectronico}</p>
                        </div>
                        <div>
                          <p><strong>Registro:</strong> {user.fechaRegistro.toLocaleDateString("es-ES")}</p>
                          {user.ultimoAcceso && (
                            <p><strong>Último acceso:</strong> {user.ultimoAcceso.toLocaleDateString("es-ES")}</p>
                          )}
                          {user.fechaAprobacion && (
                            <p><strong>Aprobado:</strong> {user.fechaAprobacion.toLocaleDateString("es-ES")}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {user.imagenCedula && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver ID
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Documento de Identidad - {user.nombre} {user.apellido}</DialogTitle>
                              <DialogDescription>Cédula de identidad del usuario</DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img
                                src={user.imagenCedula}
                                alt={`Cédula de ${user.nombre} ${user.apellido}`}
                                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Imagen+no+disponible";
                                  target.alt = "Imagen no disponible";
                                }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {user.estado === "PENDIENTE" && (
                        <>
                          <Button
                            onClick={() => handleApproveUser(user.id)}
                            disabled={processingUser === user.id}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            {processingUser === user.id ? "..." : "Aprobar"}
                          </Button>
                          <Button
                            onClick={() => handleRejectUser(user.id)}
                            disabled={processingUser === user.id}
                            variant="destructive"
                            size="sm"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}

                      {(user.estado === "APROBADO" || user.estado === "REACTIVADO") && user.tipo !== "ADMINISTRADOR" && (
                        <Button
                          onClick={() => handleSuspendUser(user.id)}
                          disabled={processingUser === user.id}
                          variant="destructive"
                          size="sm"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Suspender
                        </Button>
                      )}

                      {user.estado === "SUSPENDIDO" && (
                        <>
                          <Button
                            onClick={() => handleReactivateUser(user.id)}
                            disabled={processingUser === user.id}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Reactivar
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(user)}
                            disabled={processingUser === user.id}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </>
                      )}
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

  const renderGroupsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Grupos</h1>
        <p className="text-gray-600 mt-1">Administra los grupos de ahorro colaborativo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grupos Activos</CardTitle>
          <CardDescription>Grupos de ahorro colaborativo en funcionamiento</CardDescription>
        </CardHeader>
        <CardContent>
          {grupos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No hay grupos activos</p>
          ) : (
            <div className="space-y-4">
              {grupos.map((grupo) => (
                <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{grupo.nombre}</h3>
                    <p className="text-sm text-gray-600">Duración: {grupo.duracionMeses} meses</p>
                    <p className="text-sm text-gray-600">Mes actual: {grupo.turnoActual}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={grupo.estado === "EN_MARCHA" ? "default" : "secondary"}>
                      {grupo.estado.replace("_", " ")}
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

  const renderContent = () => {
    switch (activeView) {
      case "dashboard": return renderDashboardView();
      case "approvals": return renderApprovalsView();
      case "users": return renderUsersView();
      case "groups": return renderGroupsView();
      case "products": return <div className="p-8 text-center text-gray-500">Vista de productos en desarrollo</div>;
      case "reports": return <div className="p-8 text-center text-gray-500">Vista de reportes en desarrollo</div>;
      default: return renderDashboardView();
    }
  };

  return (
    <>
      {/* Reject User Dialog */}
      <Dialog open={!!userToReject} onOpenChange={(open) => !open && closeRejectDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <UserX className="h-5 w-5" />
              Rechazar Usuario
            </DialogTitle>
            <DialogDescription>
              Proporciona una exposición de motivos para rechazar a este usuario.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {userToReject && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold">{userToReject.nombre} {userToReject.apellido}</h4>
                  <p className="text-sm text-gray-600">{userToReject.correoElectronico}</p>
                  <p className="text-sm text-gray-600">Cédula: {userToReject.cedula}</p>
                </div>
                <Badge variant="secondary">
                  Pendiente
                </Badge>
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Exposición de Motivos <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe las razones para rechazar a este usuario..."
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeRejectDialog} disabled={processingUser === userToReject?.id}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectUserWithReason}
              disabled={processingUser === userToReject?.id || !reason.trim()}
            >
              {processingUser === userToReject?.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rechazando...
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Rechazar Usuario
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash className="h-5 w-5" />
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              Proporciona una exposición de motivos para eliminar permanentemente a este usuario.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold">{userToDelete.nombre} {userToDelete.apellido}</h4>
                  <p className="text-sm text-gray-600">{userToDelete.correoElectronico}</p>
                  <p className="text-sm text-gray-600">Cédula: {userToDelete.cedula}</p>
                </div>
                <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50">
                  Suspendido
                </Badge>
              </div>

              <div className="space-y-2">
                <label htmlFor="delete-reason" className="text-sm font-medium">
                  Exposición de Motivos <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="delete-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe las razones para eliminar permanentemente a este usuario..."
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDeleteDialog} disabled={processingUser === userToDelete?.id}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUserWithReason}
              disabled={processingUser === userToDelete?.id || !reason.trim()}
            >
              {processingUser === userToDelete?.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar Permanentemente
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-sm text-gray-500">Marimar Saving Circles</p>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "dashboard"} onClick={() => setActiveView("dashboard")}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "approvals"} onClick={() => setActiveView("approvals")}>
                  <UserCheck className="h-4 w-4" />
                  Aprobaciones
                  {pendingUsers.length > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {pendingUsers.length}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "users"} onClick={() => setActiveView("users")}>
                  <Users className="h-4 w-4" />
                  Usuarios
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "groups"} onClick={() => setActiveView("groups")}>
                  <Users className="h-4 w-4" />
                  Grupos
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "products"} onClick={() => setActiveView("products")}>
                  <Package className="h-4 w-4" />
                  Productos
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeView === "reports"} onClick={() => setActiveView("reports")}>
                  <BarChart3 className="h-4 w-4" />
                  Reportes
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Panel de Administración</h1>
            </div>
          </header>
          <div className="flex-1 p-6">{renderContent()}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default AdminDashboard;
