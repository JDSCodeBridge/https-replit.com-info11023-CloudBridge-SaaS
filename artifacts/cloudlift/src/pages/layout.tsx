import { useAuth, useUser } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  GitBranch,
  Rocket,
  Zap,
  Settings,
  Shield,
  LogOut,
  Cloud,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: GitBranch },
  { href: "/launch", label: "Launch Center", icon: Rocket },
  { href: "/services", label: "Services", icon: Zap },
  { href: "/cloud-accounts", label: "Cloud Accounts", icon: Cloud },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <aside className="w-64 border-r border-border/40 bg-card/20 flex flex-col fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-border/40 flex items-center gap-3">
          <Link href="/dashboard">
            <Logo size="md" />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </a>
              </Link>
            );
          })}

          {user && (
            <Link href="/admin">
              <a className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all mt-4 ${
                location === "/admin"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}>
                <Shield className="w-4 h-4 shrink-0" />
                Admin
              </a>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border/40">
          {user && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <img
                src={user.imageUrl}
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-border object-cover shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate">{user.fullName || "User"}</span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs gap-2"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-[100dvh] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
