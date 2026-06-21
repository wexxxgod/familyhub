import dynamic from "next/dynamic";
import { FamilyGuard } from "@/components/layout/FamilyGuard";

const Sidebar = dynamic(() => import("@/components/layout/Sidebar").then((m) => ({ default: m.Sidebar })), { ssr: false });
const DashboardHeader = dynamic(() => import("@/components/layout/DashboardHeader").then((m) => ({ default: m.DashboardHeader })), { ssr: false });
const MobileNav = dynamic(() => import("@/components/layout/MobileNav").then((m) => ({ default: m.MobileNav })), { ssr: false });
const Toaster = dynamic(() => import("react-hot-toast").then((m) => ({ default: m.Toaster })));
const ServiceWorkerRegister = dynamic(() => import("@/components/shared/ServiceWorkerRegister").then((m) => ({ default: m.ServiceWorkerRegister })), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="blob-deco blob-1 max-lg:hidden" />
      <div className="blob-deco blob-2 max-lg:hidden" />
      <div className="blob-deco blob-3 max-lg:hidden" />
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
