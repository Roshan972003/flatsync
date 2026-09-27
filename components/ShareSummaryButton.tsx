"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppSummary } from "@/lib/matchEngine";
import { ListingEvaluation } from "@/lib/types";

export function ShareSummaryButton({ topListings }: { topListings: ListingEvaluation[] }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const summary = buildWhatsAppSummary(topListings);

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable (permissions, insecure context, etc.) —
      // the WhatsApp share link below still carries the full text.
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
      {copied ? <Check className="h-4 w-4 text-success" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Copied — opening WhatsApp" : "Share top picks to WhatsApp"}
    </Button>
  );
}
