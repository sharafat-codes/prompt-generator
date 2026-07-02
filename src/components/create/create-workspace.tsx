"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Copy, Check, RotateCcw, Save } from "lucide-react";
import { CONTENT_TYPES, CONTENT_GROUPS, type ContentType } from "@/lib/content-types";
import { savePrompt } from "@/server/actions/prompt-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplatePreview } from "@/components/prompt/template-preview";
import { Mark } from "@/components/layout/mark";

function fillTemplate(template: string, answers: Record<string, string>) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => answers[key] ?? `{${key}}`);
}

type Phase = "pick" | "questions" | "result";

export function CreateWorkspace({ live }: { live: boolean }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [type, setType] = useState<ContentType | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState("");
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [step, phase]);

  function pick(ct: ContentType) {
    setType(ct);
    setAnswers({});
    setStep(0);
    setDraft("");
    setOutput("");
    setPhase("questions");
  }

  function submitAnswer(value: string) {
    if (!type) return;
    const q = type.questions[step];
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    setDraft("");
    setStep(step + 1);
    if (step + 1 >= type.questions.length) {
      setPhase("result");
      void generate(fillTemplate(type.template, next), type.key, next);
    }
  }

  async function generate(prompt: string, contentType: string, inputs: Record<string, string>) {
    setGenerating(true);
    setOutput("");
    try {
      const res = await fetch("/api/prompts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, contentType, inputs }),
      });
      if (res.status === 402) {
        setOutput("You've reached your free monthly limit. Upgrade to keep creating.");
        return;
      }
      if (!res.ok || !res.body) {
        setOutput("Something went wrong. Please try again.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setOutput("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!type) return;
    setSaving(true);
    const firstText = type.questions.find((q) => q.type === "text");
    const suffix = firstText ? answers[firstText.key]?.trim() : "";
    try {
      const result = await savePrompt({
        title: suffix ? `${type.label} — ${suffix}` : type.label,
        template: type.template,
        variables: type.questions.map((q) => ({
          key: q.key,
          label: q.label,
          type: q.type,
          options: q.options,
          placeholder: q.placeholder,
        })),
      });
      if ("error" in result) {
        setSaving(false);
        setToast(
          `You've hit the Free plan's limit of ${result.cap} saved recipes. Upgrade to save unlimited.`,
        );
        return;
      }
      router.push(`/p/${result.slug}`);
    } catch {
      setSaving(false);
      setToast("Couldn't save just now — please try again.");
    }
  }

  function reset() {
    setPhase("pick");
    setType(null);
    setAnswers({});
    setStep(0);
    setDraft("");
    setOutput("");
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // ── Pick phase ──────────────────────────────────────────────────────────
  if (phase === "pick") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        <Mark size={40} className="mb-7" />
        <h1 className="max-w-[18ch] text-balance font-serif text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          What do you want to create?
        </h1>
        <p className="mt-4 max-w-[48ch] text-ink-2">
          Pick one, answer a couple of quick questions, and I&apos;ll write it for you — then save
          it to reuse anytime.
        </p>

        <div className="mt-9 flex w-full max-w-xl flex-col gap-6">
          {CONTENT_GROUPS.map((group) => (
            <div key={group}>
              <div className="mb-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                {group === "Content" ? "Ready-to-use content" : "Prompts for other AI tools"}
              </div>
              <div className="flex flex-wrap justify-center gap-2.5">
                {CONTENT_TYPES.filter((ct) => ct.group === group).map((ct) => {
                  const Icon = ct.icon;
                  return (
                    <button
                      key={ct.key}
                      onClick={() => pick(ct)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-hairline-2 bg-surface px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:border-accent hover:text-accent-press"
                    >
                      <Icon size={15} className="text-accent" />
                      {ct.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!live && (
          <p className="mt-10 text-xs text-ink-3">
            Running in demo mode — add an <span className="font-mono">ANTHROPIC_API_KEY</span> for
            live, custom results.
          </p>
        )}
      </div>
    );
  }

  // ── Questions + result ──────────────────────────────────────────────────
  const currentQ = type && step < type.questions.length ? type.questions[step] : null;

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(300px,360px)_1fr]">
      {/* conversation */}
      <div className="flex max-h-screen flex-col border-r border-hairline bg-ground">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="font-serif text-lg leading-snug tracking-[-0.01em]">{type?.label}</div>

          {type?.questions.slice(0, step).map((q) => (
            <div key={q.key} className="space-y-1.5">
              <div className="text-[13px] text-ink-2">{q.label}</div>
              <div className="ml-auto w-fit max-w-[85%] rounded-[14px_14px_4px_14px] bg-accent px-3.5 py-2 text-[13.5px] text-white">
                {answers[q.key]}
              </div>
            </div>
          ))}

          {phase === "questions" && currentQ && (
            <div className="space-y-2.5">
              <div className="text-[13px] text-ink-2">{currentQ.label}</div>
              {currentQ.type === "select" && (
                <div className="flex flex-wrap gap-2">
                  {currentQ.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => submitAnswer(opt)}
                      className="cursor-pointer rounded-full border border-hairline-2 bg-surface px-3 py-1.5 text-[12.5px] text-ink-2 transition-colors hover:border-accent hover:bg-mint hover:text-accent-press"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {phase === "result" && (
            <div className="text-[13px] text-ink-3">Done — your {type?.resultLabel} is on the right.</div>
          )}
        </div>

        {phase === "questions" && currentQ?.type === "text" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) submitAnswer(draft.trim());
            }}
            className="flex items-center gap-2.5 border-t border-hairline p-3"
          >
            <input
              key={step}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={currentQ.placeholder ?? "Type your answer…"}
              className="flex-1 rounded-md border border-hairline-2 bg-surface px-3 py-2.5 text-[13.5px] text-ink placeholder:text-ink-3 focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--color-mint)] focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="grid h-[38px] w-[38px] cursor-pointer place-items-center rounded-md bg-accent text-white shadow-sm transition-colors hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <div className="border-t border-hairline p-3">
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw size={14} />
              Start over
            </Button>
          </div>
        )}
      </div>

      {/* output */}
      <div className="flex max-h-screen flex-col gap-5 overflow-y-auto bg-ground p-6">
        {phase === "result" ? (
          <>
            {/* the deliverable — the hero */}
            <div>
              <div className="mb-2 flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
                  Your {type?.resultLabel}
                </span>
                {!live && <span className="ml-auto text-[11px] text-ink-3">demo mode</span>}
              </div>
              <div className="rounded-md border border-hairline bg-surface p-4 shadow-sm">
                <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-ink">
                  {output}
                  {generating && (
                    <span className="ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] animate-pulse rounded-[1px] bg-accent align-middle" />
                  )}
                </p>
              </div>
              {output && !generating && (
                <div className="mt-3">
                  <Button variant="secondary" size="sm" onClick={copyOutput}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              )}
            </div>

            {/* the reusable recipe — save for later */}
            <div className="rounded-md border border-hairline bg-surface-2 p-4">
              <Badge>reusable recipe</Badge>
              <div className="mt-2.5 rounded-sm border border-hairline bg-surface px-3.5 py-3 font-mono text-[13px] leading-[1.8] text-ink">
                <TemplatePreview template={type?.template ?? ""} />
              </div>
              <p className="mt-2.5 text-xs text-ink-3">
                Save this and reuse it anytime — just change the details, no re-typing.
              </p>
              <Button className="mt-3" size="sm" onClick={handleSave} disabled={saving || generating}>
                <Save size={14} />
                {saving ? "Saving…" : "Save to library"}
              </Button>
            </div>

            {toast && (
              <div className="rounded-md border border-mint-line bg-mint px-4 py-3 text-[13px] text-accent-press">
                {toast}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="max-w-[32ch] text-sm text-ink-3">
              Answer the questions on the left, and your {type?.resultLabel} will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
