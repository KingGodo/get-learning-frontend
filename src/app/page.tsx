import { LandingHero } from "@/components/landing/landing-hero";
import { LandingPillars } from "@/components/landing/landing-pillars";
import { SiteFooter } from "@/components/landing/site-footer";

export default function HomePage() {
  return (
    <main className="flex-1 bg-white">
      <LandingHero />
      <LandingPillars />
      <SiteFooter />
    </main>
  );
}
