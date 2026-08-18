import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  CalendarClock,
  LayoutDashboard,
  Mail,
  Menu,
  NotebookPen,
  Search,
  Settings,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { WorkmateLogo } from "@/components/workmate-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Notes Summarizer", icon: NotebookPen },
  { to: "/planner", label: "AI Task Planner", icon: CalendarClock },
  { to: "/research", label: "AI Research Assistant", icon: Search },
  { to: "/chat", label: "AI Workplace Chatbot", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-primary/15 text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} aria-hidden />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner() {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="flex items-center gap-3 px-1 py-1">
        <WorkmateLogo className="size-9 text-sidebar-primary" />
        <span className="flex flex-col leading-tight">
          <span className="font-display text-base font-semibold text-sidebar-accent-foreground">
            WorkMate AI
          </span>
          <span className="text-[11px] text-sidebar-foreground/70">Productivity platform</span>
        </span>
      </Link>
      <NavLinks />
      <div className="mt-auto rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3 text-[11px] leading-relaxed text-sidebar-foreground/80">
        Every AI output is a draft. Review it before it leaves your desk.
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-72 shrink-0 bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarInner />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-none bg-sidebar p-0">
                <SheetTitle className="sr-only">WorkMate AI navigation</SheetTitle>
                <SidebarInner />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
            </div>
            {actions}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
        </main>

        <footer className="px-4 pb-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <AiDisclaimer compact />
          </div>
        </footer>
      </div>
    </div>
  );
}
