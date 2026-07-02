import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MessageSquare, Sparkles, RefreshCw } from "lucide-react";
import { TOOL_PAGES, getToolPage, contentTypeFor } from "@/lib/tool-pages";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { SiteHeader, SiteFooter, CTA_PRIMARY } from "@/components/marketing/chrome";
import { TemplatePreview } from "@/components/prompt/template-preview";

export function generateStaticParams() {
  return TOOL_PAGES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolPage(slug);
  if (!tool) return {};
  const url = `${SITE_URL}/tools/${tool.slug}`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolPage(slug);
  if (!tool) notFound();

  const ct = contentTypeFor(tool.contentTypeKey);
  const others = TOOL_PAGES.filter((t) => t.slug !== tool.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${tool.h1} — ${SITE_NAME}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: tool.metaDescription,
    url: `${SITE_URL}/tools/${tool.slug}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      {/* hero */}
      <section className="mx-auto max-w-3xl px-6 pb-14 pt-16 text-center sm:pt-24">
        <p className="mb-5 font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
          Free AI tool
        </p>
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
          {tool.h1}
        </h1>
        <p className="mx-auto mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-2">{tool.intro}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/login" className={CTA_PRIMARY}>
            Generate your {ct?.resultLabel ?? "result"} free
            <ArrowRight size={17} />
          </Link>
          <span className="text-[13px] text-ink-3">Free to start · save &amp; reuse anytime</span>
        </div>

        {ct && (
          <div className="mx-auto mt-12 max-w-xl rounded-lg border border-hairline bg-surface p-5 text-left shadow-md">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
              The recipe you&apos;ll reuse
            </div>
            <p className="font-mono text-[13.5px] leading-[1.9] text-ink">
              <TemplatePreview template={ct.template} />
            </p>
          </div>
        )}
      </section>

      {/* use cases */}
      <section className="border-t border-hairline bg-surface/40">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-[-0.015em]">
            Great for
          </h2>
          <ul className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            {tool.useCases.map((u) => (
              <li key={u} className="flex items-center gap-3 text-[15px] text-ink">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-accent">
                  <Check size={14} />
                </span>
                {u}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* how it works */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-[-0.015em]">
            How it works
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[
              { icon: <MessageSquare size={18} />, t: "Describe it", b: "Answer a couple of quick questions — no prompt-writing skills needed." },
              { icon: <Sparkles size={18} />, t: "Get it", b: "A polished result appears instantly, saved as a reusable recipe." },
              { icon: <RefreshCw size={18} />, t: "Reuse it", b: "Change one field and regenerate in seconds, anytime." },
            ].map((s) => (
              <div key={s.t} className="flex flex-col items-center text-center">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-accent">
                  {s.icon}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold">{s.t}</h3>
                <p className="mt-1.5 max-w-[30ch] text-sm leading-relaxed text-ink-2">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cross-links */}
      <section className="border-t border-hairline bg-surface/40">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-[-0.015em]">
            More free generators
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {others.map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="rounded-full border border-hairline-2 bg-surface px-4 py-2 text-sm font-medium text-ink-2 shadow-sm transition-colors hover:border-accent hover:text-accent-press"
              >
                {t.h1.replace(/^AI /, "")}
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/login" className={CTA_PRIMARY}>
              Start free
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
