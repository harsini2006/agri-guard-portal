import { Upload, Cpu, FileSearch, CheckCircle, Clock } from "lucide-react";
import type { Claim } from "@/context/ClaimsContext";

interface Props {
  claim: Claim;
}

const STEPS = [
  { label: "Image Uploaded", icon: Upload },
  { label: "AI Analyzed", icon: Cpu },
  { label: "Under Review", icon: FileSearch },
  { label: "Compensation Processed", icon: CheckCircle },
];

const getActiveStep = (status: Claim["status"]): number => {
  if (status === "approved") return 4;
  if (status === "rejected") return 3;
  return 3; // pending → step 3 is active
};

const ClaimStepper = ({ claim }: Props) => {
  const activeStep = getActiveStep(claim.status);

  return (
    <div className="flex items-start justify-between gap-1 px-2 py-3">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const completed = stepNum < activeStep;
        const active = stepNum === activeStep && claim.status === "pending";
        const rejected = stepNum === 3 && claim.status === "rejected";
        const pending = stepNum >= activeStep && !active && !completed && !rejected;

        const Icon = step.icon;

        let circleClass = "bg-muted text-muted-foreground";
        let labelClass = "text-muted-foreground";
        let lineClass = "bg-muted";

        if (completed) {
          circleClass = "bg-secondary text-secondary-foreground";
          lineClass = "bg-secondary";
          labelClass = "text-secondary";
        } else if (active) {
          circleClass = "bg-accent text-accent-foreground";
          labelClass = "text-accent";
        } else if (rejected) {
          circleClass = "bg-destructive text-destructive-foreground";
          labelClass = "text-destructive";
        }

        return (
          <div key={step.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={`h-0.5 flex-1 ${completed ? "bg-secondary" : "bg-muted"}`} />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${circleClass} transition-colors`}
              >
                {active ? (
                  <Clock className="h-4 w-4 animate-pulse" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 ${completed ? lineClass : "bg-muted"}`} />
              )}
            </div>
            <span className={`text-center text-[10px] font-medium leading-tight ${labelClass}`}>
              {rejected && stepNum === 3 ? "Rejected" : step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ClaimStepper;
