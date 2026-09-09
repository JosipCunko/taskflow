import type { Metadata } from "next";
import LegalPageLayout from "@/app/_components/legal/LegalPageLayout";
import { SITE_URL } from "@/app/_lib/site";

export const dynamic = "force-static";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms of Use | Prioritron",
  description:
    "Read the Terms of Use governing your access to and use of Prioritron's productivity, fitness, nutrition, and AI assistant features.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "September 9, 2026";

export default function TermsOfUsePage() {
  return (
    <LegalPageLayout title="Terms of Use" lastUpdated={LAST_UPDATED}>
      <p>
        These Terms of Use (&quot;Terms&quot;) are a binding agreement between
        you and Prioritron (&quot;Prioritron&quot;, &quot;we&quot;,
        &quot;us&quot;, or &quot;our&quot;) governing your access to and use
        of the Prioritron website at{" "}
        <a href={SITE_URL}>{SITE_URL}</a>, web
        application, and any related services (collectively, the
        &quot;Service&quot;). By creating an account or otherwise using the
        Service, you agree to these Terms. If you do not agree, do not use
        the Service.
      </p>

      <h2>1. Eligibility &amp; Accounts</h2>
      <p>
        You must be at least 13 years old to use the Service. You are
        responsible for the accuracy of the information you provide and for
        safeguarding your account credentials (or, for social sign-in, your
        Google/GitHub account). You are responsible for all activity that
        occurs under your account.
      </p>
      <p>
        You may create an account using Email/Password, Google Sign-In, or
        GitHub OAuth. Anonymous/guest sessions may also be offered; guest
        accounts and their associated data are automatically deleted after a
        short period of inactivity (currently three hours) as described in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>2. Description of the Service</h2>
      <p>
        Prioritron is an all-in-one productivity platform that lets you
        manage tasks and notes, track fitness and nutrition, view analytics
        about your habits, and optionally interact with an AI assistant that
        can read and modify your data on your behalf (e.g., creating or
        updating tasks) when you ask it to.
      </p>

      <h2>3. Subscriptions, Trials &amp; Billing</h2>
      <p>
        Prioritron offers a free Base plan and paid Pro and Ultra plans with
        additional features (such as higher daily AI usage limits and
        advanced analytics). Paid plans are billed on a recurring basis
        through our payment processor, Stripe, and may include a free trial
        period as described at checkout.
      </p>
      <ul>
        <li>
          Prices, plan features, and trial lengths are shown at the time of
          purchase and may change with notice.
        </li>
        <li>
          Subscriptions renew automatically until cancelled. You can cancel
          or change your plan at any time through the in-app billing/customer
          portal; cancellation takes effect at the end of the current billing
          period unless stated otherwise.
        </li>
        <li>
          Except where required by law, fees already paid are
          non-refundable.
        </li>
      </ul>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use the Service for any unlawful purpose or in violation of any
          applicable law or regulation;
        </li>
        <li>
          Attempt to gain unauthorized access to other users&apos; accounts
          or data, or to any part of the Service&apos;s infrastructure;
        </li>
        <li>
          Interfere with, disrupt, or place undue load on the Service (e.g.,
          scraping, automated abuse, or denial-of-service attempts);
        </li>
        <li>
          Use the AI assistant to generate or store unlawful, abusive, or
          harmful content;
        </li>
        <li>
          Reverse engineer, decompile, or attempt to extract the source code
          of the Service, except where permitted by law.
        </li>
      </ul>

      <h2>5. Your Content</h2>
      <p>
        &quot;Your Content&quot; means the tasks, notes, workout logs,
        nutrition entries, and any other data you submit to the Service. You
        retain ownership of Your Content. You grant us a limited license to
        store, process, and display Your Content solely to operate and
        improve the Service (for example, to render your task list or
        calculate your streaks). We do not sell Your Content.
      </p>
      <p>
        Free-text fields you type — task titles/descriptions and note
        titles/content — are encrypted at rest using AES-256-GCM before being
        stored in our database, as described in more detail in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>6. AI Assistant</h2>
      <p>
        The AI assistant is powered by third-party large language model
        providers. When you use it, relevant context (such as your task list
        or notes) may be sent to those providers to generate a response or
        perform an action you requested. AI-generated content may be
        inaccurate or incomplete — you are responsible for reviewing any
        actions the assistant takes (such as creating, updating, or deleting
        a task) before relying on them. Daily usage limits apply based on
        your subscription plan.
      </p>

      <h2>7. Health &amp; Fitness Disclaimer</h2>
      <p>
        Fitness, nutrition, and health-related features (including calorie
        and macro tracking, workout logging, and NutriScore/NOVA
        classifications) are provided for informational and personal
        tracking purposes only. They are <strong>not</strong> medical advice.
        Consult a qualified healthcare professional before making decisions
        about your diet, exercise, or health based on information from the
        Service.
      </p>

      <h2>8. Intellectual Property</h2>
      <p>
        The Service, including its design, code, graphics, and branding
        (excluding Your Content), is owned by Prioritron and protected by
        applicable intellectual property laws. You may not copy, modify, or
        distribute any part of the Service without our prior written
        consent.
      </p>

      <h2>9. Third-Party Services</h2>
      <p>
        The Service relies on third-party providers, including Firebase
        (Google) for authentication and data storage, Stripe for payment
        processing, GitHub for OAuth sign-in, and various AI model providers.
        Your use of the Service may also be subject to those providers&apos;
        own terms and privacy policies.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time.
        We may suspend or terminate your access if you violate these Terms,
        misuse the Service, or if required by law. Upon termination, your
        right to use the Service ceases immediately; certain data may be
        retained or deleted as described in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>11. Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot;
        without warranties of any kind, express or implied, including
        warranties of merchantability, fitness for a particular purpose, or
        non-infringement. We do not guarantee that the Service will be
        uninterrupted, error-free, or that all data will be preserved
        (although we take reasonable measures, including offline caching and
        backups, to protect against data loss).
      </p>

      <h2>12. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Prioritron and its creator
        shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages, or any loss of data, profits, or
        goodwill, arising from your use of, or inability to use, the
        Service, even if advised of the possibility of such damages. Our
        total liability for any claim relating to the Service is limited to
        the amount you paid us, if any, in the twelve (12) months preceding
        the claim.
      </p>

      <h2>13. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material
        changes, we will update the &quot;Last updated&quot; date above and,
        where appropriate, notify you in-app. Continued use of the Service
        after changes take effect constitutes acceptance of the revised
        Terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:ultrabrzitranzijent@gmail.com">
          ultrabrzitranzijent@gmail.com
        </a>
        .
      </p>
    </LegalPageLayout>
  );
}
