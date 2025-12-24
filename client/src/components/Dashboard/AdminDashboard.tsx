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
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Componentes separados
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import GroupsView from "./components/GroupsView";

interface Producto {
  id: number;
  nombre: string;
  precioUsd: number;
  precioVes: number;
  tiempoDuracion: number;
  imagen?: string;
  descripcion: string;
  tags?: string[];
  activo: boolean;
}

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

  // Products state
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null);

  // Groups state
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Product form state
  const [productForm, setProductForm] = useState({
    nombre: "",
    precioUsd: "",
    precioVes: "",
    tiempoDuracion: "",
    descripcion: "",
    imagen: "",
    tags: [] as string[],
    activo: true
  });

  // Cargar usuarios pendientes y total de usuarios para el dashboard
  useEffect(() => {
    if (activeView === "approvals" || activeView === "dashboard") {
      fetchPendingUsers();
      fetchAllUsers(); // También cargar total de usuarios para el dashboard
    }
  }, [activeView]);

  // Cargar todos los usuarios cuando se selecciona la vista de usuarios
  useEffect(() => {
    if (activeView === "users") {
      fetchAllUsers();
    }
  }, [activeView]);

  // Cargar productos cuando se selecciona la vista de productos
  useEffect(() => {
    if (activeView === "products") {
      fetchAllProducts();
    }
  }, [activeView]);

  // Cargar grupos cuando se selecciona la vista de grupos
  useEffect(() => {
    if (activeView === "groups") {
      fetchAllGroups();
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

  const fetchAllGroups = async () => {
    setGroupsLoading(true);
    try {
      const response = await apiClient.getGroups();
      if (response.success && response.data) {
        setAllGroups(response.data.groups);
      } else {
        setAllGroups([]);
      }
    } catch (error) {
      console.error("Error cargando grupos:", error);
      setAllGroups([]);
    } finally {
      setGroupsLoading(false);
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

  // Product management functions
  const fetchAllProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await apiClient.getProducts();
      if (response.success && response.data) {
        setAllProducts(response.data.products);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
      setAllProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      nombre: "",
      precioUsd: "",
      precioVes: "",
      tiempoDuracion: "",
      descripcion: "",
      imagen: "",
      tags: [],
      activo: true
    });
  };

  const openCreateDialog = () => {
    resetProductForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (product: Producto) => {
    setProductForm({
      nombre: product.nombre,
      precioUsd: product.precioUsd.toString(),
      precioVes: product.precioVes.toString(),
      tiempoDuracion: product.tiempoDuracion.toString(),
      descripcion: product.descripcion,
      imagen: product.imagen || "",
      tags: product.tags || [],
      activo: product.activo
    });
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetProductForm();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const openDeleteProductDialog = (product: Producto) => {
    setProductToDelete(product);
  };

  const closeDeleteProductDialog = () => {
    setProductToDelete(null);
  };

  const handleCreateProduct = async () => {
    if (!productForm.nombre || !productForm.precioUsd || !productForm.precioVes ||
        !productForm.tiempoDuracion || !productForm.descripcion) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiClient.createProduct({
        nombre: productForm.nombre,
        precioUsd: parseFloat(productForm.precioUsd),
        precioVes: parseFloat(productForm.precioVes),
        tiempoDuracion: parseInt(productForm.tiempoDuracion),
        descripcion: productForm.descripcion,
        imagen: productForm.imagen || undefined,
        tags: productForm.tags,
        activo: productForm.activo
      });

      if (response.success) {
        closeCreateDialog();
        fetchAllProducts();
        toast({
          title: "Producto creado",
          description: "El producto ha sido creado exitosamente.",
        });
      } else {
        toast({
          title: "Error al crear producto",
          description: response.message || "No se pudo crear el producto.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creando producto:", error);
      toast({
        title: "Error al crear producto",
        description: error.message || "No se pudo crear el producto.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    if (!productForm.nombre || !productForm.precioUsd || !productForm.precioVes ||
        !productForm.tiempoDuracion || !productForm.descripcion) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiClient.updateProduct(editingProduct.id, {
        nombre: productForm.nombre,
        precioUsd: parseFloat(productForm.precioUsd),
        precioVes: parseFloat(productForm.precioVes),
        tiempoDuracion: parseInt(productForm.tiempoDuracion),
        descripcion: productForm.descripcion,
        imagen: productForm.imagen || undefined,
        tags: productForm.tags,
        activo: productForm.activo
      });

      if (response.success) {
        closeEditDialog();
        fetchAllProducts();
        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado exitosamente.",
        });
      } else {
        toast({
          title: "Error al actualizar producto",
          description: response.message || "No se pudo actualizar el producto.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error actualizando producto:", error);
      toast({
        title: "Error al actualizar producto",
        description: error.message || "No se pudo actualizar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await apiClient.deleteProduct(productToDelete.id);

      if (response.success) {
        closeDeleteProductDialog();
        fetchAllProducts();
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado exitosamente.",
        });
      } else {
        toast({
          title: "Error al eliminar producto",
          description: response.message || "No se pudo eliminar el producto.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error eliminando producto:", error);
      toast({
        title: "Error al eliminar producto",
        description: error.message || "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Available tags from centralized utilities
  const availableTags = [
    "electrodomésticos",
    "línea blanca",
    "celulares",
    "tv",
    "computadoras",
    "laptops",
    "aires acondicionados",
    "cocinas",
    "microondas",
    "lavadoras",
    "neveras",
    "refrigeradores"
  ];

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView
          allUsersCount={allUsers.length}
          groupsCount={allGroups.length}
          productsCount={allProducts.length}
        />;
      case "approvals":
        return renderApprovalsView();
      case "users":
        return renderUsersView();
      case "groups":
        return <GroupsView allGroups={allGroups} groupsLoading={groupsLoading} />;
      case "products":
        return renderProductsView();
      case "reports":
        return <div className="p-8 text-center text-gray-500">Vista de reportes en desarrollo</div>;
      default:
        return <DashboardView
          allUsersCount={allUsers.length}
          groupsCount={allGroups.length}
          productsCount={allProducts.length}
        />;
    }
  };

  // Placeholder functions for views not yet separated
  const renderApprovalsView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprobación de Usuarios</h1>
        <p className="text-gray-600 mt-1">Gestiona las solicitudes de registro de nuevos usuarios</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Vista de aprobaciones en desarrollo</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderUsersView = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">Administra todos los usuarios registrados en el sistema</p>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Vista de usuarios en desarrollo</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderProductsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-1">Administra el catálogo de productos para círculos de ahorro</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
          Nuevo Producto
        </Button>
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Vista de productos en desarrollo</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      {/* Reject User Dialog */}
      <Dialog open={!!userToReject} onOpenChange={(open) => !open && closeRejectDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              Rechazar Usuario
            </DialogTitle>
            <DialogDescription>
              Proporciona una exposición de motivos para rechazar a este usuario.
            </DialogDescription>
          </DialogHeader>
          {userToReject && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold">{userToReject.nombre} {userToReject.apellido}</h4>
                  <p className="text-sm text-gray-600">{userToReject.correoElectronico}</p>
                </div>
                <Badge variant="secondary">Pendiente</Badge>
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
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  required
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRejectUserWithReason}>
              Rechazar Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              Proporciona una exposición de motivos para eliminar permanentemente a este usuario.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold">{userToDelete.nombre} {userToDelete.apellido}</h4>
                  <p className="text-sm text-gray-600">{userToDelete.correoElectronico}</p>
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
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  required
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUserWithReason}>
              Eliminar Permanentemente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SidebarProvider>
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          pendingUsersCount={pendingUsers.length}
        />
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
