"use client";

import { AccuracySection } from "@/components/AccuracySection";
import { AttackPathSection } from "@/components/AttackPathSection";
import { DifferentiationSection } from "@/components/DifferentiationSection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { ProblemSection } from "@/components/ProblemSection";
import { ProgressRail } from "@/components/ProgressRail";
import { ProductPreview } from "@/components/ProductPreview";
import { RobotProvider } from "@/components/RobotContext";
import { ScrollingBand } from "@/components/ScrollingBand";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SafetyScoreSection } from "@/components/SafetyScoreSection";
import { SafetySection } from "@/components/SafetySection";
import { ThreatReport } from "@/components/ThreatReport";
import { TrustStrip } from "@/components/TrustStrip";
import { WorkflowSection } from "@/components/WorkflowSection";

export function LandingPage() {
  return (
    <RobotProvider>
      <SmoothScroll />
      <GrainOverlay />
      <ProgressRail />
      <Navbar />
      <main>
        <HeroSection />
        <div className="relative z-10 bg-black">
          <TrustStrip />
          <ProblemSection />
          <ScrollingBand />
          <ProductPreview />
          <WorkflowSection />
          <AttackPathSection />
          <SafetyScoreSection />
          <AccuracySection />
          <ThreatReport />
          <DifferentiationSection />
          <ScrollingBand />
          <FeatureGrid />
          <SafetySection />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </RobotProvider>
  );
}
