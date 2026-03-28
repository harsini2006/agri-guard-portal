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
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useClaims } from "@/context/ClaimsContext";
import { analyzeCropImage, getUserGeolocation, type AiResult } from "@/services/cropAnalysis";
import ClaimStepper from "@/components/ClaimStepper";

type Phase = "idle" | "connecting" | "scanning" | "result";
type WizardStep = 1 | 2;

const FARMER_NAME = "Ramesh Kumar";
const CROP_OPTIONS = ["Paddy", "Wheat", "Cotton", "Soybean"] as const;

const FarmerDashboard = () => {
  const { claims, addClaim } = useClaims();

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const [geoCoords, setGeoCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2 form state
  const [cropType, setCropType] = useState("");
  const [sowingDate, setSowingDate] = useState<Date | undefined>();
  const [areaHectares, setAreaHectares] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- Step 1: AI analysis (unchanged logic) ---
  const startAnalysis = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPhase("connecting");

    const [aiResult, geo] = await Promise.all([
      analyzeCropImage(file),
      getUserGeolocation(),
    ]);

    setGeoCoords(geo);

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

  // --- Step 2: Validation & Submit ---
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!cropType) errors.cropType = "Please select a crop type";
    if (!sowingDate) errors.sowingDate = "Please select a sowing date";
    const area = parseFloat(areaHectares);
    if (!areaHectares.trim() || isNaN(area) || area <= 0) {
      errors.areaHectares = "Area must be greater than 0";
    } else if (area > 500) {
      errors.areaHectares = "Area cannot exceed 500 hectares";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = useCallback(() => {
    if (!result || !validateForm()) return;

    const claimId = addClaim({
      farmerName: FARMER_NAME,
      crop: cropType || result.crop,
      disease: result.disease,
      damagePct: result.damagePct,
      aiConfidence: result.aiConfidence,
      gpsLat: geoCoords?.lat ?? "Location Unavailable",
      gpsLng: geoCoords?.lng ?? "Location Unavailable",
      areaInHectares: parseFloat(areaHectares),
      sowingDate: sowingDate ? format(sowingDate, "dd/MM/yyyy") : "",
    });

    toast.success("Claim submitted successfully!", {
      description: `Your claim has been registered and is now pending review.`,
      duration: 5000,
    });

    // Reset wizard
    setTimeout(() => {
      setWizardStep(1);
      setPhase("idle");
      setImageUrl(null);
      setResult(null);
      setGeoCoords(null);
      setCropType("");
      setSowingDate(undefined);
      setAreaHectares("");
      setFormErrors({});
    }, 500);
  }, [addClaim, result, geoCoords, cropType, sowingDate, areaHectares]);

  const isStep2Valid = cropType && sowingDate && parseFloat(areaHectares) > 0;

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
        {/* Upload / AI / Wizard Section */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {wizardStep === 1 ? (
                <>
                  <Upload className="h-5 w-5 text-secondary" />
                  Step 1: AI Image Scan
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 text-secondary" />
                  Step 2: Farm Details
                </>
              )}
            </CardTitle>
            {/* Step indicator */}
            <div className="flex items-center gap-2 pt-2">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                wizardStep >= 1 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              )}>1</div>
              <div className={cn("h-0.5 flex-1 transition-colors", wizardStep >= 2 ? "bg-secondary" : "bg-muted")} />
              <div className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                wizardStep >= 2 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
              )}>2</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* ===== STEP 1: AI Image Scan ===== */}
            {wizardStep === 1 && (
              <>
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
                  <div className="relative overflow-hidden rounded-md">
                    <img src={imageUrl} alt="Crop being analyzed" className="w-full rounded-md object-cover opacity-60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/20">
                      <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                      <p className="mt-3 text-sm font-semibold text-foreground">Connecting to AI Server...</p>
                      <p className="mt-1 text-xs text-muted-foreground">Establishing secure connection</p>
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

                {phase === "result" && imageUrl && result && (
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

                      <Button
                        onClick={() => setWizardStep(2)}
                        className="mt-4 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      >
                        Next: Enter Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== STEP 2: Farm Details Form ===== */}
            {wizardStep === 2 && result && (
              <div className="space-y-5">
                {/* AI summary mini-card */}
                <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                  {imageUrl && (
                    <img src={imageUrl} alt="Crop" className="h-14 w-14 rounded-md object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{result.disease}</p>
                    <p className="text-xs text-muted-foreground">
                      Damage: {result.damagePct}% · Confidence: {result.aiConfidence}%
                    </p>
                  </div>
                  <Badge className="bg-secondary text-secondary-foreground text-[10px]">AI ✓</Badge>
                </div>

                {/* Crop Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="cropType" className="text-sm font-medium">
                    Crop Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={cropType} onValueChange={(v) => { setCropType(v); setFormErrors(prev => ({ ...prev, cropType: "" })); }}>
                    <SelectTrigger id="cropType" className={cn(formErrors.cropType && "border-destructive")}>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CROP_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.cropType && <p className="text-xs text-destructive">{formErrors.cropType}</p>}
                </div>

                {/* Sowing Date */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Sowing Date <span className="text-destructive">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !sowingDate && "text-muted-foreground",
                          formErrors.sowingDate && "border-destructive"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {sowingDate ? format(sowingDate, "dd/MM/yyyy") : "Select sowing date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={sowingDate}
                        onSelect={(d) => { setSowingDate(d); setFormErrors(prev => ({ ...prev, sowingDate: "" })); }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.sowingDate && <p className="text-xs text-destructive">{formErrors.sowingDate}</p>}
                </div>

                {/* Area in Hectares */}
                <div className="space-y-1.5">
                  <Label htmlFor="area" className="text-sm font-medium">
                    Total Farm Area (Hectares) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="area"
                    type="number"
                    min="0.1"
                    max="500"
                    step="0.1"
                    placeholder="e.g. 2.5"
                    value={areaHectares}
                    onChange={(e) => { setAreaHectares(e.target.value); setFormErrors(prev => ({ ...prev, areaHectares: "" })); }}
                    className={cn(formErrors.areaHectares && "border-destructive")}
                  />
                  {formErrors.areaHectares && <p className="text-xs text-destructive">{formErrors.areaHectares}</p>}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setWizardStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    onClick={handleSubmit}
                    disabled={!isStep2Valid}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Official Claim
                  </Button>
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
                {farmerClaims.map((claim) => {
                  const isExpanded = expandedClaim === claim.id;
                  return (
                    <div
                      key={claim.id}
                      className="rounded-md border bg-muted/30 transition-all"
                    >
                      <div className="flex items-center justify-between p-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{claim.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {claim.disease} · {claim.dateFiled}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            onClick={() => setExpandedClaim(isExpanded ? null : claim.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t px-3 pb-3">
                          <ClaimStepper claim={claim} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerDashboard;
