import { useMemo, useState } from "react";
import { MoreHorizontal, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useClaims } from "@/context/ClaimsContext";
import { toast } from "sonner";

interface DerivedFarmer {
  id: string;
  name: string;
  state: string;
  crops: string;
  claimCount: number;
  hasRejected: boolean;
}

const UserManagement = () => {
  const { claims, suspendedFarmerIds, toggleSuspendFarmer, resetDemoData } = useClaims();
  const [suspendTarget, setSuspendTarget] = useState<DerivedFarmer | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const farmers = useMemo<DerivedFarmer[]>(() => {
    const map = new Map<string, DerivedFarmer>();
    for (const c of claims) {
      const existing = map.get(c.farmerId);
      if (existing) {
        const cropSet = new Set(existing.crops.split(", "));
        cropSet.add(c.crop);
        existing.crops = Array.from(cropSet).join(", ");
        existing.claimCount += 1;
        if (c.status === "rejected") existing.hasRejected = true;
      } else {
        map.set(c.farmerId, {
          id: c.farmerId,
          name: c.farmerName,
          state: c.state,
          crops: c.crop,
          claimCount: 1,
          hasRejected: c.status === "rejected",
        });
      }
    }
    return Array.from(map.values());
  }, [claims]);

  const handleEditProfile = (farmer: DerivedFarmer) => {
    toast.info(`Profile editor — ${farmer.name}`, {
      description: `${farmer.id} · ${farmer.state} · ${farmer.claimCount} claim(s)`,
    });
  };

  const handleViewClaims = (farmer: DerivedFarmer) => {
    const farmerClaims = claims.filter((c) => c.farmerId === farmer.id);
    const ids = farmerClaims.map((c) => c.id).join(", ");
    toast.info(`${farmer.name} — ${farmerClaims.length} claim(s)`, {
      description: ids || "No claims found.",
      duration: 6000,
    });
  };

  const confirmSuspend = () => {
    if (!suspendTarget) return;
    const nowSuspended = toggleSuspendFarmer(suspendTarget.id);
    if (nowSuspended) {
      toast.warning(`${suspendTarget.name} suspended`, {
        description: `Farmer ${suspendTarget.id} can no longer file new claims.`,
      });
    } else {
      toast.success(`${suspendTarget.name} reinstated`, {
        description: `Farmer ${suspendTarget.id} can file claims again.`,
      });
    }
    setSuspendTarget(null);
  };

  const handleResetDemo = () => {
    resetDemoData();
    toast.success("Demo data reset", {
      description: "All claims and suspensions restored to defaults.",
    });
    setResetOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Registered Farmers
          <Badge variant="outline" className="ml-2 text-xs">
            {farmers.length} farmers
          </Badge>
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setResetOpen(true)}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset Demo Data
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Registered Crops</TableHead>
                <TableHead>Claims</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No registered farmers yet.
                  </TableCell>
                </TableRow>
              ) : (
                farmers.map((f) => {
                  const isSuspended = suspendedFarmerIds.includes(f.id);
                  const status = isSuspended
                    ? "Suspended"
                    : f.hasRejected
                    ? "Flagged"
                    : "Active";
                  const badgeClass = isSuspended
                    ? "bg-destructive text-destructive-foreground text-[10px]"
                    : f.hasRejected
                    ? "bg-accent text-accent-foreground text-[10px]"
                    : "bg-secondary text-secondary-foreground text-[10px]";
                  return (
                    <TableRow key={f.id} className={isSuspended ? "opacity-60" : ""}>
                      <TableCell className="font-mono text-sm font-semibold">{f.id}</TableCell>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.state}</TableCell>
                      <TableCell className="text-muted-foreground">{f.crops}</TableCell>
                      <TableCell className="font-semibold">{f.claimCount}</TableCell>
                      <TableCell>
                        <Badge className={badgeClass}>{status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClaims(f)}>
                              View Claims
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProfile(f)}>
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={isSuspended ? "text-secondary" : "text-destructive"}
                              onClick={() => setSuspendTarget(f)}
                            >
                              {isSuspended ? "Reinstate Account" : "Suspend Account"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Suspend confirmation */}
      <AlertDialog open={!!suspendTarget} onOpenChange={(o) => !o && setSuspendTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendTarget && suspendedFarmerIds.includes(suspendTarget.id)
                ? `Reinstate ${suspendTarget.name}?`
                : `Suspend ${suspendTarget?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendTarget && suspendedFarmerIds.includes(suspendTarget.id)
                ? "This farmer will be able to file new claims again."
                : "This farmer will be blocked from filing new claims until reinstated. Existing claims are preserved."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspend}
              className={
                suspendTarget && suspendedFarmerIds.includes(suspendTarget.id)
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset demo confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all demo data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current claims with the original demo seed data
              and clear all account suspensions. New claims you submitted will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDemo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default UserManagement;
