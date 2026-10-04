/**
 * The six coaching services. Prices are null until Sameer sets them; the
 * code they replaced disagreed with itself ($2, $5, $10, $79, $149, $99),
 * so nothing is shown until a real number exists.
 */

export type ServiceId = "mock-interview" | "interview-coaching" | "cv-revision" | "career-consultation" | "salary-negotiation" | "personal-branding";

export type Service = {
  id: ServiceId;
  label: string;
  description: string;
  /** Whole currency units, or null for "Price on request". */
  price: number | null;
  currency: "USD";
  /** The instant AI version of the same service. */
  aiHref: string;
  /** The existing email route that delivers a booking request. */
  emailRoute: string;
};

export const SERVICES: Service[] = [
  {
    id: "mock-interview",
    label: "Mock interview",
    description: "A full round with a human interviewer and a written debrief.",
    price: null,
    currency: "USD",
    aiHref: "/dashboard/interview/new",
    emailRoute: "/api/send-mock-test",
  },
  {
    id: "interview-coaching",
    label: "Interview coaching",
    description: "One-to-one sessions on the answers you keep getting wrong.",
    price: null,
    currency: "USD",
    aiHref: "/services/interview-coaching/ai",
    emailRoute: "/api/send-interview-coaching",
  },
  {
    id: "cv-revision",
    label: "CV revision",
    description: "A reviewer rewrites your CV with you, line by line.",
    price: null,
    currency: "USD",
    aiHref: "/services/cv-revision/ai",
    emailRoute: "/api/send-cv-revision",
  },
  {
    id: "career-consultation",
    label: "Career consultation",
    description: "A planning session for your next move and how to get there.",
    price: null,
    currency: "USD",
    aiHref: "/services/consultation/ai",
    emailRoute: "/api/send-consultation-email",
  },
  {
    id: "salary-negotiation",
    label: "Salary negotiation",
    description: "Scripts and numbers for the offer conversation.",
    price: null,
    currency: "USD",
    aiHref: "/services/salary-negotiation/ai",
    emailRoute: "/api/send-salary-negotiation",
  },
  {
    id: "personal-branding",
    label: "Personal branding",
    description: "LinkedIn, portfolio and the story you tell about yourself.",
    price: null,
    currency: "USD",
    aiHref: "/services/personal-branding/ai",
    emailRoute: "/api/send-personal-branding",
  },
];

export const serviceById = (id: string) => SERVICES.find((s) => s.id === id) ?? null;

export const priceLabel = (s: Service) => (s.price === null ? "Price on request" : `$${s.price} per session`);
