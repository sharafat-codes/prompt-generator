import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { TOOL_PAGES, contentTypeFor } from "@/lib/tool-pages";
import { SITE_URL } from "@/lib/site";
import { SiteHeader, SiteFooter, CTA_PRIMARY } from "@/components/marketing/chrome";

export const metadata: Metadata = {
  title: "Free AI Generators & Prompt Tools",
  description:
    "A growing set of free AI generators — marketing emails, ad copy, blog outlines, product descriptions, social captions, image prompts, and ChatGPT prompts. Save every result as a reusable recipe.",
  alternates: { canonical: `${SITE_URL}/tools` },
};

export default function ToolsIndexPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-6 pb-6 pt-16 text-center sm:pt-24">
        <h1 className="text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
          Free AI generators &amp; prompt tools
        </h1>
        <p className="mx-auto mt-5 max-w-[54ch] text-lg leading-relaxed text-ink-2">
          Pick a generator, answer a couple of questions, and get a polished result in seconds —
          then save it as a reusable recipe you can re-run anytime.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_PAGES.map((tool) => {
            const ct = contentTypeFor(tool.contentTypeKey);
            const Icon = ct?.icon;
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col rounded-lg border border-hairline bg-surface p-5 shadow-sm transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-hairline-2 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-mint text-accent">
                    {Icon ? <Icon size={17} /> : null}
                  </span>
                  <ArrowUpRight size={16} className="text-ink-3 group-hover:text-accent" />
                </div>
                <h2 className="mt-3.5 text-[15px] font-semibold tracking-[-0.01em]">
                  {tool.h1.replace(/^AI /, "")}
                </h2>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{tool.intro}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link href="/login" className={CTA_PRIMARY}>
            Start free
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
