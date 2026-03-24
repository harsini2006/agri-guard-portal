import { FileBarChart, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    title: "Total Claims",
    icon: FileBarChart,
    value: "—",
    description: "All submitted claims",
  },
  {
    title: "Verification Rate",
    icon: ShieldCheck,
    value: "—",
    description: "Claims verified vs pending",
  },
  {
    title: "System Health",
    icon: Activity,
    value: "—",
    description: "Platform uptime & status",
  },
];

const AdminDashboard = () => {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
      <h2 className="text-lg font-bold text-foreground">Admin Overview</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.title}
              </CardTitle>
              <s.icon className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
