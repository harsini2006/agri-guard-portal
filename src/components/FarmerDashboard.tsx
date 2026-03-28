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
import { analyzeImagePixels, type PixelAnalysisResult } from "@/services/pixelAnalysis";
import { getUserGeolocation } from "@/services/aiService";
import ClaimStepper from "@/components/ClaimStepper";

type Phase = "idle" | "analyzing" | "scanning" | "result";
type WizardStep = 1 | 2;

const FARMER_NAME = "Ramesh Kumar";
const CROP_OPTIONS = ["Paddy", "Wheat", "Cotton", "Soybean"] as const;

const FarmerDashboard = () => {
  const { claims, addClaim } = useClaims();

  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PixelAnalysisResult | null>(null);
  const [geoCoords, setGeoCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Crop type is now required BEFORE scan
  const [cropType, setCropType] = useState("");
  // Step 2 form state
  const [sowingDate, setSowingDate] = useState<Date | undefined>();
  const [areaHectares, setAreaHectares] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const startAnalysis = useCallback(
    async (file: File) => {
      if (!cropType) {
        toast.error("Please select a crop type before uploading.");
        return;
      }

      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setPhase("analyzing");
      setProgress(0);

      try {
        const [pixelResult, geo] = await Promise.all([
          analyzeImagePixels(file, cropType as "Paddy" | "Wheat" | "Cotton" | "Soybean"),
          getUserGeolocation(),
        ]);

        setGeoCoords(geo);

        // Scanning animation for 2 seconds
        setPhase("scanning");
        setProgress(0);
        const duration = 2000;
        const interval = 50;
        let elapsed = 0;

        const timer = setInterval(() => {
          elapsed += interval;
          setProgress(Math.min((elapsed / duration) * 100, 100));
          if (elapsed >= duration) {
            clearInterval(timer);
            setResult(pixelResult);
            setPhase("result");
          }
        }, interval);
      } catch (error) {
        console.error("[FarmerDashboard] Pixel analysis failed:", error);
        toast.error("Analysis Error", {
          description: "Failed to process the image. Please try uploading again.",
          duration: 5000,
        });
        setPhase("idle");
        setImageUrl(null);
      }
    },
    [cropType]
  );

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
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

    addClaim({
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

  const isStep2Valid = sowingDate && parseFloat(areaHectares) > 0;

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
                {/* Crop type selector — required before upload */}
                {phase === "idle" && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cropTypeStep1" className="text-sm font-medium">
                        Crop Type <span className="text-destructive">*</span>
                      </Label>
                      <Select value={cropType} onValueChange={setCropType}>
                        <SelectTrigger id="cropTypeStep1">
                          <SelectValue placeholder="Select crop type first" />
                        </SelectTrigger>
                        <SelectContent>
                          {CROP_OPTIONS.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!cropType && (
                        <p className="text-xs text-muted-foreground">
                          Select crop type to enable image upload
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (!cropType) {
                          toast.error("Please select a crop type before uploading.");
                          return;
                        }
                        fileRef.current?.click();
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        if (!cropType) {
                          e.preventDefault();
                          toast.error("Please select a crop type before uploading.");
                          return;
                        }
                        handleDrop(e);
                      }}
                      className={cn(
                        "group flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed py-12 transition-colors",
                        cropType
                          ? "border-border bg-muted/50 hover:border-secondary hover:bg-secondary/5"
                          : "border-muted bg-muted/20 opacity-60 cursor-not-allowed"
                      )}
                    >
                      <Upload className={cn(
                        "mb-3 h-10 w-10 transition-colors",
                        cropType ? "text-muted-foreground group-hover:text-secondary" : "text-muted-foreground/50"
                      )} />
                      <p className="text-sm font-medium text-muted-foreground">
                        {cropType ? "Drag & drop or click to upload" : "Select crop type above first"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        JPG, PNG up to 10 MB
                      </p>
                    </button>
                  </div>
                )}

                {phase === "analyzing" && imageUrl && (
                  <div className="relative overflow-hidden rounded-md">
                    <img src={imageUrl} alt="Crop being analyzed" className="w-full rounded-md object-cover opacity-60" />
                    <div className="animate-scan-line absolute left-0 h-1 w-full bg-gradient-to-r from-transparent via-secondary to-transparent shadow-[0_0_15px_hsl(var(--secondary)),0_0_30px_hsl(var(--secondary)/0.5)]" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/30 backdrop-blur-[1px]">
                      <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                      <p className="mt-3 text-sm font-semibold text-foreground">Analyzing Pixel Data...</p>
                      <p className="mt-1 text-xs text-muted-foreground">Processing RGB channels for {cropType} disease markers</p>
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
                        Running Canvas Pixel Analysis...
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Classifying healthy vs damaged pixels for {cropType}
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
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Pixel Analysis Complete
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

                      {/* Pixel stats */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📊 {result.pixelsAnalyzed.toLocaleString()} pixels analyzed</span>
                        <span className="text-secondary">🟢 {result.healthyPixels.toLocaleString()} healthy</span>
                        <span className="text-destructive">🔴 {result.damagedPixels.toLocaleString()} damaged</span>
                      </div>

                      {geoCoords && (
                        <p className="mt-2 text-xs text-muted-foreground">
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

                {/* Crop type display (already selected in Step 1) */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Crop Type</Label>
                  <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground">
                    {cropType}
                  </div>
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
