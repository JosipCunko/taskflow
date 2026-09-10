import type { Metadata } from "next";
import LegalPageLayout from "@/app/_components/legal/LegalPageLayout";
import { SITE_URL } from "@/app/_lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Prioritron collects, uses, encrypts, and protects your data, including task/note encryption at rest and your privacy rights.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "September 9, 2026";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        This Privacy Policy explains how Prioritron (&quot;Prioritron&quot;,
        &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
        stores, and protects information when you use our website at{" "}
        <a href={SITE_URL}>{SITE_URL}</a> and web
        application (the &quot;Service&quot;). By using the Service, you
        agree to the practices described here.
      </p>

      <h2>1. Information We Collect</h2>
      <h3>Account information</h3>
      <ul>
        <li>
          Name, email address, and profile photo, provided by you or by your
          chosen sign-in method (Email/Password, Google, or GitHub OAuth via
          Firebase Authentication and NextAuth).
        </li>
        <li>Account creation date, last login date, and login streaks.</li>
      </ul>
      <h3>Content you create</h3>
      <ul>
        <li>Tasks (titles, descriptions, due dates, tags, and status).</li>
        <li>Notes (titles and content).</li>
        <li>
          Fitness data (workout sessions, exercises, sets/reps/weights,
          templates, and session notes).
        </li>
        <li>
          Nutrition data (logged foods, meals, barcode scans, and daily
          goals).
        </li>
        <li>Conversations with the AI assistant and its function results.</li>
      </ul>
      <h3>Usage &amp; device information</h3>
      <ul>
        <li>
          Activity logs of task interactions (created, completed, delayed,
          deleted) used to power your activity feed, streaks, and
          achievements.
        </li>
        <li>
          Analytics such as session duration, page views, and engagement
          metrics, used to understand and improve the Service.
        </li>
        <li>
          Device/browser information, IP-derived data, and push notification
          tokens (if you enable notifications on the installed PWA).
        </li>
      </ul>
      <h3>Payment information</h3>
      <p>
        If you subscribe to a paid plan, payment is processed by{" "}
        <strong>Stripe</strong>. We do not receive or store your full card
        details — Stripe handles that in accordance with its own privacy
        policy. We receive limited billing metadata (e.g., subscription
        status, plan, and renewal dates) needed to manage your account.
      </p>

      <h2>2. Encryption of Your Tasks &amp; Notes</h2>
      <p>
        We take the privacy of the things you write seriously. The free-text
        content you type into <strong>tasks</strong> (title, description)
        and <strong>notes</strong> (title, content) is encrypted at rest
        using <strong>AES-256-GCM</strong>, an industry-standard authenticated
        encryption algorithm:
      </p>
      <ul>
        <li>
          Each value is encrypted with its own randomly generated
          initialization vector, so identical text never produces identical
          ciphertext, and an authentication tag that detects tampering.
        </li>
        <li>
          Data is encrypted before it is written to our database and
          decrypted only on the server, on demand, when you (or a process
          acting on your behalf) legitimately requests it.
        </li>
        <li>
          The encryption key is kept as a server-side secret and is never
          exposed to the browser or to third parties.
        </li>
        <li>
          This encryption currently covers task and note text content. It
          does <strong>not</strong> currently extend to workouts, nutrition
          logs, or other structured data, which remain protected by our
          authentication and database access-control rules described below,
          but are not individually encrypted at the field level.
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <ul>
        <li>To provide, operate, and maintain the Service and your account;</li>
        <li>
          To personalize your experience (e.g., streaks, achievements, and
          AI recommendations);
        </li>
        <li>
          To process payments and manage subscriptions through Stripe;
        </li>
        <li>
          To send you notifications you&apos;ve opted into (task reminders,
          achievement alerts, and occasional product announcements);
        </li>
        <li>
          To analyze usage in aggregate so we can improve features and fix
          issues;
        </li>
        <li>To detect, prevent, and address fraud, abuse, or security issues;</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>4. How We Protect Your Data</h2>
      <ul>
        <li>
          <strong>Firestore Security Rules</strong>: database rules ensure
          only you (an authenticated user matching the record&apos;s
          <code>userId</code>) can read or write your own tasks, notes,
          workouts, and other records.
        </li>
        <li>
          <strong>Field-level encryption</strong> for task/note content, as
          described above.
        </li>
        <li>
          <strong>Encrypted sessions</strong>: authentication sessions use
          signed, encrypted JWTs stored in httpOnly cookies, so they
          can&apos;t be read or tampered with by client-side scripts.
        </li>
        <li>
          <strong>Security headers</strong> (HSTS, X-Frame-Options,
          X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and
          rate limiting to reduce common web attack surface.
        </li>
        <li>
          <strong>Least-privilege admin access</strong>: elevated,
          server-only database access is isolated to specific backend
          modules and never exposed to the client.
        </li>
      </ul>
      <p>
        No method of transmission or storage is 100% secure, and we cannot
        guarantee absolute security. We continuously work to improve our
        safeguards.
      </p>

      <h2>5. Who We Share Data With</h2>
      <p>
        We do not sell your personal information. We share data only with
        the service providers necessary to operate Prioritron, including:
      </p>
      <ul>
        <li>
          <strong>Firebase / Google Cloud</strong> — authentication,
          database (Firestore), and push notifications;
        </li>
        <li>
          <strong>Stripe</strong> — payment processing and subscription
          management;
        </li>
        <li>
          <strong>GitHub</strong> — OAuth sign-in, if you choose that option;
        </li>
        <li>
          <strong>AI providers</strong> (e.g., OpenAI, Anthropic, Google, and
          providers accessed via CrayonAI, ThesysAI, or OpenRouter) — only
          when you actively use the AI assistant, to process your prompt and
          generate a response;
        </li>
        <li>
          <strong>Analytics/infrastructure providers</strong> (e.g., Vercel)
          — for hosting, performance monitoring, and aggregate usage
          analytics.
        </li>
      </ul>
      <p>
        These providers only receive the data necessary to perform their
        function and are bound by their own privacy and security
        obligations. We may also disclose information if required by law or
        to protect the rights, property, or safety of Prioritron, our
        users, or others.
      </p>

      <h2>6. Data Retention &amp; Account Deletion</h2>
      <ul>
        <li>
          We retain your data for as long as your account is active, so the
          Service can function as intended.
        </li>
        <li>
          <strong>Anonymous/guest accounts</strong> and all associated
          tasks, notes, notifications, workouts, and health data are
          automatically deleted after a short period of inactivity
          (currently three hours).
        </li>
        <li>
          You may request deletion of your account and associated data at
          any time by contacting us at{" "}
          <a href="mailto:ultrabrzitranzijent@gmail.com">
            ultrabrzitranzijent@gmail.com
          </a>
          . We will delete or anonymize your data within a reasonable time,
          except where we must retain certain records for legal, billing, or
          security purposes.
        </li>
      </ul>

      <h2>7. Your Rights</h2>
      <p>
        Depending on your location, you may have rights to access, correct,
        export, or delete your personal data, and to object to or restrict
        certain processing. You can access and edit most of your data
        directly within the app, or contact us to exercise these rights.
      </p>

      <h2>8. Cookies &amp; Local Storage</h2>
      <p>
        We use essential cookies for authentication (httpOnly session
        cookies managed by NextAuth) and local/IndexedDB storage on your
        device to support offline functionality (e.g., caching your tasks so
        the app works without an internet connection). We do not use
        third-party advertising cookies.
      </p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>
        The Service is not directed to children under 13, and we do not
        knowingly collect personal information from children under 13. If
        you believe a child has provided us with personal information,
        please contact us so we can delete it.
      </p>

      <h2>10. International Data Transfers</h2>
      <p>
        Our service providers (such as Firebase/Google Cloud and Stripe)
        may process and store data in countries other than your own. By
        using the Service, you understand your information may be
        transferred to and processed in such locations, which may have
        different data protection laws than your jurisdiction.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. If we make
        material changes, we will update the &quot;Last updated&quot; date
        above and, where appropriate, notify you in-app or by email.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or how we handle
        your data, contact us at{" "}
        <a href="mailto:ultrabrzitranzijent@gmail.com">
          ultrabrzitranzijent@gmail.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
