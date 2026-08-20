"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  Building2,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  UserRound,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { HeaderNotifications } from "@/components/layout/header-notifications";
import { APP_NAME } from "@/lib/brand";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { roleThemeAttribute, themeForRole } from "@/lib/theme";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const adminNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Platform",
    items: [
      { href: "/users", label: "Users", icon: Users },
      { href: "/school", label: "Schools", icon: Building2 },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const schoolAdminNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "School",
    items: [
      { href: "/subjects", label: "Subjects", icon: Library },
      { href: "/classes", label: "Classes", icon: BookOpen },
      { href: "/users", label: "Users", icon: Users },
      { href: "/assignments", label: "Assignments", icon: ClipboardList },
      { href: "/school", label: "School", icon: Building2 },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const teacherNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Teaching",
    items: [
      { href: "/subjects", label: "Subjects", icon: Library },
      { href: "/classes", label: "Classes", icon: BookOpen },
      { href: "/assignments", label: "Assignments", icon: ClipboardList },
      { href: "/submissions", label: "Submissions", icon: ClipboardCheck },
    ],
  },
  {
    label: "School",
    items: [{ href: "/school", label: "School", icon: Building2 }],
  },
  {
    label: "Account",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const studentNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ href: "/dashboard", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Learning",
    items: [
      { href: "/classes", label: "Classes", icon: BookOpen },
      { href: "/assignments", label: "Assignments", icon: ClipboardList },
      { href: "/submissions", label: "Submissions", icon: ClipboardCheck },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/profile", label: "Profile", icon: UserRound },
    ],
  },
];

function navForRole(role: UserRole): NavGroup[] {
  if (role === "ADMIN") return adminNavGroups;
  if (role === "SCHOOL_ADMIN") return schoolAdminNavGroups;
  if (role === "TEACHER") return teacherNavGroups;
  return studentNavGroups;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-page">
        <PageLoading label="Loading…" />
      </div>
    );
  }

  const roleTheme = themeForRole(user.role);
  const roleLabel = roleTheme.label;
  const roleThemeAttr = roleThemeAttribute(user.role);

  const groups = navForRole(user.role);
  const flatLinks = groups.flatMap((g) => g.items);
  const activeLink = flatLinks.find(
    (link) =>
      pathname === link.href || pathname.startsWith(`${link.href}/`),
  );

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-medium tracking-[0.06em] text-slate-400 uppercase">
              {group.label}
            </p>
            <nav className="flex flex-col gap-0.5">
              {group.items.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => onNavigate?.()}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium ease-craft transition-colors duration-150",
                      active
                        ? "bg-brand-light text-brand"
                        : "text-slate-600 hover:bg-slate-50 hover:text-ink",
                    )}
                  >
                    {active ? (
                      <span
                        className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-brand"
                        aria-hidden
                      />
                    ) : null}
                    <Icon
                      className={cn(
                        "size-[17px] shrink-0",
                        active
                          ? "text-brand"
                          : "text-slate-400 group-hover:text-slate-600",
                      )}
                      strokeWidth={1.75}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[100svh] overflow-x-clip bg-page"
      data-role-theme={roleThemeAttr}
    >
      <aside className="sticky top-0 hidden h-[100svh] w-[240px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          <BrandMark href="/dashboard" size="sm" />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <NavLinks />
        </div>

        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-slate-50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-[11px] font-semibold text-brand">
              {user.firstName[0]}
              {user.lastName[0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-ink">
                {user.firstName} {user.lastName}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                {roleLabel}
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-slate-50 hover:text-ink"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            <LogOut className="size-3.5" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="md:hidden">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Open menu"
                    />
                  }
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="flex h-full w-[min(100vw-1.25rem,18rem)] flex-col gap-0 border-r border-border bg-background p-0"
                >
                  <SheetHeader className="border-b border-border px-4 py-4">
                    <SheetTitle className="text-left">
                      <BrandMark href={null} size="sm" />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
                    <NavLinks onNavigate={() => setMobileNavOpen(false)} />
                  </div>
                  <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <SheetClose
                      nativeButton={false}
                      render={
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-slate-50"
                        />
                      }
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-light text-[11px] font-semibold text-brand">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {roleLabel}
                        </span>
                      </span>
                    </SheetClose>
                    <button
                      type="button"
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-slate-50 hover:text-ink"
                      onClick={() => {
                        setMobileNavOpen(false);
                        logout();
                        router.replace("/");
                      }}
                    >
                      <LogOut className="size-3.5" strokeWidth={1.75} />
                      Sign out
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight text-ink">
                {activeLink?.label ?? APP_NAME}
              </p>
              <p className="hidden truncate text-[12px] text-muted-foreground sm:block">
                {user.school?.name ?? roleLabel}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              {roleLabel}
            </span>
            <HeaderNotifications />
            <Link
              href="/profile"
              className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-[11px] font-semibold text-ink transition-colors hover:bg-muted"
              aria-label={`${user.firstName} ${user.lastName}`}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
