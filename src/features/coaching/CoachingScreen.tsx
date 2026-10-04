"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { Eyebrow } from "@/components/app/Eyebrow";
import { StatusChip } from "@/components/app/StatusChip";
import { Field, Input, Textarea } from "@/components/app/Field";
import { useAppUser, useCoachingRequests, useSessions, useTarget } from "@/features/app-data/hooks";
import { SERVICES, priceLabel, serviceById, type Service } from "@/config/services";
import { SLOT_HOURS, payloadFor, slotId, slotLabel, timeZoneLabel } from "./booking";

type Step = "times" | "focus" | "confirm";
const STEPS: { id: Step; label: string }[] = [
  { id: "times", label: "Times" },
  { id: "focus", label: "Focus" },
  { id: "confirm", label: "Confirm" },
];

export const CoachingScreen = () => {
  const params = useSearchParams();
  const { user, isGuest } = useAppUser();
  const { target } = useTarget();
  const { sessions } = useSessions();
  const { requests, createRequest } = useCoachingRequests();

  const [service, setService] = useState<Service | null>(null);
  const [step, setStep] = useState<Step>("times");
  const [slots, setSlots] = useState<string[]>([]);
  const [focus, setFocus] = useState("");
  const [share, setShare] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [sentNote, setSentNote] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => setNow(Date.now()), []);
  useEffect(() => {
    setName((n) => n || user?.name || "");
    setEmail((e) => e || user?.email || "");
  }, [user]);

  // "Share with a coach" from a report pre-selects sharing.
  useEffect(() => {
    if (params.get("report")) setShare(true);
  }, [params]);

  const days = useMemo(() => {
    if (now === null) return [];
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + (i + 1) * 86_400_000));
  }, [now]);
  const [day, setDay] = useState(0);

  const recentReports = useMemo(
    () =>
      sessions
        .filter((s) => s.status === "done" && s.report)
        .slice(0, 3)
        .map((s) => s.id),
    [sessions]
  );
  const upcoming = requests.find((r) => r.status === "confirmed") ?? requests.find((r) => r.status === "requested") ?? null;

  const begin = (s: Service) => {
    setService(s);
    setStep("times");
    setState("idle");
    setError(null);
  };

  const toggleSlot = (id: string) => {
    setSlots((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 3 ? cur : [...cur, id]));
  };

  const submit = async () => {
    if (!service) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter an email address so we can confirm a time.");
      return;
    }
    setState("sending");
    setError(null);
    try {
      const payload = payloadFor(service, {
        name,
        email: email.trim(),
        phone,
        slots,
        focus,
        shareReports: share,
        reportIds: share ? recentReports : [],
        target: { role: target?.targetRole, company: target?.targetCompany, level: target?.targetLevel },
      });
      const res = await fetch(service.emailRoute, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; sent?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || "Couldn't send the request. Try again.");
      await createRequest({ service: service.label, slots, focus, shareReports: share });
      setSentNote(data.sent === false ? "Saved. Email delivery is not set up on this server yet, so the request is recorded here." : null);
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send the request. Try again.");
      setState("error");
    }
  };

  const reset = () => {
    setService(null);
    setSlots([]);
    setFocus("");
    setShare(false);
    setState("idle");
    setError(null);
    setStep("times");
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Coaching"
        title="Work with a person"
        meta="Every service has an instant AI version. Book a coach when you want someone to listen and push back."
        actions={
          upcoming ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-app-line-strong bg-app-hover px-3 py-1.5 text-app-small text-app-ink-1">
              <Users className="h-4 w-4 text-app-sky" aria-hidden />
              {upcoming.service} · {upcoming.status === "confirmed" ? `Confirmed, ${slotLabel(upcoming.slots[0] ?? "")}` : "Requested"}
              <button type="button" className="ml-1 font-semibold text-app-sky-text hover:underline" onClick={() => begin(serviceById(SERVICES.find((s) => s.label === upcoming.service)?.id ?? "mock-interview")!)}>
                Reschedule
              </button>
            </span>
          ) : undefined
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Services">
        {SERVICES.map((s) => (
          <li key={s.id} className={cn("flex flex-col rounded-app-card border bg-app-card p-5", service?.id === s.id ? "border-transparent shadow-[0_0_0_1.5px_var(--app-sky)]" : "border-app-line")}>
            <span className="grid h-9 w-9 place-items-center rounded-app-control bg-app-hover text-app-sky">
              <Users className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="mt-3 font-display text-app-section text-app-ink-1">{s.label}</h2>
            <p className="mt-1 flex-1 text-app-small text-app-ink-2">{s.description}</p>
            <p className="mt-3 font-mono text-app-label uppercase text-app-ink-3">{priceLabel(s)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => begin(s)}>
                Book a coach
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={s.aiHref}>Try AI version</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {service && (
        <section className="rounded-app-card border border-app-line bg-app-card p-6" aria-label={`Book ${service.label}`}>
          {state === "sent" ? (
            <div className="flex flex-col items-start gap-3">
              <StatusChip tone="sky" icon={Check}>
                Request sent
              </StatusChip>
              <h2 className="font-display text-app-section text-app-ink-1">{service.label}</h2>
              <p className="text-app-body text-app-ink-2">
                We&apos;ll email you at <span className="text-app-ink-1">{email}</span> to confirm a time. You offered {slots.length} time{slots.length === 1 ? "" : "s"}: {slots.map(slotLabel).join("; ")}.
              </p>
              {sentNote && <p className="text-app-small text-app-ink-3">{sentNote}</p>}
              <Button variant="outline" size="sm" onClick={reset}>
                Book another
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-app-section text-app-ink-1">Book {service.label.toLowerCase()}</h2>
                <ol className="flex items-center gap-2" aria-label="Booking steps">
                  {STEPS.map((s, i) => {
                    const idx = STEPS.findIndex((x) => x.id === step);
                    const done = i < idx;
                    const on = s.id === step;
                    return (
                      <li key={s.id} className="flex items-center gap-2">
                        <span className={cn("grid h-6 w-6 place-items-center rounded-full font-mono text-[11px]", on ? "bg-app-ink-1 text-app-bg" : done ? "bg-app-sky text-app-bg" : "bg-app-hover text-app-ink-3")} aria-current={on ? "step" : undefined}>
                          {done ? <Check className="h-3 w-3" aria-hidden /> : i + 1}
                        </span>
                        <span className={cn("text-app-small", on ? "text-app-ink-1" : "text-app-ink-3")}>{s.label}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {step === "times" && (
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <Eyebrow>Pick up to 3 times · times in {timeZoneLabel()}</Eyebrow>
                    <span className="text-app-small text-app-ink-3">{slots.length} of 3</span>
                  </div>
                  <ol className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Days">
                    {days.map((d, i) => (
                      <li key={d.getTime()}>
                        <button type="button" onClick={() => setDay(i)} aria-pressed={day === i} className={cn("min-w-[72px] rounded-app-control border px-3 py-2 text-center", day === i ? "border-app-ink-1 bg-app-ink-1 text-app-bg" : "border-app-line-strong text-app-ink-2 hover:bg-app-hover")}>
                          <span className="block font-mono text-[11px] uppercase">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                          <span className="block text-app-ui">{d.getDate()}</span>
                        </button>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Times">
                    {days[day] &&
                      SLOT_HOURS.map((h) => {
                        const id = slotId(days[day], h);
                        const on = slots.includes(id);
                        return (
                          <button key={id} type="button" onClick={() => toggleSlot(id)} aria-pressed={on} disabled={!on && slots.length >= 3} className={cn("h-11 rounded-full border px-4 text-app-ui", on ? "border-app-ink-1 bg-app-ink-1 text-app-bg" : "border-app-line-strong text-app-ink-2 hover:bg-app-hover disabled:opacity-40")}>
                            {new Date(id).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          </button>
                        );
                      })}
                  </div>
                  {slots.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Chosen times">
                      {slots.map((s) => (
                        <li key={s}>
                          <span className="inline-flex h-8 items-center gap-1 rounded-full bg-app-hover pl-3 pr-1 text-app-small text-app-ink-1">
                            {slotLabel(s)}
                            <button type="button" onClick={() => toggleSlot(s)} className="grid h-6 w-6 place-items-center rounded-full hover:bg-app-line-strong" aria-label={`Remove ${slotLabel(s)}`}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-5 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setStep("focus")} disabled={slots.length === 0}>
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === "focus" && (
                <div className="mt-5 grid gap-4">
                  <Field label="What should the coach focus on?" htmlFor="coach-focus" hint="One or two things you want them to listen for.">
                    <Textarea rows={4} value={focus} onChange={(e) => setFocus(e.target.value)} />
                  </Field>
                  <label className="flex items-start gap-3 text-app-small text-app-ink-2">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#7cc4ff]" checked={share} onChange={(e) => setShare(e.target.checked)} />
                    <span>
                      Share my last 3 interview reports with the coach
                      {recentReports.length === 0 && <span className="block text-app-ink-3">You have no scored reports yet.</span>}
                    </span>
                  </label>
                  <div className="flex justify-between">
                    <Button variant="ghost" size="sm" onClick={() => setStep("times")}>
                      Back
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setStep("confirm")}>
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === "confirm" && (
                <div className="mt-5 grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Name" htmlFor="coach-name">
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </Field>
                    <Field label="Email" htmlFor="coach-email" required hint={isGuest ? "Where we confirm the time." : undefined}>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    <Field label="Phone" htmlFor="coach-phone">
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </Field>
                  </div>
                  <dl className="grid gap-2 rounded-app-panel bg-app-hover/40 p-4 text-app-small">
                    <div className="flex justify-between gap-3">
                      <dt className="text-app-ink-3">Service</dt>
                      <dd className="text-app-ink-1">{service.label}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-app-ink-3">Times</dt>
                      <dd className="text-right text-app-ink-1">{slots.map(slotLabel).join("; ")}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-app-ink-3">Focus</dt>
                      <dd className="text-right text-app-ink-1">{focus || "Not given"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-app-ink-3">Reports</dt>
                      <dd className="text-app-ink-1">{share ? `Last ${recentReports.length}` : "Not shared"}</dd>
                    </div>
                  </dl>
                  {error && (
                    <p role="alert" className="text-app-small text-app-orange-text">
                      {error}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="ghost" size="sm" onClick={() => setStep("focus")}>
                      Back
                    </Button>
                    <Button onClick={submit} disabled={state === "sending"}>
                      {state === "sending" ? "Sending" : "Request these times"}
                    </Button>
                  </div>
                  <p className="text-app-small text-app-ink-3">We&apos;ll email you at {email || "your address"} to confirm a time.</p>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
};
