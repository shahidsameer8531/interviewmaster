"use client";

import Link from "next/link";
import { useState } from "react";
import { Brain, Download, FileText, Inbox, Mic, Plus, Search, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/app/Eyebrow";
import { PageHeader } from "@/components/app/PageHeader";
import { StatusChip } from "@/components/app/StatusChip";
import { Meter } from "@/components/app/Meter";
import { ScoreRing } from "@/components/app/ScoreRing";
import { ChoiceCard, ChoiceCardGroup } from "@/components/app/ChoiceCard";
import { PillGroup } from "@/components/app/PillGroup";
import { Switch } from "@/components/app/Switch";
import { Field, Input, Select, Textarea } from "@/components/app/Field";
import { EmptyState } from "@/components/app/EmptyState";

const tokens = [
  ["bg", "Page"],
  ["sidebar", "Sidebar, input fill"],
  ["card", "Card"],
  ["raised", "Featured card"],
  ["hover", "Active nav, chips, meter track"],
  ["line", "Card borders, dividers"],
  ["line-strong", "Control borders"],
  ["ink-1", "Primary text"],
  ["ink-2", "Secondary text"],
  ["ink-3", "Labels, meta"],
  ["gold", "Primary button"],
  ["gold-hover", "Hover, focus ring"],
  ["sky", "AI, live state, meters"],
  ["sky-text", "Sky text on navy"],
  ["orange", "Needs work"],
  ["orange-text", "Orange text on navy"],
  ["rec", "Recording dot, End interview"],
] as const;

const Section = ({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) => (
  <section className="rounded-app-card border border-app-line bg-app-card p-6" aria-labelledby={`kit-${title}`}>
    <h2 id={`kit-${title}`} className="font-display text-app-section text-app-ink-1">
      {title}
    </h2>
    {note && <p className="mt-1 text-app-small text-app-ink-2">{note}</p>}
    <div className="mt-5 flex flex-col gap-5">{children}</div>
  </section>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Eyebrow className="mb-2">{label}</Eyebrow>
    <div className="flex flex-wrap items-center gap-3">{children}</div>
  </div>
);

export const DevKit = () => {
  const [track, setTrack] = useState<string | null>("behavioral");
  const [length, setLength] = useState<string | null>("30");
  const [voice, setVoice] = useState(true);
  const [camera, setCamera] = useState(false);
  const [keep, setKeep] = useState(false);
  const [role, setRole] = useState("");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <PageHeader
        eyebrow="Dev kit · not built in production"
        title="Every component, every state"
        meta="Check the tokens here before building screens. Shell previews: rail and focus."
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/dev-kit/rail">Rail shell</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/dev-kit/focus">Focus shell</Link>
            </Button>
          </>
        }
      />

      <Section title="Colour tokens" note="Each swatch is the Tailwind class bg-app-{name}; the CSS variable is --app-{name}.">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          {tokens.map(([name, use]) => (
            <li key={name} className="rounded-app-panel border border-app-line p-2">
              <div className="h-12 rounded-app-control border border-app-line" style={{ background: `var(--app-${name})` }} />
              <p className="mt-2 font-mono text-app-small text-app-ink-1">{name}</p>
              <p className="text-app-small text-app-ink-3">{use}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type scale">
        <p className="font-display text-app-title text-balance text-app-ink-1">Page title, Bricolage 600, 36px</p>
        <p className="font-display text-app-question text-app-ink-1">Question text, Bricolage 500, 26px, line-height 1.3</p>
        <p className="font-display text-app-section text-app-ink-1">Section title, Bricolage 600, 19px</p>
        <p className="text-app-body text-app-ink-1">Body, Manrope 400, 15px, line-height 1.6. Plain, active and specific, in sentence case.</p>
        <p className="text-app-ui text-app-ink-1">UI and buttons, Manrope 600, 14px</p>
        <p className="text-app-small text-app-ink-2">Small, Manrope 400, 13px</p>
        <Eyebrow>Label, JetBrains Mono, 11px, tracking 0.14em</Eyebrow>
        <p className="font-display text-[52px] font-semibold leading-none tabular-nums text-app-ink-1">72</p>
      </Section>

      <Section title="Buttons" note="One gold button per screen. Danger is an outline in rec tones.">
        <Row label="Default 44px">
          <Button>Start round</Button>
          <Button variant="outline">New session</Button>
          <Button variant="ghost">Pick a different round</Button>
          <Button variant="danger">End interview</Button>
          <Button disabled>Disabled</Button>
        </Row>
        <Row label="Small 36px, inside cards only">
          <Button size="sm">Use this</Button>
          <Button size="sm" variant="outline">
            Try another
          </Button>
          <Button size="sm" variant="ghost">
            Dismiss
          </Button>
          <Button size="sm" variant="danger">
            Remove
          </Button>
        </Row>
        <Row label="With icons">
          <Button>
            <Mic className="h-4 w-4" /> Start interview
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" /> Search or jump to <kbd className="ml-1 rounded border border-app-line-strong px-1 font-mono text-[11px]">⌘K</kbd>
          </Button>
        </Row>
      </Section>

      <Section title="StatusChip" note="Always text. Live adds a pulse for an in-progress state only.">
        <Row label="Tones">
          <StatusChip>30 min</StatusChip>
          <StatusChip tone="sky">+6 since last week</StatusChip>
          <StatusChip tone="orange">Above target of 6</StatusChip>
          <StatusChip tone="sky" live>
            Listening
          </StatusChip>
          <StatusChip tone="neutral" icon={Users}>
            Bar-raiser
          </StatusChip>
        </Row>
      </Section>

      <Section title="Meter" note="Numbers before adjectives. The tag names what the colour means.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          <Meter label="Behavioral" value={74} tone="sky" />
          <Meter label="System design" value={52} tone="orange" tag="Weakest" />
          <Meter label="Technical" value={0} tone="neutral" />
          <Meter label="Structure (STAR)" value={64} tone="sky" target={{ value: 70, label: "SDE II bar at 70" }} />
          <Meter label="Communication" value={58} tone="orange" target={{ value: 70, label: "SDE II bar at 70" }} />
          <Meter label="Time on question" value={42} max={60} tone="sky" />
        </div>
      </Section>

      <Section title="ScoreRing" note="Overall score only.">
        <Row label="Values">
          <ScoreRing value={72} />
          <ScoreRing value={0} />
          <ScoreRing value={100} />
          <ScoreRing value={48} size={96} />
        </Row>
      </Section>

      <Section title="ChoiceCard" note="Arrow keys move, Space selects. Selected is a sky outline and dot.">
        <ChoiceCardGroup label="Track" value={track} onChange={setTrack} columns={3}>
          <ChoiceCard value="behavioral" title="Behavioral" description="Conflict, ownership and failure stories" icon={Users} />
          <ChoiceCard value="technical" title="Technical" description="Coding and CS fundamentals, talked through" icon={Brain} />
          <ChoiceCard value="system" title="System design" description="Architecture, scale and trade-offs" icon={Sparkles} />
          <ChoiceCard value="leadership" title="Leadership" description="Influence, hiring and hard calls" />
          <ChoiceCard value="product" title="Product" description="Product sense, metrics and priorities" />
          <ChoiceCard value="disabled" title="Disabled option" description="Not available for this role" disabled />
        </ChoiceCardGroup>
        <p className="text-app-small text-app-ink-3">Selected: {track ?? "none"}</p>
      </Section>

      <Section title="PillGroup" note="Selected is solid ink with navy text, so a pick never looks like a verdict.">
        <Row label="Default 44px">
          <PillGroup
            label="Length"
            value={length}
            onChange={setLength}
            options={[
              { value: "15", label: "15 min" },
              { value: "30", label: "30 min" },
              { value: "45", label: "45 min" },
              { value: "60", label: "60 min" },
              { value: "90", label: "90 min", disabled: true },
            ]}
          />
        </Row>
        <Row label="Small 36px">
          <PillGroup
            size="sm"
            label="Difficulty"
            value="medium"
            onChange={() => {}}
            options={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
          />
        </Row>
      </Section>

      <Section title="Switch" note="On is sky, off is line-strong. 44px hit area.">
        <div className="grid max-w-md gap-4">
          <Switch label="Voice analysis" checked={voice} onCheckedChange={setVoice} />
          <Switch label="Camera analysis" description="Runs on this device" checked={camera} onCheckedChange={setCamera} />
          <Switch
            label="Keep the recording"
            description="Saved in this browser so you can rewatch clips from the report"
            checked={keep}
            onCheckedChange={setKeep}
          />
          <Switch label="Disabled, on" checked onCheckedChange={() => {}} disabled />
          <Switch label="Disabled, off" checked={false} onCheckedChange={() => {}} disabled />
        </div>
      </Section>

      <Section title="Field" note="44px tall, sidebar fill, sky border on focus, gold ring on keyboard focus.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <Field label="Role" htmlFor="kit-role" hint="What the job posting calls it.">
            <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Product Manager" />
          </Field>
          <Field label="Company" htmlFor="kit-company" required>
            <Input placeholder="Stripe" />
          </Field>
          <Field label="Level" htmlFor="kit-level">
            <Select defaultValue="sde2">
              <option value="sde1">SDE I</option>
              <option value="sde2">SDE II</option>
              <option value="senior">Senior</option>
            </Select>
          </Field>
          <Field label="Email" htmlFor="kit-email" error="Enter an email address with an @.">
            <Input type="email" defaultValue="sameer at example" />
          </Field>
          <Field label="Disabled" htmlFor="kit-disabled">
            <Input disabled value="Not editable" readOnly />
          </Field>
          <Field label="What should the coach focus on?" htmlFor="kit-focus" className="sm:col-span-2">
            <Textarea placeholder="Two things you want them to listen for." />
          </Field>
        </div>
      </Section>

      <Section title="EmptyState" note="One icon, one sentence, one action. No sample numbers.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          <EmptyState icon={Inbox} text="Do one round in each track to see this." action={{ label: "Start a round", href: "/dashboard/interview/new" }} />
          <EmptyState icon={FileText} text="No resumes saved yet." action={{ label: "New resume", onClick: () => {} }} />
          <EmptyState icon={Plus} text="Nothing coming up." />
        </div>
      </Section>

      <Section title="PageHeader" note="Eyebrow or breadcrumb, title, one meta line, actions that wrap.">
        <div className="rounded-app-panel border border-app-line p-5">
          <PageHeader
            breadcrumb={[{ label: "Resumes", href: "/dashboard/resume" }, { label: "Stripe PM v3" }]}
            title="Stripe PM v3"
            meta="Saved 4 minutes ago"
            actions={
              <>
                <StatusChip>v3</StatusChip>
                <Button variant="outline" size="sm">
                  Export DOCX
                </Button>
                <Button size="sm">Download PDF</Button>
              </>
            }
          />
        </div>
      </Section>
    </div>
  );
};
