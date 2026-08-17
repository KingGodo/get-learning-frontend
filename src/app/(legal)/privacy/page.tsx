import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, PRIVACY_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    `How ${APP_NAME} collects, uses, and protects personal information on the learning management platform.`,
};

export default function PrivacyPage() {
  return (
    <article>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        Legal
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-brand-dark">
        Privacy Policy
      </h1>
      <p className="mt-3 text-[13px] text-zinc-500">
        Last updated: 16 August 2026
      </p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-zinc-600">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">1. Overview</h2>
          <p>
            GetLeaning (“we”, “us”, or “our”) provides a learning management system
            for teachers, students, and system administrators. This Privacy
            Policy explains what personal information we collect, how we use it,
            and the choices you have when you use GetLeaning (the “Service”).
          </p>
          <p>
            By creating an account or using the Service, you acknowledge this
            Policy. If you do not agree, please do not use GetLeaning.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            2. Information we collect
          </h2>
          <p>We may collect:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-zinc-700">Account details</span>{" "}
              such as name, email address, phone number, role (teacher,
              student, or admin), and password (stored in hashed form).
            </li>
            <li>
              <span className="font-medium text-zinc-700">Profile details</span>{" "}
              you choose to add, including school affiliation, department,
              qualification, guardian contact information (for students), and
              similar fields.
            </li>
            <li>
              <span className="font-medium text-zinc-700">
                Learning content
              </span>{" "}
              such as classes you create or join, assignments, submissions,
              uploaded files, grades, and feedback.
            </li>
            <li>
              <span className="font-medium text-zinc-700">Usage data</span> such
              as login times, device/browser information, and actions taken in
              the Service that help us operate and secure the platform.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            3. How we use information
          </h2>
          <p>We use personal information to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Provide, maintain, and improve the Service</li>
            <li>Authenticate users and protect accounts</li>
            <li>Enable teaching workflows (classes, assignments, grading)</li>
            <li>Send in-app notifications related to your activity</li>
            <li>Respond to support requests and enforce our Terms</li>
            <li>Comply with applicable law and protect our rights</li>
          </ul>
          <p>
            We do not sell your personal information. We do not use student
            learning content for advertising.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            4. Sharing of information
          </h2>
          <p>We may share information:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              With other users in your school or class as needed for the
              Service (for example, teachers see student submissions in their
              classes)
            </li>
            <li>
              With service providers who help us host files, run the
              application, or maintain infrastructure, under appropriate
              safeguards
            </li>
            <li>
              When required by law, or to protect the safety, rights, or
              property of GetLeaning, our users, or others
            </li>
            <li>
              In connection with a merger, acquisition, or asset transfer, with
              notice where required
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">5. File storage</h2>
          <p>
            Assignment and submission files may be stored with third-party
            cloud storage providers. Access is controlled through the Service.
            You should only upload content you are allowed to share for
            educational purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">6. Retention</h2>
          <p>
            We keep personal information for as long as your account is active
            or as needed to provide the Service, meet legal obligations,
            resolve disputes, and enforce agreements. You may request account
            deletion subject to legitimate retention needs (for example,
            academic records your school requires).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">7. Security</h2>
          <p>
            We use reasonable technical and organisational measures to protect
            personal information, including encrypted transport (HTTPS) and
            hashed passwords. No method of transmission or storage is
            completely secure; please use a strong unique password and keep
            your credentials private.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            8. Children’s privacy
          </h2>
          <p>
            GetLeaning may be used by students, including minors, under the
            supervision of a school or guardian where required by law. If you
            believe we have collected information inappropriately, contact us
            and we will take appropriate steps.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">9. Your choices</h2>
          <p>
            You can update many profile details in the Service. You may also
            contact us to request access, correction, or deletion of personal
            information, subject to legal and operational limits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">
            10. Changes to this Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will post
            the revised version on this page and update the “Last updated”
            date. Continued use of the Service after changes means you accept
            the updated Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-dark">11. Contact</h2>
          <p>
            For privacy questions, email{" "}
            <a
              href={`mailto:${PRIVACY_EMAIL}`}
              className="font-medium text-brand-dark underline-offset-2 hover:underline"
            >
              {PRIVACY_EMAIL}
            </a>
            .
          </p>
          <p>
            See also our{" "}
            <Link
              href="/terms"
              className="font-medium text-brand-dark underline-offset-2 hover:underline"
            >
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
