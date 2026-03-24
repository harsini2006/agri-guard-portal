import { Upload, FileText, Wheat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FarmerDashboard = () => {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
      {/* Welcome */}
      <div className="rounded-lg border-l-4 border-secondary bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Wheat className="h-8 w-8 text-secondary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Welcome, Farmer
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your crop insurance claims and monitor status through the
              PMFBY portal.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-5 w-5 text-secondary" />
              Upload Crop Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/50 py-12">
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag &amp; drop crop images here
              </p>
              <Button variant="outline" className="mt-4" disabled>
                Browse Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-accent" />
              My Recent Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No claims submitted yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a crop image to start a new claim.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerDashboard;
