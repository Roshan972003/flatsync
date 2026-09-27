"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingEvaluation } from "@/lib/types";
import { buildTradeoffSummary } from "@/lib/matchEngine";
import { formatINR } from "@/lib/utils";

/**
 * Renders an always-in-DOM, screen-hidden summary of the top pick that only
 * becomes visible via the @media print rule in globals.css. "Download" here
 * means the browser's own Print -> Save as PDF flow, so there's no extra
 * PDF-rendering dependency to keep working.
 */
export function AgreementBrief({ topPick }: { topPick: ListingEvaluation }) {
  const { listing, roommateEvaluations, combinedScorePercent } = topPick;
  const perPersonRent = Math.round(listing.monthlyRentTotal / roommateEvaluations.length);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
        <Printer className="h-4 w-4" /> Download Agreement Brief (PDF)
      </Button>

      <div id="print-summary" className="hidden print:block">
        <div style={{ padding: "32px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>FlatSync — Agreement Brief</h1>
          <p style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
            Generated {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
          </p>

          <hr style={{ margin: "16px 0", borderColor: "#ddd" }} />

          <h2 style={{ fontSize: "17px", fontWeight: 700 }}>
            {listing.imageEmoji} {listing.name}
          </h2>
          <p style={{ fontSize: "13px", color: "#333" }}>
            {listing.locality}, {listing.city}
          </p>
          <p style={{ fontSize: "13px", marginTop: "8px" }}>
            Total monthly rent: <strong>{formatINR(listing.monthlyRentTotal)}</strong> ·{" "}
            Combined match score: <strong>{combinedScorePercent}%</strong>
          </p>

          <h3 style={{ fontSize: "14px", fontWeight: 700, marginTop: "20px" }}>
            Rent distribution (equal split)
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "8px", fontSize: "13px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "6px 4px" }}>
                  Roommate
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "6px 4px" }}>
                  Monthly share
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: "6px 4px" }}>
                  Match score
                </th>
              </tr>
            </thead>
            <tbody>
              {roommateEvaluations.map((re) => (
                <tr key={re.roommateId}>
                  <td style={{ padding: "6px 4px", borderBottom: "1px solid #eee" }}>
                    {re.roommateName}
                  </td>
                  <td style={{ padding: "6px 4px", borderBottom: "1px solid #eee" }}>
                    {formatINR(perPersonRent)}
                  </td>
                  <td style={{ padding: "6px 4px", borderBottom: "1px solid #eee" }}>
                    {re.scorePercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ fontSize: "14px", fontWeight: 700, marginTop: "20px" }}>Trade-off summary</h3>
          <p style={{ fontSize: "13px", marginTop: "4px" }}>{buildTradeoffSummary(topPick)}</p>

          <h3 style={{ fontSize: "14px", fontWeight: 700, marginTop: "20px" }}>
            Property details
          </h3>
          <ul style={{ fontSize: "13px", marginTop: "4px", paddingLeft: "18px" }}>
            <li>Lift: {listing.hasLift ? "Yes" : "No"}</li>
            <li>Bedrooms / Bathrooms: {listing.bedrooms} / {listing.bathrooms}</li>
            <li>Furnishing: {listing.furnishing.replace("-", " ")}</li>
            <li>Pet-friendly: {listing.petFriendly ? "Yes" : "No"}</li>
            <li>Dedicated parking: {listing.hasParking ? "Yes" : "No"}</li>
          </ul>

          <p style={{ fontSize: "11px", color: "#888", marginTop: "28px" }}>
            Prepared by FlatSync — not a legal document. Confirm all figures directly with the
            broker/landlord before signing.
          </p>
        </div>
      </div>
    </>
  );
}
