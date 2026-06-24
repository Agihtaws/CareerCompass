"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";
import { navItems } from "@/lib/nav";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-border bg-card lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col print:hidden">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Compass className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          CareerCompass
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center justify-between border-t border-border px-4 py-4">
        <span className="text-xs text-muted-foreground">Theme</span>
        <ModeToggle />
      </div>
    </aside>
  );
}