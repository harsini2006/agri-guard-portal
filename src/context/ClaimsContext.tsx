import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { SEED_CLAIMS, STATE_CODES } from "@/data/seedClaims";

export interface Claim {
  id: string;
  farmerName: string;
  farmerId: string;
  crop: string;
  disease: string;
  damagePct: number;
  aiConfidence: number;
  status: "pending" | "approved" | "rejected";
  dateFiled: string;
  gpsLat: string;
  gpsLng: string;
  premiumPaid: number;
  estCompensation: number;
  district: string;
  state: string;
  areaInHectares: number;
  sowingDate: string;
  createdAt: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
}

// --- PMFBY-style financials ---
const PER_HECTARE_COVERAGE = 50000;
const PREMIUM_RATE = 0.02;

export function calculateFinancials(areaInHectares: number, damagePct: number) {
  const sumInsured = areaInHectares * PER_HECTARE_COVERAGE;
  const premiumPaid = Math.round(sumInsured * PREMIUM_RATE);
  const estCompensation = Math.round(sumInsured * (damagePct / 100));
  return { premiumPaid, estCompensation };
}

const STORAGE_KEY = "pmfby_claims";
const SUSPENDED_KEY = "pmfby_suspended_farmers";

let claimCounter = 1009;

function loadClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Claim[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const maxId = parsed.reduce((max, c) => {
          const num = parseInt(c.id.replace("CLM-", ""), 10);
          return num > max ? num : max;
        }, claimCounter);
        claimCounter = maxId;
        // Backfill rejectionReason for older saved claims
        return parsed.map((c) => ({ ...c, rejectionReason: c.rejectionReason ?? null }));
      }
    }
  } catch {
    // Corrupted data — fall back to seeds
  }
  return SEED_CLAIMS;
}

function loadSuspended(): string[] {
  try {
    const raw = localStorage.getItem(SUSPENDED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export type NewClaimData = Omit<Claim, "id" | "status" | "dateFiled" | "farmerId" | "premiumPaid" | "estCompensation" | "createdAt" | "verifiedAt" | "rejectionReason">;

interface ClaimsContextType {
  claims: Claim[];
  suspendedFarmerIds: string[];
  addClaim: (claim: NewClaimData) => string; // returns generated claim ID
  approveClaim: (id: string) => void;
  rejectClaim: (id: string, reason: string) => void;
  toggleSuspendFarmer: (farmerId: string) => boolean; // returns new suspended state
  resetDemoData: () => void;
}

const ClaimsContext = createContext<ClaimsContextType | null>(null);

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(loadClaims);
  const [suspendedFarmerIds, setSuspendedFarmerIds] = useState<string[]>(loadSuspended);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
    } catch { /* ignore */ }
  }, [claims]);

  useEffect(() => {
    try {
      localStorage.setItem(SUSPENDED_KEY, JSON.stringify(suspendedFarmerIds));
    } catch { /* ignore */ }
  }, [suspendedFarmerIds]);

  const addClaim = useCallback((data: NewClaimData): string => {
    claimCounter += 1;
    const now = new Date();
    const stateCode = STATE_CODES[data.state] || "XX";
    const { premiumPaid, estCompensation } = calculateFinancials(data.areaInHectares, data.damagePct);
    const id = `CLM-${String(claimCounter).padStart(4, "0")}`;

    const newClaim: Claim = {
      ...data,
      id,
      farmerId: `PMFBY-${stateCode}-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "pending",
      dateFiled: now.toLocaleDateString("en-IN"),
      premiumPaid,
      estCompensation,
      createdAt: now.toISOString(),
      verifiedAt: null,
      rejectionReason: null,
    };
    setClaims((prev) => [newClaim, ...prev]);
    return id;
  }, []);

  const approveClaim = useCallback((id: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "approved" as const, verifiedAt: new Date().toISOString(), rejectionReason: null }
          : c
      )
    );
  }, []);

  const rejectClaim = useCallback((id: string, reason: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: "rejected" as const, verifiedAt: new Date().toISOString(), rejectionReason: reason }
          : c
      )
    );
  }, []);

  const toggleSuspendFarmer = useCallback((farmerId: string): boolean => {
    let nowSuspended = false;
    setSuspendedFarmerIds((prev) => {
      if (prev.includes(farmerId)) {
        nowSuspended = false;
        return prev.filter((id) => id !== farmerId);
      }
      nowSuspended = true;
      return [...prev, farmerId];
    });
    return nowSuspended;
  }, []);

  const resetDemoData = useCallback(() => {
    setClaims(SEED_CLAIMS);
    setSuspendedFarmerIds([]);
    claimCounter = 1009;
  }, []);

  return (
    <ClaimsContext.Provider value={{ claims, suspendedFarmerIds, addClaim, approveClaim, rejectClaim, toggleSuspendFarmer, resetDemoData }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used within ClaimsProvider");
  return ctx;
};
