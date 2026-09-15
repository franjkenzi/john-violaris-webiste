import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireAdmin } from "@/lib/auth";
import { countNewEnquiries } from "@/lib/enquiries/queries";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const newEnquiryCount = await countNewEnquiries();

  return (
    <TooltipProvider>
      <SidebarProvider className="admin-surface">
        <AdminSidebar newEnquiryCount={newEnquiryCount} />
        <SidebarInset className="min-h-svh bg-background">
          <div className="fixed top-3 left-3 z-20 md:hidden">
            <SidebarTrigger className="border bg-background shadow-sm" />
          </div>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
