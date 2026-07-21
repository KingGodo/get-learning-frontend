"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { HeaderNotifications } from "@/components/layout/header-notifications";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type UserRole = "ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT";

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
      { href: "/users", label: "People", icon: Users },
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

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-page">
        <PageLoading label="Loading…" />
      </div>
    );
  }

  const roleLabel =
    user.role === "STUDENT"
      ? "Student"
      : user.role === "ADMIN"
        ? "System admin"
        : user.role === "SCHOOL_ADMIN"
          ? "School admin"
          : "Teacher";

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
            <p className="mb-2 px-3 text-[11px] font-medium tracking-wide text-zinc-400">
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
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-brand-light text-brand-dark"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-brand-dark",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0",
                        active ? "text-brand-dark" : "text-zinc-400",
                      )}
                      strokeWidth={1.5}
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
    <div className="flex min-h-[100svh] bg-page">
      <aside className="sticky top-0 hidden h-[100svh] w-[220px] shrink-0 flex-col border-r border-[#e8e8ed] bg-white md:flex">
        <div className="flex h-14 items-center px-5">
          <Link
            href="/dashboard"
            className="text-[15px] font-semibold tracking-[-0.02em] text-ink"
          >
            Learning Hub
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <NavLinks />
        </div>

        <div className="border-t border-[#e8e8ed] px-4 py-4">
          <Link href="/profile" className="block">
            <p className="truncate text-[13px] font-medium text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 text-[12px] text-[#86868b]">{roleLabel}</p>
          </Link>
          <button
            type="button"
            className="mt-3 flex items-center gap-2 text-[12px] text-[#86868b] transition-colors hover:text-ink"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            <LogOut className="size-3.5" strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e8e8ed] bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-lg border-[#d2d2d7]"
                    />
                  }
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-0 bg-white p-0 text-ink"
                >
                  <SheetHeader className="border-b border-[#e8e8ed] px-5 py-4">
                    <SheetTitle className="text-left text-[15px] font-semibold tracking-[-0.02em] text-ink">
                      Learning Hub
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-2 py-4">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
                {activeLink?.label ?? "Learning Hub"}
              </p>
              <p className="hidden text-[12px] text-[#86868b] sm:block">
                {user.school?.name ?? "Learning Hub"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HeaderNotifications />
            <Link
              href="/profile"
              className="flex size-8 items-center justify-center rounded-full bg-[#f5f5f7] text-[11px] font-semibold text-ink"
              aria-label={`${user.firstName} ${user.lastName}`}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
