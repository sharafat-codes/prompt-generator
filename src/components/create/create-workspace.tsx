"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Copy, Download, RotateCcw, Check } from "lucide-react";
import { savePrompt } from "@/server/actions/prompt-actions";
import { CONTENT_TYPES, type ContentType } from "@/lib/content-types";
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
        setOutput("You've reached your free monthly limit of generations. Upgrade to keep creating.");
        return;
      }
      if (!res.ok || !res.body) {
        setOutput("Something went wrong generating your draft. Please try again.");
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
      setOutput("Something went wrong generating your draft. Please try again.");
    } finally {
      setGenerating(false);
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

  async function handleSave() {
    if (!type) return;
    setSaving(true);
    try {
      const { slug } = await savePrompt({
        title: type.label + (answers.product ? ` — ${answers.product}` : ""),
        template: type.template,
        variables: type.questions.map((q) => ({
          key: q.key,
          label: q.label,
          type: q.type,
          options: q.options,
          placeholder: q.placeholder,
        })),
      });
      router.push(`/p/${slug}`);
    } catch {
      setSaving(false);
      setToast("Couldn't save just now — please try again.");
    }
  }

  function comingSoon() {
    setToast("The prompt optimizer is coming soon.");
    setTimeout(() => setToast(null), 3000);
  }

  // ── Pick phase ────────────────────────────────────────────────────────
  if (phase === "pick") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Mark size={40} className="mb-8" />
        <h1 className="max-w-[16ch] text-balance font-serif text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          What would you like to create today?
        </h1>
        <p className="mt-4 max-w-[46ch] text-ink-2">
          Pick a starting point. I&apos;ll ask a couple of quick questions, then hand you a
          reusable recipe.
        </p>
        <div className="mt-8 flex max-w-lg flex-wrap justify-center gap-2.5">
          {CONTENT_TYPES.map((ct) => {
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
        {!live && (
          <p className="mt-10 text-xs text-ink-3">
            Running in demo mode — add an <span className="font-mono">ANTHROPIC_API_KEY</span> for
            live generation.
          </p>
        )}
      </div>
    );
  }

  // ── Questions + result ────────────────────────────────────────────────
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
            <div className="text-[13px] text-ink-3">Recipe ready — see the panel on the right.</div>
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
      <div className="flex max-h-screen flex-col gap-4 overflow-y-auto bg-surface p-6">
        {phase === "result" ? (
          <>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
                Your prompt
              </span>
              <Badge>reusable recipe</Badge>
              {!live && <span className="ml-auto text-[11px] text-ink-3">demo mode</span>}
            </div>

            <div className="rounded-md border border-hairline bg-surface-2 px-[18px] py-4 text-[13.5px] leading-[1.85]">
              <TemplatePreview template={type?.template ?? ""} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={comingSoon}>
                <Sparkles size={14} />
                Improve
              </Button>
              <Button variant="secondary" size="sm" onClick={copyOutput}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving || generating}>
                <Download size={14} />
                {saving ? "Saving…" : "Save to library"}
              </Button>
            </div>

            <div className="rounded-md border border-hairline bg-surface p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
                Result
              </div>
              <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-ink-2">
                {output}
                {generating && (
                  <span className="ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] animate-pulse rounded-[1px] bg-accent align-middle" />
                )}
              </p>
            </div>

            {toast && (
              <div className="rounded-md border border-mint-line bg-mint px-4 py-3 text-[13px] text-accent-press">
                {toast}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <p className="max-w-[30ch] text-sm text-ink-3">
              Answer the questions on the left. Your reusable recipe and the finished result will
              appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
