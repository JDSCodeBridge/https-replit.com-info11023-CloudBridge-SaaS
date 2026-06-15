import { useState } from "react";
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
  Server,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/repositories", label: "Repositories", icon: GitBranch },
  { href: "/deployments", label: "Deployments", icon: Server },
  { href: "/launch", label: "Launch Center", icon: Rocket },
  { href: "/services", label: "Services", icon: Zap },
  { href: "/cloud-accounts", label: "Cloud Accounts", icon: Cloud },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setMobileOpen(false);

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Mobile top bar */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-border/40 bg-background/95 backdrop-blur-md md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/40"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" onClick={close}>
          <Logo size="sm" />
        </Link>
      </header>

      {/* Sidebar */}
      <aside
        className={`w-64 border-r border-border/40 bg-card/20 flex flex-col fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-border/40 flex items-center justify-between gap-2">
          <Link href="/dashboard" onClick={close}>
            <Logo size="md" />
          </Link>
          <button
            onClick={close}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}

          {user && (
            <Link
              href="/admin"
              onClick={close}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all mt-4 ${
                location === "/admin"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              Admin
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

      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 min-h-[100dvh] overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
