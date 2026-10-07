import { LandingHome } from "@/components/landing/landing-home";
import { LandingNav } from "@/components/landing/landing-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <main className="flex-1 bg-zinc-50 text-zinc-950">
      <LandingNav />
      <LandingHome />
      <SiteFooter />
    </main>
  );
}
