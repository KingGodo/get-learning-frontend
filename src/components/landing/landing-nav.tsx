"use client";

import { useEffect, useState } from "react";
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

const links = [
  { href: "#home", label: "Home" },
  { href: "#product", label: "Product" },
  { href: "#roles", label: "Roles" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "Questions" },
  { href: "#contact", label: "Contact" },
];

const glass =
  "border border-white/30 bg-white/15 shadow-sm backdrop-blur-md";

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
        "fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color,color] duration-200 ease-craft",
        scrolled
          ? "border-zinc-200 bg-white/90 backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <BrandMark href="/" size="sm" inverted={!scrolled} />
        <nav
          className={cn(
            "hidden items-center text-[13px] font-medium md:flex",
            scrolled ? "gap-7" : cn("gap-0.5 rounded-lg p-1", glass),
          )}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors duration-150 ease-craft",
                scrolled
                  ? "text-ink/55 hover:text-ink"
                  : "rounded-md px-2.5 py-1.5 text-white hover:bg-white/15",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center md:flex">
          <ButtonLink
            href="/login"
            size="sm"
            className={cn(
              !scrolled && "bg-white text-brand hover:bg-brand-light",
            )}
          >
            Sign in
          </ButtonLink>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    scrolled
                      ? "text-ink hover:bg-zinc-100"
                      : "text-white hover:bg-white/15",
                  )}
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100vw-2rem,20rem)] border-zinc-200 bg-white p-0 text-zinc-950"
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
                <div className="px-3 pt-3">
                  <ButtonLink href="/login" size="sm" className="h-11 w-full">
                    Sign in
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
