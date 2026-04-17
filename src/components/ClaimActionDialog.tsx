import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Claim } from "@/context/ClaimsContext";
import { useClaims } from "@/context/ClaimsContext";
import { toast } from "sonner";

interface Props {
  claim: Claim | null;
  action: "approve" | "reject" | null;
  onClose: () => void;
}

const REJECTION_PRESETS = [
  "Insufficient damage evidence in submitted image.",
  "Damage assessment inconsistent with field inspection.",
  "GPS coordinates outside insured plot boundary.",
  "Crop type does not match enrolment records.",
];

const ClaimActionDialog = ({ claim, action, onClose }: Props) => {
  const { approveClaim, rejectClaim } = useClaims();
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!claim) return;
    if (action === "approve") {
      approveClaim(claim.id);
      toast.success(`Claim ${claim.id} verified`, {
        description: `Payout of ₹${claim.estCompensation.toLocaleString("en-IN")} authorised for ${claim.farmerName}.`,
      });
    } else if (action === "reject") {
      const finalReason = reason.trim() || "Rejected after officer review.";
      rejectClaim(claim.id, finalReason);
      toast.warning(`Claim ${claim.id} rejected`, {
        description: finalReason,
      });
    }
    setReason("");
    onClose();
  };

  const handleCancel = () => {
    setReason("");
    onClose();
  };

  if (!claim || !action) return null;

  const isApprove = action === "approve";

  return (
    <AlertDialog open={!!claim} onOpenChange={(o) => !o && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="h-5 w-5 text-secondary" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {isApprove ? "Verify and approve claim?" : "Reject this claim?"}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 pt-2 text-sm">
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="font-mono text-xs font-semibold text-foreground">{claim.id}</p>
                <p className="text-foreground">
                  {claim.farmerName} · {claim.crop}
                </p>
                <p className="text-xs text-muted-foreground">
                  {claim.disease} · {claim.damagePct}% damage · AI {claim.aiConfidence}%
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Payout: <span className="font-semibold text-foreground">₹{claim.estCompensation.toLocaleString("en-IN")}</span>
                </p>
              </div>
              {isApprove ? (
                <p className="text-muted-foreground">
                  This will mark the claim as verified and authorise the compensation payout. This action is logged.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Provide a reason — it will be visible to the farmer and stored in the official record.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isApprove && (
          <div className="space-y-2">
            <Label htmlFor="reject-reason" className="text-sm">
              Rejection reason
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Damage assessment inconsistent with field inspection."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <div className="flex flex-wrap gap-1.5">
              {REJECTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {preset.slice(0, 32)}…
                </button>
              ))}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={
              isApprove
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
          >
            {isApprove ? "Confirm & Approve" : "Confirm Rejection"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClaimActionDialog;
