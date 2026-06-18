import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { FamilyGuard } from "@/components/layout/FamilyGuard";
import { Toaster } from "react-hot-toast";
import { ServiceWorkerRegister } from "@/components/shared/ServiceWorkerRegister";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { borderRadius: "12px", background: "var(--accent)", color: "var(--foreground)", fontSize: "14px" },
      }} />
      <ServiceWorkerRegister />
      <FamilyGuard>
        <Sidebar />
        <div className="lg:pl-[240px]">
          <DashboardHeader />
          <main className="pb-20 lg:pb-8">
            {children}
          </main>
        </div>
        <MobileNav />
      </FamilyGuard>
    </div>
  );
}
