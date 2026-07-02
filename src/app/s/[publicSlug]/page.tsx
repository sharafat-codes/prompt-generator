import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPrompt } from "@/server/data/prompts";
import { getSessionSafe } from "@/server/context";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { SiteHeader, SiteFooter } from "@/components/marketing/chrome";
import { TemplatePreview } from "@/components/prompt/template-preview";
import { VarToken } from "@/components/ui/var-token";
import { PublicPromptActions } from "@/components/prompt/public-prompt-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicSlug: string }>;
}): Promise<Metadata> {
  const { publicSlug } = await params;
  const prompt = await getPublicPrompt(publicSlug);
  if (!prompt) return {};
  const url = `${SITE_URL}/s/${publicSlug}`;
  const description = `A free, reusable AI prompt — "${prompt.title}". Copy it, or build and save your own with ${SITE_NAME}.`;
  return {
    title: prompt.title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", url, title: prompt.title, description },
    twitter: { card: "summary_large_image", title: prompt.title, description },
  };
}

export default async function PublicPromptPage({
  params,
}: {
  params: Promise<{ publicSlug: string }>;
}) {
  const { publicSlug } = await params;
  const prompt = await getPublicPrompt(publicSlug);
  if (!prompt) notFound();

  const session = await getSessionSafe();
  const canSave = Boolean(session?.user);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: prompt.title,
    url: `${SITE_URL}/s/${publicSlug}`,
    description: `A free, reusable AI prompt: ${prompt.title}.`,
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-6 pb-16 pt-14 sm:pt-20">
        <p className="mb-4 font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
          Shared prompt
        </p>
        <h1 className="text-balance font-serif text-3xl font-semibold leading-[1.08] tracking-[-0.02em] sm:text-4xl">
          {prompt.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-2">
          A reusable AI prompt recipe. Copy it, or save it to your own library and re-run it anytime
          — just change the details.
        </p>

        <div className="mt-7 rounded-lg border border-hairline bg-surface p-5 shadow-sm">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
            The recipe
          </div>
          <p className="font-mono text-[13.5px] leading-[1.9] text-ink">
            <TemplatePreview template={prompt.template} />
          </p>
          {prompt.variables.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-hairline pt-4">
              {prompt.variables.map((v) => (
                <VarToken key={v.key} name={v.key} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <PublicPromptActions
            publicSlug={publicSlug}
            template={prompt.template}
            canSave={canSave}
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
