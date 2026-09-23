"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  BadgePoundSterling,
  BriefcaseBusiness,
  FolderTree,
  FileText,
  House,
  Inbox,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  MessageSquareQuote,
  Newspaper,
  Search,
  Settings2,
  type LucideIcon,
} from "lucide-react";

import {
  SidebarFooter,
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
import { signOut } from "@/app/auth/actions";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /**
   * A `<SidebarMenuBadge>` rendered beside the link. A node rather than a
   * number so the layout can stream it in — the sidebar paints without waiting
   * on a count query.
   */
  badge?: ReactNode;
};

const overviewItems: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
];

const contentItems: NavItem[] = [
  { title: "Website Content", href: "/admin/website-content", icon: FileText },
  { title: "Services", href: "/admin/services", icon: BriefcaseBusiness },
  { title: "Service Pages", href: "/admin/service-pages", icon: FolderTree },
  { title: "Fees", href: "/admin/fees", icon: BadgePoundSterling },
  {
    title: "Reviews",
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

const configurationItems: NavItem[] = [
  { title: "SEO Metadata", href: "/admin/seo-metadata", icon: Search },
  { title: "Site Settings", href: "/admin/site-settings", icon: Settings2 },
];

export function AdminSidebar({
  enquiryBadge,
}: {
  /** Unactioned enquiry count, streamed in by the layout. */
  enquiryBadge?: ReactNode;
}) {
  const pathname = usePathname();

  const inboxItems: NavItem[] = [
    {
      title: "Enquiries",
      href: "/admin/enquiries",
      icon: Inbox,
      badge: enquiryBadge,
    },
  ];

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
        <NavGroup label="Overview" items={overviewItems} pathname={pathname} />
        <NavGroup label="Inbox" items={inboxItems} pathname={pathname} />
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to website">
              <Link href="/">
                <House aria-hidden="true" />
                <span>Back to website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={signOut}>
              <SidebarMenuButton
                type="submit"
                className="w-full"
                tooltip="Log out"
              >
                <LogOut aria-hidden="true" />
                <span>Log out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
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
                {item.badge}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
