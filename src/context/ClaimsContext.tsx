import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Claim {
  id: string;
  farmerName: string;
  crop: string;
  disease: string;
  damagePct: number;
  aiConfidence: number;
  status: "pending" | "approved" | "rejected";
  dateFiled: string;
}

interface ClaimsContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, "id" | "status" | "dateFiled">) => void;
  updateClaimStatus: (id: string, status: "approved" | "rejected") => void;
}

const ClaimsContext = createContext<ClaimsContextType | null>(null);

let claimCounter = 0;

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>([]);

  const addClaim = useCallback(
    (data: Omit<Claim, "id" | "status" | "dateFiled">) => {
      claimCounter += 1;
      const newClaim: Claim = {
        ...data,
        id: `CLM-${String(claimCounter).padStart(4, "0")}`,
        status: "pending",
        dateFiled: new Date().toLocaleDateString("en-IN"),
      };
      setClaims((prev) => [newClaim, ...prev]);
    },
    []
  );

  const updateClaimStatus = useCallback(
    (id: string, status: "approved" | "rejected") => {
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    },
    []
  );

  return (
    <ClaimsContext.Provider value={{ claims, addClaim, updateClaimStatus }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used within ClaimsProvider");
  return ctx;
};
