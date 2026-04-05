import { useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
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
  suspended: boolean;
}

const UserManagement = () => {
  const { claims } = useClaims();

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
          suspended: false,
        });
      }
    }
    return Array.from(map.values());
  }, [claims]);

  const handleEditProfile = (farmer: DerivedFarmer) => {
    toast.info(`Opening profile editor for ${farmer.name}`, {
      description: `Farmer ID: ${farmer.id} — ${farmer.state}`,
    });
  };

  const handleSuspend = (farmer: DerivedFarmer) => {
    toast.warning(`Account suspension initiated for ${farmer.name}`, {
      description: `Farmer ID: ${farmer.id}. This action would require admin confirmation in a production system.`,
      duration: 5000,
    });
  };

  const handleViewClaims = (farmer: DerivedFarmer) => {
    toast.info(`${farmer.name} has ${farmer.claimCount} claim(s)`, {
      description: `Crops: ${farmer.crops} · State: ${farmer.state}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5 text-primary" />
          Registered Farmers
          <Badge variant="outline" className="ml-2 text-xs">
            {farmers.length} farmers
          </Badge>
        </CardTitle>
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
                  const status = f.hasRejected ? "Flagged" : "Active";
                  return (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-sm font-semibold">{f.id}</TableCell>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.state}</TableCell>
                      <TableCell className="text-muted-foreground">{f.crops}</TableCell>
                      <TableCell className="font-semibold">{f.claimCount}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            status === "Active"
                              ? "bg-secondary text-secondary-foreground text-[10px]"
                              : "bg-accent text-accent-foreground text-[10px]"
                          }
                        >
                          {status}
                        </Badge>
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
                              className="text-destructive"
                              onClick={() => handleSuspend(f)}
                            >
                              Suspend Account
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
    </Card>
  );
};

export default UserManagement;
