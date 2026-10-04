import { Meter } from "@/components/app/Meter";

/**
 * Progress bar built on the app Meter. The default export keeps the
 * `ProgressBar` signature that the resume preview already uses.
 */
export const Progress = Meter;

const ProgressBar = ({ progress, label }: { progress: number; label: string }) => (
  <Meter label={label} value={Math.round(progress)} max={100} tone="sky" />
);

export default ProgressBar;
