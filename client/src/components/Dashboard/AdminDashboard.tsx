import React, { useState, useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useApprovals } from "@/hooks/useApprovals";
import { useUsers } from "@/hooks/useUsers";
import { useProducts } from "@/hooks/useProducts";
import { useGroups } from "@/hooks/useGroups";
import { usePaymentRequests } from "@/hooks/usePaymentRequests";

// Componentes separados
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import GroupsView from "./components/GroupsView";
import ApprovalsView from "./components/ApprovalsView";
import UsersView from "./components/UsersView";
import ProductsView from "./components/ProductsView";
import PaymentRequestsView from "./components/PaymentRequestsView";

type ActiveView =
  | "dashboard"
  | "approvals"
  | "users"
  | "groups"
  | "products"
  | "payment-requests"
  | "reports";

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  // Obtener datos para el dashboard
  const { pendingUsers } = useApprovals();
  const { allUsers } = useUsers();
  const { allProducts } = useProducts();
  const { allGroups } = useGroups();
  const { pendingCount: pendingPaymentRequests } = usePaymentRequests();

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView
          allUsersCount={allUsers.length}
          groupsCount={allGroups.length}
          productsCount={allProducts.length}
        />;
      case "approvals":
        return <ApprovalsView />;
      case "users":
        return <UsersView />;
      case "groups":
        return <GroupsView />;
      case "products":
        return <ProductsView />;
      case "payment-requests":
        return <PaymentRequestsView />;
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

  return (
    <SidebarProvider>
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        pendingUsersCount={pendingUsers.length}
        pendingPaymentsCount={pendingPaymentRequests}
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
  );
};

export default AdminDashboard;
