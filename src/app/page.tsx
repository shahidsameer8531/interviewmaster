import { Hero } from "@/features/landing-page/components/hero/Hero";
import { TrackTicker } from "@/features/landing-page/components/TrackTicker";
import { HowItWorks } from "@/features/landing-page/components/HowItWorks";
import { Tools } from "@/features/landing-page/components/Tools";
import { Comparison } from "@/features/landing-page/components/Comparison";
import { Pricing } from "@/features/landing-page/components/Pricing";
import { Testimonials } from "@/features/landing-page/components/Testimonials";
import { FAQ } from "@/features/landing-page/components/FAQ";
import { CTA } from "@/features/landing-page/components/CTA";

// Section order follows the visitor's decision: what is it, how does it work,
// which tool do I need, why is it better, what does it cost, who else used it,
// what else do I want to know, go.
export default function Home() {
  return (
    <>
      <Hero />
      <TrackTicker />
      <HowItWorks />
      <Tools />
      <Comparison />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
