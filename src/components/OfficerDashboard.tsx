import { ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClaims } from "@/context/ClaimsContext";

const OfficerDashboard = () => {
  const { claims, updateClaimStatus } = useClaims();

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-secondary" />
            Pending Verifications
            {claims.length > 0 && (
              <Badge className="ml-2 bg-accent text-accent-foreground">
                {claims.filter((c) => c.status === "pending").length} pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Farmer Name</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Damage %</TableHead>
                  <TableHead>AI Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No pending verifications at this time.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-sm font-semibold">
                        {claim.id}
                      </TableCell>
                      <TableCell>{claim.farmerName}</TableCell>
                      <TableCell>{claim.crop}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-accent">
                          {claim.damagePct}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            claim.status === "approved"
                              ? "bg-secondary text-secondary-foreground"
                              : claim.status === "rejected"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-accent text-accent-foreground"
                          }
                        >
                          {claim.status === "pending"
                            ? `AI: ${claim.aiConfidence}% conf.`
                            : claim.status.charAt(0).toUpperCase() +
                              claim.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.status === "pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                              onClick={() =>
                                updateClaimStatus(claim.id, "approved")
                              }
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateClaimStatus(claim.id, "rejected")
                              }
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Decision made
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerDashboard;
