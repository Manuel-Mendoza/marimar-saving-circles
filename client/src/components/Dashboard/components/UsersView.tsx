import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { useUsers } from "@/hooks/useUsers";
import { User } from "../../../../../shared/types";

const UsersView: React.FC = () => {
  const { allUsers, usersLoading, processingUser, handleSuspendUser, handleReactivateUser, handleDeleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [reason, setReason] = useState("");

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSuspend = async (userId: number) => {
    await handleSuspendUser(userId);
  };

  const handleReactivate = async (userId: number) => {
    await handleReactivateUser(userId);
  };

  const handleDelete = async () => {
    if (!userToDelete || !reason.trim()) return;

    await handleDeleteUser(userToDelete.id, reason.trim());
    setUserToDelete(null);
    setReason("");
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setReason("");
  };

  const closeDeleteDialog = () => {
    setUserToDelete(null);
    setReason("");
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra todos los usuarios registrados en el sistema</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Input
                placeholder="Buscar por nombre, email o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="APROBADO">Aprobado</SelectItem>
                  <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                  <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
                  <SelectItem value="REACTIVADO">Reactivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {usersLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Cargando usuarios...</p>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron usuarios con los filtros aplicados"
                  : "No hay usuarios registrados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.nombre} {user.apellido}</h3>
                        <p className="text-gray-600">{user.correoElectronico}</p>
                        <p className="text-sm text-gray-500">{user.cedula} • {user.telefono}</p>
                        <p className="text-xs text-gray-400">
                          Registrado: {user.fechaRegistro.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          user.estado === "APROBADO" ? "default" :
                          user.estado === "PENDIENTE" ? "secondary" :
                          user.estado === "RECHAZADO" ? "destructive" :
                          user.estado === "SUSPENDIDO" ? "outline" :
                          "default"
                        }
                      >
                        {user.estado}
                      </Badge>
                      <div className="flex gap-2">
                        {user.estado === "APROBADO" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspend(user.id)}
                            disabled={processingUser === user.id}
                            className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          >
                            Suspender
                          </Button>
                        )}
                        {user.estado === "SUSPENDIDO" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivate(user.id)}
                            disabled={processingUser === user.id}
                            className="border-green-300 text-green-600 hover:bg-green-50"
                          >
                            Reactivar
                          </Button>
                        )}
                        {(user.estado === "SUSPENDIDO" || user.estado === "RECHAZADO") && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            disabled={processingUser === user.id}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar Permanentemente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersView;
