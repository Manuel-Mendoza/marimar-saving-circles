import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApprovals } from "@/hooks/useApprovals";

const ApprovalsView: React.FC = () => {
  const { pendingUsers, loading, processingUser, handleApproveUser, handleRejectUser } = useApprovals();
  const [userToReject, setUserToReject] = useState<any>(null);
  const [reason, setReason] = useState("");

  const handleApprove = async (userId: number) => {
    await handleApproveUser(userId);
  };

  const handleReject = async () => {
    if (!userToReject || !reason.trim()) return;

    await handleRejectUser(userToReject.id, reason.trim());
    setUserToReject(null);
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

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aprobación de Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestiona las solicitudes de registro de nuevos usuarios</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Cargando usuarios pendientes...</p>
            </CardContent>
          </Card>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No hay usuarios pendientes de aprobación</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((user) => (
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
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openRejectDialog(user)}
                        disabled={processingUser === user.id}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Rechazar
                      </Button>
                      <Button
                        onClick={() => handleApprove(user.id)}
                        disabled={processingUser === user.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingUser === user.id ? "Procesando..." : "Aprobar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
            <Button variant="destructive" onClick={handleReject}>
              Rechazar Usuario
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalsView;
