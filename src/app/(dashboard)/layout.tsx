import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { FamilyGuard } from "@/components/layout/FamilyGuard";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="blob-deco blob-1" />
      <div className="blob-deco blob-2" />
      <div className="blob-deco blob-3" />
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: "12px", background: "var(--accent)", color: "var(--foreground)", fontSize: "14px" },
      }} />
      <ServiceWorkerRegister />
      <FamilyGuard>
        <Sidebar />
        <div className="lg:pl-[240px]">
          <DashboardHeader />
          <main className="pb-24 lg:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
        <div className="lg:hidden h-[env(safe-area-inset-bottom,0px)]" />
      </FamilyGuard>
    </div>
  );
}
