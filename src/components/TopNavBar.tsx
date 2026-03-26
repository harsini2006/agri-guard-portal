import { Shield, ChevronDown, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type UserRole = "farmer" | "officer" | "admin";

const roleLabels: Record<UserRole, string> = {
  farmer: "Farmer",
  officer: "Insurance Officer",
  admin: "Admin",
};

const notifications = [
  {
    id: 1,
    type: "warning" as const,
    message: "⚠️ Weather Advisory: Heavy rainfall expected in Lucknow district over the next 48 hours. Protect harvested crops.",
    date: "Today",
  },
  {
    id: 2,
    type: "success" as const,
    message: "✅ Claim CLM-1002 has been successfully verified by the Insurance Officer.",
    date: "Yesterday",
  },
];

interface TopNavBarProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const TopNavBar = ({ role, onRoleChange }: TopNavBarProps) => {
  return (
    <>
      {/* Tricolor stripe */}
      <div className="flex h-1">
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-card" />
        <div className="flex-1 bg-secondary" />
      </div>

      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 ring-2 ring-primary-foreground/30">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight md:text-lg">
                AgriGuard AI
              </h1>
              <p className="text-[11px] leading-tight opacity-80 md:text-xs">
                PMFBY Crop Insurance Analytics Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    2
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                </div>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-1 whitespace-normal px-3 py-3"
                  >
                    <p className="text-xs leading-relaxed text-foreground">{n.message}</p>
                    <span className="text-[10px] text-muted-foreground">{n.date}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                >
                  <span className="hidden sm:inline">Role:&nbsp;</span>
                  {roleLabels[role]}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(roleLabels) as UserRole[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => onRoleChange(r)}
                    className={r === role ? "bg-muted font-semibold" : ""}
                  >
                    {roleLabels[r]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNavBar;
