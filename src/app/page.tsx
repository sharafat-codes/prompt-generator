import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Mail,
  Megaphone,
  Hash,
  FileText,
  ShoppingBag,
  Image as ImageIcon,
  Bot,
} from "lucide-react";
import { getSessionSafe } from "@/server/context";
import { Mark } from "@/components/layout/mark";
import { VarToken } from "@/components/ui/var-token";

const ctaPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-accent px-5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default async function Home() {
  const session = await getSessionSafe();
  if (session?.user) redirect("/library");

  return (
    <div className="min-h-screen">
      {/* nav */}
      <header className="sticky top-0 z-50 border-b border-hairline bg-ground/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Mark size={28} />
            <span className="text-[16px] font-semibold tracking-[-0.01em]">PromptPilot</span>
          </div>
          <Link
            href="/login"
            className="rounded-sm border border-hairline-2 bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-ink-3"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20 text-center sm:pt-28">
        <p className="mb-6 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-accent">
          <span className="h-px w-6 bg-mint-line" />
          The AI prompt workspace
        </p>
        <h1 className="text-balance font-serif text-5xl font-semibold leading-[1.03] tracking-[-0.02em] sm:text-6xl">
          Prompts that <em className="italic text-accent">compound.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-lg leading-relaxed text-ink-2">
          PromptPilot turns your best prompts into reusable recipes — for polished content or
          ready-to-paste AI prompts. Do the work once; reuse it forever.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3">
          <Link href="/login" className={ctaPrimary}>
            Start free
            <ArrowRight size={17} />
          </Link>
          <span className="text-[13px] text-ink-3">Free to start · sign in with GitHub</span>
        </div>

        {/* the motif */}
        <div className="mx-auto mt-14 max-w-xl rounded-lg border border-hairline bg-surface p-5 text-left shadow-md">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
            Your reusable recipe
          </div>
          <p className="font-mono text-[13.5px] leading-[1.9] text-ink">
            Write a <VarToken name="tone" /> launch email for <VarToken name="product" />, targeting{" "}
            <VarToken name="audience" />. Lead with the biggest benefit and end with one clear
            call-to-action.
          </p>
        </div>
      </section>

      {/* how it works */}
      <section className="border-t border-hairline bg-surface/40">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-[-0.015em]">
            Chat in → recipe out → reuse forever
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <Step
              n="1"
              icon={<MessageSquare size={20} />}
              title="Describe it"
              body="Answer a couple of quick questions — no blank text box, no prompt-engineering degree required."
            />
            <Step
              n="2"
              icon={<Sparkles size={20} />}
              title="Get it"
              body="A polished draft — or a ready-to-paste prompt — appears instantly, saved as a reusable recipe."
            />
            <Step
              n="3"
              icon={<RefreshCw size={20} />}
              title="Reuse it"
              body="Next time, change one field and regenerate in seconds. Ten uses later, you've got a proven machine."
            />
          </div>
        </div>
      </section>

      {/* what you can make */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-[-0.015em]">
            Make anything — content or prompts
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <MakeCard
              label="Ready-to-use content"
              items={[
                { icon: <Mail size={15} />, text: "Marketing emails" },
                { icon: <Megaphone size={15} />, text: "Ad copy" },
                { icon: <Hash size={15} />, text: "Social captions" },
                { icon: <FileText size={15} />, text: "Blog outlines" },
                { icon: <ShoppingBag size={15} />, text: "Product descriptions" },
              ]}
            />
            <MakeCard
              label="Prompts for other AI tools"
              items={[
                { icon: <ImageIcon size={15} />, text: "Image prompts for Midjourney / DALL·E" },
                { icon: <Bot size={15} />, text: "AI chat & assistant personas" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* closing cta */}
      <section className="border-t border-hairline bg-surface/40">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-balance font-serif text-3xl font-semibold tracking-[-0.02em]">
            Your best prompts, saved forever.
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-ink-2">
            Stop losing great prompts in your chat history. Build a library that gets more valuable
            every time you use it.
          </p>
          <Link href="/login" className={`${ctaPrimary} mt-8`}>
            Start free
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <Mark size={22} />
            <span className="font-semibold text-ink-2">PromptPilot</span>
          </div>
          <span>Prompts that compound.</span>
          <Link href="/login" className="font-semibold text-ink-2 hover:text-ink">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-mint text-accent">
        {icon}
      </span>
      <div className="mt-4 flex items-center gap-2">
        <span className="font-mono text-xs text-accent">{n}</span>
        <h3 className="text-[15px] font-semibold">{title}</h3>
      </div>
      <p className="mt-1.5 max-w-[32ch] text-sm leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}

function MakeCard({
  label,
  items,
}: {
  label: string;
  items: { icon: React.ReactNode; text: string }[];
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface p-6 shadow-sm">
      <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
        {label}
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.text} className="flex items-center gap-3 text-[15px] text-ink">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-mint text-accent">
              {item.icon}
            </span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
