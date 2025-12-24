import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";

const GroupsView: React.FC = () => {
  const { allGroups, groupsLoading } = useGroups();
  return (
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
          {groupsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando grupos...</p>
            </div>
          ) : allGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay grupos activos en el sistema</p>
              <p className="text-sm text-gray-400 mt-2">Los grupos se crearán automáticamente cuando los usuarios seleccionen productos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allGroups.map((grupo: any) => (
                <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{grupo.nombre}</h3>
                      <Badge variant={grupo.estado === "EN_MARCHA" ? "default" : "secondary"}>
                        {grupo.estado.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Duración:</strong> {grupo.duracionMeses} meses</p>
                        <p><strong>Mes actual:</strong> {grupo.turnoActual}</p>
                        {grupo.fechaInicio && (
                          <p><strong>Inicio:</strong> {new Date(grupo.fechaInicio).toLocaleDateString("es-ES")}</p>
                        )}
                      </div>
                      <div>
                        {grupo.fechaFinal && (
                          <p><strong>Finalización:</strong> {new Date(grupo.fechaFinal).toLocaleDateString("es-ES")}</p>
                        )}
                        <p><strong>Participantes:</strong> {grupo.participantes || 0}</p>
                        <p><strong>Producto:</strong> {grupo.productoNombre || 'N/A'}</p>
                      </div>
                    </div>
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

export default GroupsView;
