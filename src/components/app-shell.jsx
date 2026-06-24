import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <MobileNav />
      <div className="lg:pl-64 print:pl-0">
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10 print:max-w-none print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}