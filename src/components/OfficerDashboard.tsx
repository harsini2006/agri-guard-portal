import { ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const OfficerDashboard = () => {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-secondary" />
            Pending Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim ID</TableHead>
                <TableHead>Farmer Name</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  No pending verifications at this time.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficerDashboard;
