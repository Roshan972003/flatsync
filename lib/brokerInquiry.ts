import { Listing } from "./types";

/**
 * A polite, structured WhatsApp message template asking a broker for the
 * details our listing data never has (maintenance, deposit, lock-in) plus a
 * courtesy confirmation of things we do track (lift, parking) since listing
 * copy is often stale.
 */
export function buildBrokerInquiryMessage(listing: Listing): string {
  return [
    `Hi! We're interested in *${listing.name}* (${listing.locality}, ${listing.city}) and had a` +
      ` few quick questions before we plan a visit:`,
    "",
    `1. Is the lift currently working? (listing shows: ${listing.hasLift ? "has a lift" : "no lift"})`,
    "2. What's the monthly society/maintenance charge, and is it included in the ₹" +
      `${listing.monthlyRentTotal.toLocaleString("en-IN")} rent or extra?`,
    "3. What security deposit is expected, and is it refundable in full at move-out?",
    "4. Is there a lock-in period or notice period we should know about?",
    listing.hasParking
      ? "5. Is the dedicated parking guaranteed to one spot, or shared/first-come?"
      : "5. Is there any parking available nearby, even if not dedicated to the unit?",
    "6. When's the earliest move-in date available?",
    "",
    "Thank you so much — happy to schedule a visit once we hear back!",
  ].join("\n");
}
