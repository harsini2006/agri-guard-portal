import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

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
  // New expanded schema fields
  areaInHectares: number;
  sowingDate: string;
  createdAt: string;
  verifiedAt: string | null;
}

const STORAGE_KEY = "pmfby_claims";

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
    areaInHectares: 2.5,
    sowingDate: "15/06/2025",
    createdAt: "2026-03-18T10:30:00Z",
    verifiedAt: null,
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
    areaInHectares: 1.8,
    sowingDate: "01/11/2025",
    createdAt: "2026-03-12T09:15:00Z",
    verifiedAt: "2026-03-14T14:20:00Z",
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
    areaInHectares: 3.2,
    sowingDate: "20/06/2025",
    createdAt: "2026-03-15T11:45:00Z",
    verifiedAt: null,
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
    areaInHectares: 1.5,
    sowingDate: "10/07/2025",
    createdAt: "2026-03-08T08:00:00Z",
    verifiedAt: "2026-03-10T16:30:00Z",
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
    areaInHectares: 2.0,
    sowingDate: "05/11/2025",
    createdAt: "2026-03-05T07:30:00Z",
    verifiedAt: "2026-03-07T12:00:00Z",
  },
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
    areaInHectares: 1.6,
    sowingDate: "12/07/2025",
    createdAt: "2026-03-20T10:00:00Z",
    verifiedAt: null,
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
    areaInHectares: 2.1,
    sowingDate: "08/11/2025",
    createdAt: "2026-03-21T09:30:00Z",
    verifiedAt: null,
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
    areaInHectares: 3.5,
    sowingDate: "18/06/2025",
    createdAt: "2026-03-22T11:15:00Z",
    verifiedAt: null,
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
    areaInHectares: 1.8,
    sowingDate: "01/11/2025",
    createdAt: "2026-03-23T08:45:00Z",
    verifiedAt: null,
  },
];

let claimCounter = 1009;

function loadClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Claim[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Update counter based on stored data
        const maxId = parsed.reduce((max, c) => {
          const num = parseInt(c.id.replace("CLM-", ""), 10);
          return num > max ? num : max;
        }, claimCounter);
        claimCounter = maxId;
        return parsed;
      }
    }
  } catch {
    // Corrupted data — fall back to seeds
  }
  return SEED_CLAIMS;
}

function saveClaims(claims: Claim[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  } catch {
    // Storage full or unavailable — silent fail
  }
}

interface ClaimsContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, "id" | "status" | "dateFiled" | "farmerId" | "premiumPaid" | "estCompensation" | "district" | "state" | "createdAt" | "verifiedAt">) => void;
  updateClaimStatus: (id: string, status: "approved" | "rejected") => void;
}

const ClaimsContext = createContext<ClaimsContextType | null>(null);

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(loadClaims);

  // Sync to localStorage on every change
  useEffect(() => {
    saveClaims(claims);
  }, [claims]);

  const addClaim = useCallback(
    (data: Omit<Claim, "id" | "status" | "dateFiled" | "farmerId" | "premiumPaid" | "estCompensation" | "district" | "state" | "createdAt" | "verifiedAt">) => {
      claimCounter += 1;
      const now = new Date();
      const newClaim: Claim = {
        ...data,
        id: `CLM-${String(claimCounter).padStart(4, "0")}`,
        farmerId: `PMFBY-KA-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "pending",
        dateFiled: now.toLocaleDateString("en-IN"),
        premiumPaid: 1200,
        estCompensation: 15000,
        district: "Bengaluru Rural",
        state: "Karnataka",
        createdAt: now.toISOString(),
        verifiedAt: null,
      };
      setClaims((prev) => [newClaim, ...prev]);
    },
    []
  );

  const updateClaimStatus = useCallback(
    (id: string, status: "approved" | "rejected") => {
      setClaims((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, status, verifiedAt: new Date().toISOString() }
            : c
        )
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
