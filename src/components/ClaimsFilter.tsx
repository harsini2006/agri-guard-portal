import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { Claim } from "@/context/ClaimsContext";

interface Props {
  claims: Claim[];
  onFiltered: (filtered: Claim[]) => void;
}

const ClaimsFilter = ({ claims, onFiltered }: Props) => {
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");

  const cropTypes = Array.from(new Set(claims.map((c) => c.crop))).sort();

  const applyFilters = (searchVal: string, crop: string) => {
    let filtered = claims;
    if (searchVal.trim()) {
      const q = searchVal.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.farmerName.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      );
    }
    if (crop !== "all") {
      filtered = filtered.filter((c) => c.crop === crop);
    }
    onFiltered(filtered);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    applyFilters(val, cropFilter);
  };

  const handleCrop = (val: string) => {
    setCropFilter(val);
    applyFilters(search, val);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by Farmer Name or Claim ID..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={cropFilter} onValueChange={handleCrop}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Crops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Crops</SelectItem>
            {cropTypes.map((crop) => (
              <SelectItem key={crop} value={crop}>
                {crop}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ClaimsFilter;
