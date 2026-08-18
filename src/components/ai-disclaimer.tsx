import { ShieldAlert } from "lucide-react";
import { AI_DISCLAIMER } from "@/lib/ai-prompts";
import { cn } from "@/lib/utils";

export function AiDisclaimer({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-warning-foreground",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="leading-relaxed">
        <span className="font-semibold">Responsible AI: </span>
        {AI_DISCLAIMER}
      </p>
    </div>
  );
}

export function HumanReviewNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Human review step: read this draft carefully, correct anything inaccurate and add missing
      context before you send or share it.
    </p>
  );
}
