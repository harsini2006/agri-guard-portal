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

const mockFarmers = [
  { id: "PMFBY-UP-73019", name: "Anita Devi", state: "Uttar Pradesh", crops: "Wheat, Mustard", status: "Active" },
  { id: "PMFBY-MH-44821", name: "Suresh Patel", state: "Maharashtra", crops: "Soybean, Cotton", status: "Active" },
  { id: "PMFBY-RJ-55204", name: "Rajendra Singh", state: "Rajasthan", crops: "Cotton, Bajra", status: "Active" },
  { id: "PMFBY-PB-30457", name: "Baldev Kaur", state: "Punjab", crops: "Wheat, Paddy", status: "Suspended" },
  { id: "PMFBY-MP-44012", name: "Sunita Patel", state: "Madhya Pradesh", crops: "Wheat, Gram", status: "Active" },
];

const UserManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Users className="h-5 w-5 text-primary" />
        Registered Farmers
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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFarmers.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-mono text-sm font-semibold">{f.id}</TableCell>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.state}</TableCell>
                <TableCell className="text-muted-foreground">{f.crops}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      f.status === "Active"
                        ? "bg-secondary text-secondary-foreground text-[10px]"
                        : "bg-destructive text-destructive-foreground text-[10px]"
                    }
                  >
                    {f.status}
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
                      <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Suspend Account
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);

export default UserManagement;
