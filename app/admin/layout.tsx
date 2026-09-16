import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarMenuBadge,
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

  return (
    <TooltipProvider>
      <SidebarProvider className="admin-surface">
        {/* The badge count is streamed rather than awaited here. Anything the
            layout waits for delays the page nested inside it, and a number on a
            sidebar link is not worth holding an enquiry back for. */}
        <AdminSidebar
          enquiryBadge={
            <Suspense fallback={null}>
              <NewEnquiryBadge />
            </Suspense>
          }
        />
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

async function NewEnquiryBadge() {
  const count = await countNewEnquiries();

  if (count === 0) return null;

  return (
    <SidebarMenuBadge>
      {count}
      <span className="sr-only"> awaiting a reply</span>
    </SidebarMenuBadge>
  );
}
