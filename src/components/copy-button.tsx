import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyButton({
  value,
  label = "Copy",
  variant = "outline",
  size = "sm",
}: {
  value: string;
  label?: string;
  variant?: "outline" | "secondary" | "ghost" | "default";
  size?: "sm" | "default";
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1800);
        } catch {
          toast.error("Your browser blocked copying. Select the text and copy manually.");
        }
      }}
    >
      {copied ? <Check className="text-success" /> : <Copy />}
      {label}
    </Button>
  );
}
