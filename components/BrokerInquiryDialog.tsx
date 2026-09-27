"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { buildBrokerInquiryMessage } from "@/lib/brokerInquiry";
import { Listing } from "@/lib/types";

export function BrokerInquiryDialog({ listing }: { listing: Listing }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const message = useMemo(() => buildBrokerInquiryMessage(listing), [listing]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — the message is still visible to copy by hand.
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <MessageCircle className="h-4 w-4" /> Draft WhatsApp Inquiry
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Broker inquiry — {listing.name}</DialogTitle>
            <DialogDescription>
              Pre-filled with the questions this listing&apos;s data can&apos;t answer. Edit
              freely before sending.
            </DialogDescription>
          </DialogHeader>

          <Textarea value={message} readOnly rows={12} className="text-sm" />

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="h-4 w-4 text-success" /> : null}
              {copied ? "Copied!" : "Copy text"}
            </Button>
            <Button onClick={handleOpenWhatsApp} className="gap-1.5">
              <MessageCircle className="h-4 w-4" /> Open in WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
