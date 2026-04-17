import { useState, useMemo } from "react";
import {
  Users,
  FileBarChart,
  ShieldCheck,
  Activity,
  Cpu,
  FileText,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/UserManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useClaims, type Claim } from "@/context/ClaimsContext";
import ClaimReportModal from "@/components/ClaimReportModal";
import ClaimsFilter from "@/components/ClaimsFilter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DISEASE_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--primary))",
  "hsl(210 60% 65%)",
  "hsl(280 60% 60%)",
  "hsl(160 50% 50%)",
];

const AdminDashboard = () => {
  const { claims } = useClaims();
  const [reportClaim, setReportClaim] = useState<Claim | null>(null);
  const [filteredClaims, setFilteredClaims] = useState<Claim[] | null>(null);

  const totalClaims = claims.length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const pending = claims.filter((c) => c.status === "pending").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;
  const verificationRate =
    totalClaims > 0 ? Math.round((approved / totalClaims) * 100) : 0;

  // Derive unique farmer count from claims
  const uniqueFarmers = useMemo(() => {
    const ids = new Set(claims.map((c) => c.farmerId));
    return ids.size;
  }, [claims]);

  // Derive unique states from claims
  const uniqueStates = useMemo(() => {
    const states = new Set(claims.map((c) => c.state));
    return states.size;
  }, [claims]);

  // Derive average AI confidence as "accuracy" metric
  const aiAccuracy = useMemo(() => {
    if (claims.length === 0) return 0;
    const sum = claims.reduce((acc, c) => acc + c.aiConfidence, 0);
    return Math.round(sum / claims.length);
  }, [claims]);

  // Derive per-disease accuracy metrics
  const diseaseAccuracyMetrics = useMemo(() => {
    const map = new Map<string, { total: number; sum: number }>();
    for (const c of claims) {
      if (c.disease === "Healthy Crop" || c.disease === "Analysis Unavailable") continue;
      const existing = map.get(c.disease) || { total: 0, sum: 0 };
      existing.total += 1;
      existing.sum += c.aiConfidence;
      map.set(c.disease, existing);
    }
    return Array.from(map.entries())
      .map(([label, { total, sum }]) => ({
        label,
        value: Math.round(sum / total),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [claims]);

  // Derive region data from claims
  const regionData = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of claims) {
      map.set(c.district, (map.get(c.district) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([district, count]) => ({ district, claims: count }))
      .sort((a, b) => b.claims - a.claims)
      .slice(0, 8);
  }, [claims]);

  // Derive disease distribution from claims
  const diseaseData = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of claims) {
      const name = c.disease.length > 20 ? c.disease.slice(0, 18) + "…" : c.disease;
      map.set(name, (map.get(name) || 0) + 1);
    }
    const total = claims.length || 1;
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [claims]);

  // Financial KPIs from real claim data
  const totalApprovedPayout = useMemo(
    () => claims.filter((c) => c.status === "approved").reduce((sum, c) => sum + c.estCompensation, 0),
    [claims]
  );
  const totalPendingPayout = useMemo(
    () => claims.filter((c) => c.status === "pending").reduce((sum, c) => sum + c.estCompensation, 0),
    [claims]
  );
  const avgPayout = useMemo(() => {
    const approvedClaims = claims.filter((c) => c.status === "approved");
    if (approvedClaims.length === 0) return 0;
    return Math.round(totalApprovedPayout / approvedClaims.length);
  }, [claims, totalApprovedPayout]);

  const formatINR = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const stats = [
    {
      title: "Total Farmers Enrolled",
      icon: Users,
      value: uniqueFarmers.toLocaleString("en-IN"),
      description: `Across ${uniqueStates} states under PMFBY`,
      color: "text-primary",
    },
    {
      title: "Claims Processed",
      icon: FileBarChart,
      value: totalClaims.toLocaleString("en-IN"),
      description: `${approved} approved, ${rejected} rejected, ${pending} pending`,
      color: "text-accent",
    },
    {
      title: "Verification Rate",
      icon: ShieldCheck,
      value: `${verificationRate}%`,
      description: `${approved} verified out of ${totalClaims}`,
      color: "text-secondary",
    },
    {
      title: "Avg AI Confidence",
      icon: Activity,
      value: `${aiAccuracy}%`,
      description: `Across ${totalClaims} analyses`,
      color: "text-secondary",
    },
    {
      title: "Total Payout Authorised",
      icon: IndianRupee,
      value: formatINR(totalApprovedPayout),
      description: `${approved} approved claim(s)`,
      color: "text-secondary",
    },
    {
      title: "Pending Liability",
      icon: TrendingUp,
      value: formatINR(totalPendingPayout),
      description: `${pending} claim(s) awaiting review`,
      color: "text-accent",
    },
    {
      title: "Avg Compensation",
      icon: IndianRupee,
      value: approved > 0 ? formatINR(avgPayout) : "—",
      description: "Per approved claim",
      color: "text-primary",
    },
  ];

  const claimsWithReports = claims.filter(
    (c) => c.status === "approved" || c.status === "pending"
  );
  const displayClaims = filteredClaims
    ? filteredClaims.filter(
        (c) => c.status === "approved" || c.status === "pending"
      )
    : claimsWithReports;

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

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
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

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Claims by District
                </CardTitle>
              </CardHeader>
              <CardContent>
                {regionData.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">No claims data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={regionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="district" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="claims" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChartIcon className="h-5 w-5 text-accent" />
                  Disease Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {diseaseData.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">No claims data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={diseaseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                        labelLine={false}
                      >
                        {diseaseData.map((_, idx) => (
                          <Cell key={idx} fill={DISEASE_COLORS[idx % DISEASE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value}%`}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* AI Accuracy Ring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="h-5 w-5 text-accent" />
                  AI Diagnostic Confidence
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
                    <span className="text-[11px] text-muted-foreground">Avg Confidence</span>
                  </div>
                </div>
                <div className="w-full space-y-2">
                  {diseaseAccuracyMetrics.length > 0 ? (
                    diseaseAccuracyMetrics.map((m) => (
                      <MetricBar key={m.label} label={m.label} value={m.value} />
                    ))
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">No disease data yet</p>
                  )}
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
              <CardContent className="space-y-4">
                <ClaimsFilter claims={claims} onFiltered={setFilteredClaims} />
                {displayClaims.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No matching claims found.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {displayClaims.map((claim) => (
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
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
      </Tabs>

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
