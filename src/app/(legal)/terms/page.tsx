import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for using the Learning Hub learning management platform.",
};

export default function TermsPage() {
  return (
    <article>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        Legal
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-brand-dark">
        Terms &amp; Conditions
      </h1>
      <p className="mt-3 text-[13px] text-zinc-500">
        Last updated: 18 July 2026
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-600">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            1. Agreement to these Terms
          </h2>
          <p>
            These Terms &amp; Conditions (“Terms”) govern your access to and
            use of Learning Hub, including our websites, applications, and related
            services (the “Service”). By registering for or using Learning Hub, you
            agree to these Terms and our{" "}
            <Link
              href="/privacy"
              className="font-medium text-brand-dark underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p>
            If you use Learning Hub on behalf of a school or organisation, you
            confirm that you have authority to bind that organisation to these
            Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            2. The Service
          </h2>
          <p>
            Learning Hub is a learning management platform that enables teachers and
            students to manage classes, assignments, submissions, grades, and
            related academic workflows. Features may change as we improve the
            product. We may add, modify, or discontinue features with
            reasonable notice when practical.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">3. Accounts</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              You must provide accurate registration information and keep it
              up to date.
            </li>
            <li>
              You are responsible for safeguarding your login credentials and
              for activity under your account.
            </li>
            <li>
              Notify us promptly if you suspect unauthorised access.
            </li>
            <li>
              We may suspend or terminate accounts that violate these Terms or
              pose a security risk.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            4. Acceptable use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Use the Service for unlawful, harmful, or abusive purposes</li>
            <li>
              Upload malware, or attempt to disrupt, scrape, or reverse
              engineer the Service except as allowed by law
            </li>
            <li>
              Impersonate others, share accounts improperly, or access data
              you are not authorised to see
            </li>
            <li>
              Upload content that infringes intellectual property, privacy, or
              other rights
            </li>
            <li>
              Harass, discriminate against, or harm other users through the
              Service
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            5. User content
          </h2>
          <p>
            You retain ownership of content you submit (such as assignment
            files, descriptions, and feedback). You grant Learning Hub a limited
            licence to host, process, display, and transmit that content solely
            to operate and improve the Service.
          </p>
          <p>
            Teachers and schools are responsible for the educational content
            they publish and for obtaining any permissions required for
            student use of the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            6. Intellectual property
          </h2>
          <p>
            Learning Hub, including its name, branding, software, and design, is owned
            by us or our licensors. Except for the limited rights needed to use
            the Service, no licence to our intellectual property is granted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            7. Availability and support
          </h2>
          <p>
            We aim to keep Learning Hub reliable, but we do not guarantee
            uninterrupted or error-free service. Scheduled maintenance,
            outages, or third-party failures may occur. We will work in good
            faith to restore service when issues arise.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            8. Disclaimers
          </h2>
          <p>
            The Service is provided “as is” and “as available” to the fullest
            extent permitted by law. We disclaim warranties of merchantability,
            fitness for a particular purpose, and non-infringement, except
            where such disclaimers are not allowed.
          </p>
          <p>
            Learning Hub is a tool to support teaching and learning. It does not
            replace professional educational judgment or institutional
            policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            9. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, Learning Hub and its operators
            will not be liable for indirect, incidental, special,
            consequential, or punitive damages, or for loss of data, grades,
            profits, or goodwill, arising from your use of the Service.
          </p>
          <p>
            Our total liability for any claim relating to the Service will not
            exceed the greater of (a) the amounts you paid us for the Service
            in the twelve months before the claim, or (b) USD 50, if you use a
            free plan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            10. Termination
          </h2>
          <p>
            You may stop using Learning Hub at any time. We may suspend or end access
            if you breach these Terms, if required by law, or if we discontinue
            the Service. Provisions that should survive termination (including
            intellectual property, disclaimers, and liability limits) will
            continue to apply.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            11. Changes to the Terms
          </h2>
          <p>
            We may revise these Terms. When we do, we will update the “Last
            updated” date on this page. Continued use after changes take effect
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            12. Governing law
          </h2>
          <p>
            These Terms are governed by the laws of Zimbabwe, without regard to
            conflict-of-law principles, unless mandatory local law requires
            otherwise for your jurisdiction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">13. Contact</h2>
          <p>
            Questions about these Terms:{" "}
            <a
              href="mailto:legal@Learning Hub.app"
              className="font-medium text-brand-dark underline-offset-2 hover:underline"
            >
              legal@Learning Hub.app
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
