import { useState } from "react";
import TopNavBar, { type UserRole } from "@/components/TopNavBar";
import FarmerDashboard from "@/components/FarmerDashboard";
import OfficerDashboard from "@/components/OfficerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { ClaimsProvider } from "@/context/ClaimsContext";

const dashboards: Record<UserRole, React.FC> = {
  farmer: FarmerDashboard,
  officer: OfficerDashboard,
  admin: AdminDashboard,
};

const Index = () => {
  const [role, setRole] = useState<UserRole>("farmer");
  const Dashboard = dashboards[role];

  return (
    <ClaimsProvider>
      <div className="min-h-screen bg-background">
        <TopNavBar role={role} onRoleChange={setRole} />
        <Dashboard />
      </div>
    </ClaimsProvider>
  );
};

export default Index;
