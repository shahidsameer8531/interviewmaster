import type { Service } from "@/config/services";

export type Booking = {
  name: string;
  email: string;
  phone: string;
  slots: string[];
  focus: string;
  shareReports: boolean;
  reportIds: string[];
  target: { role?: string; company?: string; level?: string };
};

const NOT_GIVEN = "Not given";

/** Local slot times offered each day. */
export const SLOT_HOURS = [9, 11, 14, 16, 18];

export const slotId = (day: Date, hour: number) => {
  const d = new Date(day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const slotLabel = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const timeZoneLabel = () => {
  try {
    const parts = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "local time";
  }
};

/**
 * Maps one booking onto the fields each existing email route validates.
 * The routes were built for separate forms, so the same facts land in
 * differently named fields.
 */
export function payloadFor(service: Service, b: Booking): Record<string, unknown> {
  const first = b.slots[0] ? new Date(b.slots[0]) : null;
  const preferredDate = first ? first.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : NOT_GIVEN;
  const preferredTime = first ? first.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : NOT_GIVEN;
  const slotsText = b.slots.map(slotLabel).join("; ");
  const message = [
    `Focus: ${b.focus || NOT_GIVEN}`,
    `Times offered (${timeZoneLabel()}): ${slotsText || NOT_GIVEN}`,
    b.shareReports ? `Share the last ${b.reportIds.length} interview report${b.reportIds.length === 1 ? "" : "s"}: yes (${b.reportIds.join(", ") || "none yet"})` : "Share interview reports: no",
    "Sent from Prep Room",
  ].join("\n");
  const base = {
    name: b.name || NOT_GIVEN,
    email: b.email,
    phone: b.phone || NOT_GIVEN,
    package: service.label,
    experience: b.target.level || NOT_GIVEN,
    targetRole: b.target.role || NOT_GIVEN,
    preferredDate,
    preferredTime,
    message,
  };
  switch (service.id) {
    case "mock-interview":
    case "interview-coaching":
      return base;
    case "cv-revision":
      return {
        ...base,
        industry: NOT_GIVEN,
        currentJobTitle: b.target.role || NOT_GIVEN,
        targetJobTitle: b.target.role || NOT_GIVEN,
        additionalNotes: message,
        cvUrl: "",
        linkedinUrl: "",
        githubUrl: "",
      };
    case "career-consultation":
      return {
        ...base,
        consultationType: "Career consultation",
        jobTitle: b.target.role || NOT_GIVEN,
        company: b.target.company || NOT_GIVEN,
        goals: b.focus || NOT_GIVEN,
        heardFrom: "Prep Room",
        preferredMethod: "Video call",
      };
    case "salary-negotiation":
      return {
        ...base,
        currentRole: b.target.role || NOT_GIVEN,
        company: b.target.company || NOT_GIVEN,
        currentSalary: NOT_GIVEN,
        targetSalary: NOT_GIVEN,
        offerStage: NOT_GIVEN,
      };
    case "personal-branding":
      return {
        ...base,
        currentRole: b.target.role || NOT_GIVEN,
        industry: NOT_GIVEN,
        linkedin: "",
        github: "",
        portfolio: "",
      };
  }
}
