"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Copy, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/prompt/template-preview";
import type { PromptDetail, VariableSpec } from "@/lib/prompt-types";
import { cn } from "@/lib/utils";

function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) =>
    values[key]?.trim() ? values[key] : `{${key}}`,
  );
}

export function PromptRunner({ prompt, live }: { prompt: PromptDetail; live: boolean }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of prompt.variables) init[v.key] = v.type === "select" ? v.options?.[0] ?? "" : "";
    return init;
  });
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function run() {
    setGenerating(true);
    setOutput("");
    try {
      const res = await fetch("/api/prompts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fillTemplate(prompt.template, values),
          promptId: prompt.id,
          inputs: values,
        }),
      });
      if (res.status === 402) {
        setOutput("You've reached your free monthly limit of generations. Upgrade to keep running prompts.");
        return;
      }
      if (!res.ok || !res.body) {
        setOutput("Something went wrong generating. Please try again.");
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
      setOutput("Something went wrong generating. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-9">
      <div className="mb-3 text-[12.5px] text-ink-3">
        <Link href="/library" className="font-medium text-ink-2 hover:text-ink">
          Library
        </Link>{" "}
        / {prompt.title}
      </div>

      <div className="flex items-center gap-3">
        <h1 className="font-serif text-[26px] font-semibold tracking-[-0.015em]">
          {prompt.title}
        </h1>
        <Badge>v{prompt.versionNumber}</Badge>
        {!live && <span className="text-[11px] text-ink-3">demo mode</span>}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        {prompt.runCount === 0 ? "Not run yet" : `Reused ${prompt.runCount}×`}
      </p>

      <div className="mt-6 rounded-md border border-hairline bg-surface-2 px-[18px] py-4 font-mono text-[13.5px] leading-[1.85]">
        <TemplatePreview template={prompt.template} />
      </div>

      {prompt.variables.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {prompt.variables.map((v) => (
            <Field
              key={v.key}
              spec={v}
              value={values[v.key] ?? ""}
              onChange={(val) => setValues((s) => ({ ...s, [v.key]: val }))}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={run} disabled={generating}>
          <Play size={15} />
          {generating ? "Running…" : "Run prompt"}
        </Button>
        <Button variant="ghost" size="sm" disabled>
          <Sparkles size={14} />
          Improve (soon)
        </Button>
      </div>

      {(output || generating) && (
        <div className="mt-5 rounded-md border border-hairline bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
              Result
            </div>
            {output && !generating && (
              <Button variant="secondary" size="sm" onClick={copyOutput}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-ink-2">
            {output}
            {generating && (
              <span className="ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] animate-pulse rounded-[1px] bg-accent align-middle" />
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  spec,
  value,
  onChange,
}: {
  spec: VariableSpec;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputClass =
    "w-full rounded-md border border-hairline-2 bg-surface px-[13px] py-2.5 text-sm text-ink placeholder:text-ink-3 focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--color-mint)] focus-visible:outline-none";

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-2 text-[12.5px] font-semibold text-ink-2">
        {spec.label}
        <span className="rounded-[5px] border border-mint-line bg-mint px-1.5 font-mono text-[0.8em] font-normal text-accent-hover">
          {`{${spec.key}}`}
        </span>
      </label>

      {spec.type === "select" ? (
        <div className="flex flex-wrap gap-2">
          {spec.options?.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                value === opt
                  ? "border-accent bg-mint text-accent-press"
                  : "border-hairline-2 bg-surface text-ink-2 hover:border-ink-3",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : spec.type === "longtext" ? (
        <textarea
          value={value}
          rows={3}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          value={value}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}
