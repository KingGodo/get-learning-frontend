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

type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

/** System owner: platform ops only — not classroom workflows */
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

/** Teacher order follows teaching flow: subjects → classes → assignments → submissions */
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
      <div className="flex min-h-[100svh] items-center justify-center bg-[#f6f7f9]">
        <PageLoading label="Loading…" />
      </div>
    );
  }

  const roleLabel =
    user.role === "STUDENT"
      ? "Student"
      : user.role === "ADMIN"
        ? "System admin"
        : "Teacher";

  const groups = navForRole(user.role);
  const flatLinks = groups.flatMap((g) => g.items);
  const activeLink = flatLinks.find(
    (link) =>
      pathname === link.href || pathname.startsWith(`${link.href}/`),
  );

  function NavLinks({
    onNavigate,
    dark,
  }: {
    onNavigate?: () => void;
    dark?: boolean;
  }) {
    return (
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <p
              className={cn(
                "mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em]",
                dark ? "text-white/35" : "text-zinc-400",
              )}
            >
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
                      "flex items-center gap-3 px-3 py-1.5 text-[13px] font-medium transition-colors",
                      dark
                        ? active
                          ? "bg-white text-[#0C1A2E]"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                        : active
                          ? "bg-[#0C1A2E] text-white"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-black",
                    )}
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.75} />
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
    <div className="flex min-h-[100svh] bg-[#f6f7f9]">
      <aside className="sticky top-0 hidden h-[100svh] w-60 shrink-0 flex-col bg-[#0C1A2E] md:flex">
        <div className="flex h-14 items-center border-b border-white/10 px-5">
          <Link
            href="/dashboard"
            className="font-display text-[15px] font-semibold tracking-tight text-white transition-opacity hover:opacity-70"
          >
            Lumen
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <NavLinks dark />
        </div>

        <div className="border-t border-white/10 px-5 py-4">
          <Link href="/profile" className="block transition-opacity hover:opacity-80">
            <p className="truncate text-[13px] font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-0.5 text-[11px] text-white/40">{roleLabel}</p>
          </Link>
          <button
            type="button"
            className="mt-3 flex items-center gap-2 text-[12px] text-white/40 transition-colors hover:text-white"
            onClick={() => {
              logout();
              router.replace("/");
            }}
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-md border-zinc-200"
                    />
                  }
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-0 bg-[#0C1A2E] p-0 text-white"
                >
                  <SheetHeader className="border-b border-white/10 px-5 py-4">
                    <SheetTitle className="font-display text-left text-white">
                      Lumen
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-3 py-5">
                    <NavLinks dark />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0C1A2E]">
                {activeLink?.label ?? "Lumen"}
              </p>
              <p className="hidden text-[11px] text-zinc-500 sm:block">
                {user.school?.name ?? "Lumen platform"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <HeaderNotifications />
            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-full transition-opacity hover:opacity-80"
            >
              <div className="hidden text-right sm:block">
                <p className="text-[13px] font-medium text-[#0C1A2E]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-zinc-500">{roleLabel}</p>
              </div>
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0C1A2E] text-[11px] font-semibold tracking-wide text-white"
                aria-label={`${user.firstName} ${user.lastName}`}
              >
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
