"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Copy, Check, Sparkles, Pencil, RotateCcw, Lock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "@/components/prompt/template-preview";
import { StarButton } from "@/components/prompt/star-button";
import {
  updatePromptTemplate,
  restorePromptVersion,
  improvePromptAction,
} from "@/server/actions/prompt-actions";
import type { PromptDetail, VariableSpec, PromptVersionItem } from "@/lib/prompt-types";
import { cn } from "@/lib/utils";

function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) =>
    values[key]?.trim() ? values[key] : `{${key}}`,
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function PromptRunner({
  prompt,
  live,
  canManage,
  versions,
}: {
  prompt: PromptDetail;
  live: boolean;
  canManage: boolean;
  versions: PromptVersionItem[];
}) {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of prompt.variables) init[v.key] = v.type === "select" ? v.options?.[0] ?? "" : "";
    return init;
  });
  const [output, setOutput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(prompt.template);
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

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
        setOutput("You've reached your monthly limit. Upgrade to keep running prompts.");
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

  function startEdit() {
    setDraft(prompt.template);
    setNotice(null);
    setEditing(true);
  }

  function saveEdit() {
    if (!draft.trim()) return;
    startTransition(async () => {
      try {
        await updatePromptTemplate(prompt.id, draft);
        setEditing(false);
        router.refresh();
      } catch {
        setNotice("Couldn't save your changes. Please try again.");
      }
    });
  }

  function improve() {
    if (!canManage) {
      setNotice("Improve is a Pro feature.");
      return;
    }
    startTransition(async () => {
      const result = await improvePromptAction(prompt.id);
      if ("error" in result) {
        setNotice("Improve is a Pro feature.");
        return;
      }
      router.refresh();
    });
  }

  function restore(versionId: string) {
    startTransition(async () => {
      const result = await restorePromptVersion(prompt.id, versionId);
      if ("error" in result) {
        setNotice("Restoring versions is a Pro feature.");
        return;
      }
      router.refresh();
    });
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
        <h1 className="font-serif text-[26px] font-semibold tracking-[-0.015em]">{prompt.title}</h1>
        <Badge>v{prompt.versionNumber}</Badge>
        <StarButton promptId={prompt.id} starred={prompt.starred} size={18} />
        {!live && <span className="ml-auto text-[11px] text-ink-3">demo mode</span>}
      </div>
      <p className="mt-1 text-sm text-ink-2">
        {prompt.runCount === 0 ? "Not run yet" : `Reused ${prompt.runCount}×`}
      </p>

      {/* recipe (view / edit) */}
      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
            Recipe
          </span>
          {!editing && (
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={startEdit} disabled={pending}>
                <Pencil size={13} />
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={improve} disabled={pending}>
                {canManage ? <Sparkles size={13} /> : <Lock size={12} />}
                {pending ? "Improving…" : "Improve"}
              </Button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-2.5">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-hairline-2 bg-surface px-3.5 py-3 font-mono text-[13px] leading-[1.8] text-ink focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--color-mint)] focus-visible:outline-none"
            />
            <p className="text-[11.5px] text-ink-3">
              Wrap variables in curly braces, e.g. <span className="font-mono">{"{product}"}</span>.
              Saving creates a new version.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit} disabled={pending || !draft.trim()}>
                {pending ? "Saving…" : "Save new version"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={pending}
              >
                <X size={14} />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-hairline bg-surface-2 px-[18px] py-4 font-mono text-[13.5px] leading-[1.85]">
            <TemplatePreview template={prompt.template} />
          </div>
        )}
      </div>

      {notice && (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-mint-line bg-mint px-4 py-3 text-[13px] text-accent-press">
          <span>{notice}</span>
          <Link href="/settings/usage" className="ml-auto shrink-0 font-semibold underline">
            View plans
          </Link>
        </div>
      )}

      {/* fields */}
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

      <div className="mt-6">
        <Button onClick={run} disabled={generating}>
          <Play size={15} />
          {generating ? "Generating…" : "Generate"}
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

      {/* version history */}
      <div className="mt-10 border-t border-hairline pt-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-3">
          Version history
        </h2>
        {canManage ? (
          <ul className="mt-3 flex flex-col divide-y divide-hairline">
            {versions.map((v) => (
              <li key={v.id} className="flex items-center gap-3 py-2.5 text-sm">
                <span className="font-mono text-[13px] text-ink">v{v.versionNumber}</span>
                <span className="text-ink-3">{formatDate(v.createdAt)}</span>
                {v.isCurrent ? (
                  <span className="ml-auto">
                    <Badge>current</Badge>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => restore(v.id)}
                    disabled={pending}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent-hover disabled:opacity-50"
                  >
                    <RotateCcw size={13} />
                    Restore
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 flex items-center gap-3 rounded-md border border-hairline bg-surface-2 px-4 py-3.5 text-[13px] text-ink-2">
            <Lock size={15} className="shrink-0 text-ink-3" />
            <span>See and restore every past version on Pro.</span>
            <Link
              href="/settings/usage"
              className="ml-auto shrink-0 font-semibold text-accent hover:text-accent-hover"
            >
              Upgrade →
            </Link>
          </div>
        )}
      </div>
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
