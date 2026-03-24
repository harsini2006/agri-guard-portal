import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
}

const SEED_CLAIMS: Claim[] = [
  {
    id: "CLM-1001",
    farmerName: "Suresh Patel",
    farmerId: "PMFBY-MH-44821",
    crop: "Soybean",
    disease: "Pest Infestation (Spodoptera)",
    damagePct: 62,
    aiConfidence: 91,
    status: "pending",
    dateFiled: "18/03/2026",
    gpsLat: "19.8762",
    gpsLng: "75.3433",
    premiumPaid: 1800,
    estCompensation: 24000,
    district: "Latur",
    state: "Maharashtra",
  },
  {
    id: "CLM-1002",
    farmerName: "Anita Devi",
    farmerId: "PMFBY-UP-73019",
    crop: "Wheat",
    disease: "Wheat Rust (Puccinia triticina)",
    damagePct: 38,
    aiConfidence: 94,
    status: "approved",
    dateFiled: "12/03/2026",
    gpsLat: "26.8467",
    gpsLng: "80.9462",
    premiumPaid: 1200,
    estCompensation: 15000,
    district: "Lucknow",
    state: "Uttar Pradesh",
  },
  {
    id: "CLM-1003",
    farmerName: "Rajendra Singh",
    farmerId: "PMFBY-RJ-55204",
    crop: "Cotton",
    disease: "Localized Hail Damage",
    damagePct: 75,
    aiConfidence: 88,
    status: "pending",
    dateFiled: "15/03/2026",
    gpsLat: "25.2138",
    gpsLng: "73.7125",
    premiumPaid: 2400,
    estCompensation: 35000,
    district: "Jodhpur",
    state: "Rajasthan",
  },
  {
    id: "CLM-1004",
    farmerName: "Lakshmi Narayanan",
    farmerId: "PMFBY-TN-68102",
    crop: "Paddy",
    disease: "Paddy Leaf Blast",
    damagePct: 50,
    aiConfidence: 96,
    status: "rejected",
    dateFiled: "08/03/2026",
    gpsLat: "10.7905",
    gpsLng: "78.7047",
    premiumPaid: 1500,
    estCompensation: 18000,
    district: "Trichy",
    state: "Tamil Nadu",
  },
  {
    id: "CLM-1005",
    farmerName: "Baldev Kaur",
    farmerId: "PMFBY-PB-30457",
    crop: "Wheat",
    disease: "Pest Infestation (Aphids)",
    damagePct: 28,
    aiConfidence: 90,
    status: "approved",
    dateFiled: "05/03/2026",
    gpsLat: "30.9010",
    gpsLng: "75.8573",
    premiumPaid: 1100,
    estCompensation: 12000,
    district: "Ludhiana",
    state: "Punjab",
  },
  // 4 new pending claims
  {
    id: "CLM-1006",
    farmerName: "Ramesh Kumar",
    farmerId: "PMFBY-UP-73020",
    crop: "Paddy",
    disease: "Paddy Leaf Blast",
    damagePct: 45,
    aiConfidence: 92,
    status: "pending",
    dateFiled: "20/03/2026",
    gpsLat: "26.4499",
    gpsLng: "80.3319",
    premiumPaid: 1400,
    estCompensation: 20000,
    district: "Kanpur",
    state: "Uttar Pradesh",
  },
  {
    id: "CLM-1007",
    farmerName: "Sunita Patel",
    farmerId: "PMFBY-MP-44012",
    crop: "Wheat",
    disease: "Wheat Rust",
    damagePct: 38,
    aiConfidence: 94,
    status: "pending",
    dateFiled: "21/03/2026",
    gpsLat: "23.2599",
    gpsLng: "77.4126",
    premiumPaid: 1300,
    estCompensation: 16000,
    district: "Bhopal",
    state: "Madhya Pradesh",
  },
  {
    id: "CLM-1008",
    farmerName: "Vikram Singh",
    farmerId: "PMFBY-RJ-99045",
    crop: "Cotton",
    disease: "Cotton Aphids",
    damagePct: 60,
    aiConfidence: 89,
    status: "pending",
    dateFiled: "22/03/2026",
    gpsLat: "26.9124",
    gpsLng: "70.9000",
    premiumPaid: 2200,
    estCompensation: 30000,
    district: "Barmer",
    state: "Rajasthan",
  },
  {
    id: "CLM-1009",
    farmerName: "Anita Devi",
    farmerId: "PMFBY-UP-73019",
    crop: "Wheat",
    disease: "Yellow Rust",
    damagePct: 80,
    aiConfidence: 95,
    status: "pending",
    dateFiled: "23/03/2026",
    gpsLat: "26.8467",
    gpsLng: "80.9462",
    premiumPaid: 1200,
    estCompensation: 22000,
    district: "Lucknow",
    state: "Uttar Pradesh",
  },
];

let claimCounter = 1009;

interface ClaimsContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, "id" | "status" | "dateFiled" | "farmerId" | "gpsLat" | "gpsLng" | "premiumPaid" | "estCompensation" | "district" | "state">) => void;
  updateClaimStatus: (id: string, status: "approved" | "rejected") => void;
}

const ClaimsContext = createContext<ClaimsContextType | null>(null);

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(SEED_CLAIMS);

  const addClaim = useCallback(
    (data: Omit<Claim, "id" | "status" | "dateFiled" | "farmerId" | "gpsLat" | "gpsLng" | "premiumPaid" | "estCompensation" | "district" | "state">) => {
      claimCounter += 1;
      const newClaim: Claim = {
        ...data,
        id: `CLM-${String(claimCounter).padStart(4, "0")}`,
        farmerId: `PMFBY-KA-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "pending",
        dateFiled: new Date().toLocaleDateString("en-IN"),
        gpsLat: (12.9 + Math.random() * 0.5).toFixed(4),
        gpsLng: (77.5 + Math.random() * 0.5).toFixed(4),
        premiumPaid: 1200,
        estCompensation: 15000,
        district: "Bengaluru Rural",
        state: "Karnataka",
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
