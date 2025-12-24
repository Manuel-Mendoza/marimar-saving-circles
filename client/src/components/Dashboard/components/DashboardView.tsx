import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface DashboardViewProps {
  allUsersCount: number;
  groupsCount: number;
  productsCount: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  allUsersCount,
  groupsCount,
  productsCount,
}) => {
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

  return (
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
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{allUsersCount}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{groupsCount}</div>
            <p className="text-xs text-muted-foreground">Grupos de ahorro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{productsCount}</div>
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
};

export default DashboardView;
