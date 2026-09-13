"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePoundSterling,
  BriefcaseBusiness,
  FolderTree,
  FileText,
  LibraryBig,
  MessageSquareQuote,
  Newspaper,
  Search,
  Settings2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const contentItems = [
  { title: "Website Content", href: "/admin", icon: FileText },
  { title: "Services", href: "/admin/services", icon: BriefcaseBusiness },
  {
    title: "Service Pages",
    href: "/admin/service-pages",
    icon: FolderTree,
  },
  { title: "Fees", href: "/admin/fees", icon: BadgePoundSterling },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquareQuote,
  },
  { title: "Blog Posts", href: "/admin/blog-posts", icon: Newspaper },
  {
    title: "Blog Categories",
    href: "/admin/blog-categories",
    icon: LibraryBig,
  },
];

const configurationItems = [
  { title: "SEO Metadata", href: "/admin/seo-metadata", icon: Search },
  {
    title: "Site Settings",
    href: "/admin/site-settings",
    icon: Settings2,
  },
];

type NavItem = (typeof contentItems)[number] | (typeof configurationItems)[number];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            aria-label="John Violaris CMS home"
            className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground"
          >
            JV
          </Link>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-display text-sm font-semibold">
              John Violaris
            </p>
            <p className="truncate text-[10px] tracking-[0.16em] text-sidebar-foreground/55 uppercase">
              Website CMS
            </p>
          </div>
          <SidebarTrigger className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup
          label="Content"
          items={contentItems}
          pathname={pathname}
        />
        <NavGroup
          label="Configuration"
          items={configurationItems}
          pathname={pathname}
        />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                >
                  <Link href={item.href}>
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
