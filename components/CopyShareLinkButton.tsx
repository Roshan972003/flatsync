"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareableUrl } from "@/lib/urlState";
import { RoommateProfile, RoommateId } from "@/lib/types";

export function CopyShareLinkButton({
  profiles,
  currentStep,
}: {
  profiles: Record<RoommateId, RoommateProfile>;
  currentStep: 1 | 2 | 3;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = buildShareableUrl({ profiles, currentStep });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable — nothing more we can do without prompting
      // a manual copy, which the button label already implies on failure.
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
      {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      {copied ? "Link copied!" : "Copy shareable link"}
    </Button>
  );
}
