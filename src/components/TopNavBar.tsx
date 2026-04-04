import { useMemo } from "react";
import { Shield, ChevronDown, Bell, CloudRain, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useClaims } from "@/context/ClaimsContext";

export type UserRole = "farmer" | "officer" | "admin";

const roleLabels: Record<UserRole, string> = {
  farmer: "Farmer",
  officer: "Insurance Officer",
  admin: "Admin",
};

interface TopNavBarProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
}

interface Notification {
  id: string;
  icon: React.ReactNode;
  message: string;
  date: string;
  type: "success" | "warning" | "info";
}

const TopNavBar = ({ role, onRoleChange }: TopNavBarProps) => {
  const { claims } = useClaims();

  // Derive notifications from real claims data
  const notifications = useMemo<Notification[]>(() => {
    const notifs: Notification[] = [];

    // Find recently verified/rejected claims
    const verifiedClaims = claims
      .filter((c) => c.verifiedAt && (c.status === "approved" || c.status === "rejected"))
      .sort((a, b) => new Date(b.verifiedAt!).getTime() - new Date(a.verifiedAt!).getTime())
      .slice(0, 3);

    for (const c of verifiedClaims) {
      const verifiedDate = new Date(c.verifiedAt!);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24));
      const dateLabel = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;

      if (c.status === "approved") {
        notifs.push({
          id: `approved-${c.id}`,
          icon: <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />,
          message: `Claim ${c.id} (${c.farmerName} — ${c.crop}) has been successfully verified by the Insurance Officer.`,
          date: dateLabel,
          type: "success",
        });
      } else {
        notifs.push({
          id: `rejected-${c.id}`,
          icon: <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />,
          message: `Claim ${c.id} (${c.farmerName} — ${c.crop}) has been rejected. Please review for re-submission.`,
          date: dateLabel,
          type: "warning",
        });
      }
    }

    // Alert for high-damage pending claims
    const highDamagePending = claims
      .filter((c) => c.status === "pending" && c.damagePct >= 60)
      .slice(0, 2);

    for (const c of highDamagePending) {
      notifs.push({
        id: `urgent-${c.id}`,
        icon: <CloudRain className="h-4 w-4 text-accent shrink-0" />,
        message: `⚠️ High-damage alert: ${c.farmerName}'s ${c.crop} in ${c.district} shows ${c.damagePct}% damage. Urgent review recommended.`,
        date: "Action needed",
        type: "warning",
      });
    }

    return notifs.slice(0, 5);
  }, [claims]);

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
                  {notifications.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex items-start gap-2 whitespace-normal px-3 py-3"
                    >
                      {n.icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed text-foreground">{n.message}</p>
                        <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {n.date}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
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
