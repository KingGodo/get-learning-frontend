import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingPillars } from "@/components/landing/landing-pillars";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <main className="flex-1 bg-landing text-ink">
      <LandingNav />
      <LandingHero />
      <LandingPillars />
      <SiteFooter />
    </main>
  );
}
