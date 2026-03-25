import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Calendar, User, IndianRupee, Cpu, Download } from "lucide-react";
import type { Claim } from "@/context/ClaimsContext";

interface Props {
  claim: Claim | null;
  open: boolean;
  onClose: () => void;
}

const ClaimReportModal = ({ claim, open, onClose }: Props) => {
  const now = new Date();

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (!claim) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="print-report max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        {/* Official header */}
        <div className="bg-primary px-6 py-4 text-primary-foreground">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10 ring-2 ring-primary-foreground/30">
                <Shield className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold text-primary-foreground">
                  PMFBY Official Claim Report
                </DialogTitle>
                <p className="text-xs opacity-80">
                  Pradhan Mantri Fasal Bima Yojana — Government of India
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="print-hide text-primary-foreground hover:bg-primary-foreground/10"
                onClick={handlePrint}
              >
                <Download className="mr-1 h-4 w-4" />
                PDF
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Tricolor line */}
        <div className="flex h-1">
          <div className="flex-1 bg-accent" />
          <div className="flex-1 bg-card" />
          <div className="flex-1 bg-secondary" />
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Meta row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Generated: {now.toLocaleDateString("en-IN")},{" "}
              {now.toLocaleTimeString("en-IN")}
            </span>
            <span className="font-mono font-semibold text-foreground">
              Ref: {claim.id}
            </span>
          </div>

          <Separator />

          {/* Farmer Details */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <User className="h-4 w-4 text-secondary" />
              Farmer Details
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Farmer Name" value={claim.farmerName} />
              <Field label="Farmer ID" value={claim.farmerId} />
              <Field label="District" value={claim.district} />
              <Field label="State" value={claim.state} />
            </div>
          </section>

          <Separator />

          {/* GPS & Location */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <MapPin className="h-4 w-4 text-destructive" />
              Geo-tagged Location
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Latitude" value={claim.gpsLat} />
              <Field label="Longitude" value={claim.gpsLng} />
              <Field label="Date Filed" value={claim.dateFiled} />
              <Field label="Crop Type" value={claim.crop} />
            </div>
          </section>

          <Separator />

          {/* AI Analysis */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <Cpu className="h-4 w-4 text-accent" />
              AI Analysis Summary
            </h3>
            <div className="rounded-md border bg-muted/40 p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Disease / Damage
                  </p>
                  <p className="mt-1 text-sm font-bold text-destructive">
                    {claim.disease}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Damage Severity
                  </p>
                  <p className="mt-1 text-sm font-bold text-accent">
                    {claim.damagePct}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">
                    AI Confidence
                  </p>
                  <p className="mt-1 text-sm font-bold text-secondary">
                    {claim.aiConfidence}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Premium Details */}
          <section>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <IndianRupee className="h-4 w-4 text-secondary" />
              Premium &amp; Compensation
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field
                label="Premium Paid"
                value={`₹${claim.premiumPaid.toLocaleString("en-IN")}`}
              />
              <Field
                label="Est. Compensation"
                value={`₹${claim.estCompensation.toLocaleString("en-IN")}`}
                highlight
              />
            </div>
          </section>

          <Separator />

          {/* Footer */}
          <div className="rounded-md bg-muted/50 p-3 text-center text-[11px] text-muted-foreground">
            This is a system-generated report from the AgriGuard AI — PMFBY
            Analytics Portal. This document is for official use only under the
            Pradhan Mantri Fasal Bima Yojana scheme, Government of India.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="rounded-md bg-muted/30 px-3 py-2">
    <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    <p
      className={`mt-0.5 font-semibold ${
        highlight ? "text-secondary" : "text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);

export default ClaimReportModal;
