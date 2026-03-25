import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Wheat,
  ScanLine,
  AlertTriangle,
  CheckCircle2,
  Send,
  Leaf,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useClaims } from "@/context/ClaimsContext";
import { analyzeCropImage, getUserGeolocation, type AiResult } from "@/services/cropAnalysis";

type Phase = "idle" | "connecting" | "scanning" | "result" | "submitted";

const FARMER_NAME = "Ramesh Kumar";

const FarmerDashboard = () => {
  const { claims, addClaim } = useClaims();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const [geoCoords, setGeoCoords] = useState<{ lat: string; lng: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const startAnalysis = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPhase("connecting");

    // Fetch geolocation in parallel with AI analysis
    const [aiResult, geo] = await Promise.all([
      analyzeCropImage(file),
      getUserGeolocation(),
    ]);

    setGeoCoords(geo);

    // Now run scanning animation (1.5s visual)
    setPhase("scanning");
    setProgress(0);
    const duration = 1500;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed >= duration) {
        clearInterval(timer);
        setResult(aiResult);
        setPhase("result");
      }
    }, interval);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) startAnalysis(file);
    },
    [startAnalysis]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) startAnalysis(file);
    },
    [startAnalysis]
  );

  const handleSubmit = useCallback(() => {
    if (!result) return;
    addClaim({
      farmerName: FARMER_NAME,
      crop: result.crop,
      disease: result.disease,
      damagePct: result.damagePct,
      aiConfidence: result.aiConfidence,
      gpsLat: geoCoords?.lat ?? "Location Unavailable",
      gpsLng: geoCoords?.lng ?? "Location Unavailable",
    });
    setPhase("submitted");
    setTimeout(() => {
      setPhase("idle");
      setImageUrl(null);
      setResult(null);
      setGeoCoords(null);
    }, 2000);
  }, [addClaim, result, geoCoords]);

  const farmerClaims = claims.filter((c) => c.farmerName === FARMER_NAME);

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 md:px-6">
      {/* Welcome */}
      <div className="rounded-lg border-l-4 border-secondary bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Wheat className="h-8 w-8 text-secondary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Welcome, {FARMER_NAME}
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your crop insurance claims and monitor status through the
              PMFBY portal.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload / AI Section */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-5 w-5 text-secondary" />
              Upload Crop Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {phase === "idle" && (
              <button
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/50 py-12 transition-colors hover:border-secondary hover:bg-secondary/5"
              >
                <Upload className="mb-3 h-10 w-10 text-muted-foreground transition-colors group-hover:text-secondary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Drag &amp; drop or click to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG up to 10 MB
                </p>
              </button>
            )}

            {phase === "connecting" && imageUrl && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-md">
                  <img src={imageUrl} alt="Crop being analyzed" className="w-full rounded-md object-cover opacity-60" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/20">
                    <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                    <p className="mt-3 text-sm font-semibold text-foreground">Connecting to AI Server...</p>
                    <p className="mt-1 text-xs text-muted-foreground">Establishing secure connection</p>
                  </div>
                </div>
              </div>
            )}

            {phase === "scanning" && imageUrl && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-md">
                  <img src={imageUrl} alt="Crop being analyzed" className="w-full rounded-md object-cover" />
                  <div className="absolute inset-0 bg-primary/10" />
                  <div className="animate-scan-line absolute left-0 h-0.5 w-full bg-secondary shadow-[0_0_8px_hsl(var(--secondary))]" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ScanLine className="h-4 w-4 animate-pulse text-secondary" />
                    Analyzing via AI...
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Processing image through crop disease detection model
                  </p>
                </div>
              </div>
            )}

            {(phase === "result" || phase === "submitted") && imageUrl && result && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-md">
                  <img src={imageUrl} alt="Analyzed crop" className="w-full rounded-md object-cover" />
                  <div className="absolute right-2 top-2">
                    <Badge className="bg-secondary text-secondary-foreground">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Analysis Complete
                    </Badge>
                  </div>
                </div>

                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                    {result.healthy ? (
                      <Leaf className="h-4 w-4 text-secondary" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-accent" />
                    )}
                    AI Detection Results
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-md bg-muted p-3 text-center">
                      <p className="text-[11px] font-medium text-muted-foreground">Disease</p>
                      <p className={`mt-1 text-sm font-bold ${result.healthy ? "text-secondary" : "text-destructive"}`}>
                        {result.disease}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted p-3 text-center">
                      <p className="text-[11px] font-medium text-muted-foreground">Damage</p>
                      <p className={`mt-1 text-sm font-bold ${result.healthy ? "text-secondary" : "text-accent"}`}>
                        {result.damagePct}%
                      </p>
                    </div>
                    <div className="rounded-md bg-muted p-3 text-center">
                      <p className="text-[11px] font-medium text-muted-foreground">AI Confidence</p>
                      <p className="mt-1 text-sm font-bold text-secondary">
                        {result.aiConfidence}%
                      </p>
                    </div>
                  </div>

                  {geoCoords && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      📍 GPS: {geoCoords.lat}, {geoCoords.lng}
                    </p>
                  )}

                  {phase === "result" && (
                    <Button
                      onClick={handleSubmit}
                      className="mt-4 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Claim
                    </Button>
                  )}
                  {phase === "submitted" && (
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-secondary/10 py-2 text-sm font-medium text-secondary">
                      <CheckCircle2 className="h-4 w-4" />
                      Claim submitted successfully!
                    </div>
                  )}
                </div>
              </div>
            )}
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
            {farmerClaims.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No claims submitted yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload a crop image to start a new claim.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {farmerClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between rounded-md border bg-muted/30 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">{claim.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {claim.disease} · {claim.dateFiled}
                      </p>
                    </div>
                    <Badge
                      variant={
                        claim.status === "approved"
                          ? "default"
                          : claim.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        claim.status === "approved"
                          ? "bg-secondary text-secondary-foreground"
                          : claim.status === "pending"
                          ? "bg-accent text-accent-foreground"
                          : ""
                      }
                    >
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerDashboard;
