"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links: Array<{ href: string; label: string; route?: boolean }> = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#roles", label: "Who it’s for" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-[background-color,border-color] duration-200 ease-craft",
        scrolled
          ? "border-border bg-white/90 backdrop-blur-sm"
          : "border-transparent bg-landing",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <BrandMark href="/" size="sm" />
        <nav className="hidden items-center gap-7 text-[13px] font-medium md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-ink/55 transition-colors duration-150 ease-craft hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Get access
          </ButtonLink>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-ink hover:bg-white/80"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100vw-2rem,20rem)] border-border bg-landing p-0 text-ink"
            >
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="text-left">
                  <BrandMark href={null} size="sm" />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3 py-4">
                {links.map((link) => (
                  <SheetClose
                    key={link.href}
                    nativeButton={false}
                    render={
                      <a
                        href={link.href}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-white hover:text-ink"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/login"
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:bg-white hover:text-ink"
                    />
                  }
                >
                  Sign in
                </SheetClose>
                <div className="px-3 pt-3">
                  <ButtonLink href="/register" size="sm" className="w-full">
                    Get access
                  </ButtonLink>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
