import { UsageMeter } from "@/components/layout/usage-meter";

export default function UsagePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-serif text-2xl font-semibold tracking-[-0.015em]">Plan &amp; usage</h1>
      <p className="mt-2 mb-6 text-ink-2">
        You&apos;re on the Free plan. Metering is enforced server-side on every generation.
      </p>
      <div className="max-w-xs">
        <UsageMeter used={142} limit={200} />
      </div>
    </div>
  );
}
