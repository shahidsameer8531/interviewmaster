/**
 * Scoring configuration shared by the report route and the Report screen.
 * Dimensions depend on the track; the bar depends on the target level.
 */

export type Dimension = { key: string; label: string };

export const DIMENSIONS: Record<string, Dimension[]> = {
  behavioral: [
    { key: "structure", label: "Structure (STAR)" },
    { key: "relevance", label: "Relevance" },
    { key: "specificity", label: "Specificity" },
    { key: "results", label: "Results" },
    { key: "communication", label: "Communication" },
    { key: "confidence", label: "Confidence" },
  ],
  system: [
    { key: "requirements", label: "Requirements" },
    { key: "structure", label: "Structure" },
    { key: "communication", label: "Communication" },
    { key: "depth", label: "Technical depth" },
    { key: "tradeoffs", label: "Trade-offs" },
    { key: "estimates", label: "Estimates" },
  ],
  technical: [
    { key: "correctness", label: "Correctness" },
    { key: "approach", label: "Approach" },
    { key: "complexity", label: "Complexity" },
    { key: "edge-cases", label: "Edge cases" },
    { key: "communication", label: "Communication" },
    { key: "testing", label: "Testing" },
  ],
  leadership: [
    { key: "judgement", label: "Judgement" },
    { key: "influence", label: "Influence" },
    { key: "people", label: "People" },
    { key: "outcomes", label: "Outcomes" },
    { key: "communication", label: "Communication" },
    { key: "ownership", label: "Ownership" },
  ],
  product: [
    { key: "framing", label: "Problem framing" },
    { key: "user-insight", label: "User insight" },
    { key: "metrics", label: "Metrics" },
    { key: "prioritisation", label: "Prioritisation" },
    { key: "communication", label: "Communication" },
    { key: "tradeoffs", label: "Trade-offs" },
  ],
};

export const dimensionsFor = (track: string) => DIMENSIONS[track] ?? DIMENSIONS.behavioral;

/** The score a candidate at this level is expected to clear. */
export const LEVEL_BARS: Record<string, number> = {
  Intern: 50,
  Junior: 55,
  "SDE I": 60,
  "SDE II": 70,
  Senior: 75,
  Staff: 80,
  Manager: 75,
};

export const DEFAULT_BAR = 70;
export const barFor = (level: string | undefined | null) => (level && LEVEL_BARS[level]) || DEFAULT_BAR;
export const barLabel = (level: string | undefined | null) => `${level && LEVEL_BARS[level] ? level : "Target"} bar at ${barFor(level)}`;

/** Bars more than this far under the bar turn orange. */
export const ORANGE_GAP = 10;
