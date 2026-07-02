import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { SiteHeader, SiteFooter } from "@/components/marketing/chrome";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your data.`,
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-serif text-3xl font-semibold tracking-[-0.02em]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: July 2026</p>

        <div className="mt-4 rounded-md border border-amber-bg bg-amber-bg px-4 py-3 text-[13px] text-amber">
          This is a starting template. Review it with a legal professional and fill in your company
          and contact details before relying on it in production.
        </div>

        <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-ink-2 [&_h2]:mt-2 [&_h2]:font-serif [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink">
          <p>
            {SITE_NAME} (&quot;we&quot;, &quot;us&quot;) provides an AI prompt workspace. This policy
            explains what we collect, why, and your choices.
          </p>

          <div>
            <h2>Information we collect</h2>
            <p>
              <b>Account:</b> when you sign in with GitHub we receive your name, email, and avatar.
              <br />
              <b>Content:</b> the prompts, recipes, inputs, and generated results you create.
              <br />
              <b>Usage:</b> generation counts and basic activity used to enforce plan limits.
              <br />
              <b>Payments:</b> handled by Stripe — we never see or store your card details.
            </p>
          </div>

          <div>
            <h2>How we use it</h2>
            <p>
              To provide and secure the service, generate content you request, enforce plan limits,
              process subscriptions, and improve the product. We do not sell your personal data.
            </p>
          </div>

          <div>
            <h2>Service providers</h2>
            <p>
              We share data only as needed with providers that run the service: Supabase (database),
              Vercel (hosting), Anthropic (AI generation of your prompts), Stripe (payments), and
              GitHub (sign-in). Each processes data under its own terms.
            </p>
          </div>

          <div>
            <h2>Retention &amp; your rights</h2>
            <p>
              We keep your data while your account is active. You can request access to or deletion
              of your data at any time by contacting us. Deleting your account removes your
              workspace and its content.
            </p>
          </div>

          <div>
            <h2>Cookies</h2>
            <p>
              We use a single essential cookie to keep you signed in. We don&apos;t use advertising
              cookies.
            </p>
          </div>

          <div>
            <h2>Changes &amp; contact</h2>
            <p>
              We may update this policy; we&apos;ll revise the date above. Questions? Contact us at{" "}
              <span className="font-mono text-[13px]">hello@promptpilot.app</span>.
            </p>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
