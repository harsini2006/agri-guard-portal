import { useState } from "react";
import {
  Users,
  FileBarChart,
  ShieldCheck,
  Activity,
  Cpu,
  FileText,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useClaims, type Claim } from "@/context/ClaimsContext";
import ClaimReportModal from "@/components/ClaimReportModal";

const AdminDashboard = () => {
  const { claims } = useClaims();
  const [reportClaim, setReportClaim] = useState<Claim | null>(null);

  const totalClaims = claims.length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const pending = claims.filter((c) => c.status === "pending").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const verificationRate =
    totalClaims > 0 ? Math.round((approved / totalClaims) * 100) : 0;

  const aiAccuracy = 94;

  const stats = [
    {
      title: "Total Farmers Enrolled",
      icon: Users,
      value: "1,245",
      description: "Across 12 states under PMFBY",
      color: "text-primary",
    },
    {
      title: "Claims Processed",
      icon: FileBarChart,
      value: "890",
      description: `${totalClaims} in current session`,
      color: "text-accent",
    },
    {
      title: "Verification Rate",
      icon: ShieldCheck,
      value: `${verificationRate}%`,
      description: `${approved} approved, ${pending} pending, ${rejected} rejected`,
      color: "text-secondary",
    },
    {
      title: "System Health",
      icon: Activity,
      value: "99.7%",
      description: "All services operational",
      color: "text-secondary",
    },
  ];

  // Show all claims (not just approved) for report viewing
  const claimsWithReports = claims.filter((c) => c.status === "approved" || c.status === "pending");

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Admin Control Panel
        </h2>
        <Badge variant="outline" className="border-secondary text-secondary">
          PMFBY Season: Rabi 2025–26
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {s.title}
              </CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {s.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Accuracy Ring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-5 w-5 text-accent" />
              AI Diagnostic Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-4">
            <div className="relative h-40 w-40">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(aiAccuracy / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{aiAccuracy}%</span>
                <span className="text-[11px] text-muted-foreground">Accuracy</span>
              </div>
            </div>
            <div className="w-full space-y-2">
              <MetricBar label="Wheat Rust Detection" value={96} />
              <MetricBar label="Pest Infestation" value={91} />
              <MetricBar label="Hail Damage" value={88} />
              <MetricBar label="Leaf Blast" value={97} />
            </div>
          </CardContent>
        </Card>

        {/* Claims with report access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-secondary" />
              Claims — Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claimsWithReports.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No claims yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {claimsWithReports.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between rounded-md border bg-muted/30 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {claim.id} — {claim.farmerName}
                        </p>
                        <Badge
                          className={
                            claim.status === "approved"
                              ? "bg-secondary text-secondary-foreground text-[10px]"
                              : "bg-accent text-accent-foreground text-[10px]"
                          }
                        >
                          {claim.status === "approved" ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {claim.crop} · {claim.disease}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 shrink-0"
                      onClick={() => setReportClaim(claim)}
                    >
                      {claim.status === "pending" ? (
                        <><Eye className="mr-1 h-3.5 w-3.5" />View Report</>
                      ) : (
                        <><FileText className="mr-1 h-3.5 w-3.5" />Report</>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClaimReportModal
        claim={reportClaim}
        open={!!reportClaim}
        onClose={() => setReportClaim(null)}
      />
    </div>
  );
};

const MetricBar = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

export default AdminDashboard;
