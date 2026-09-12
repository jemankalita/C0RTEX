"use client";

import { AttackPathSection } from "@/components/AttackPathSection";
import { DifferentiationSection } from "@/components/DifferentiationSection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { ProblemSection } from "@/components/ProblemSection";
import { ProductPreview } from "@/components/ProductPreview";
import { RobotProvider } from "@/components/RobotContext";
import { SafetyScoreSection } from "@/components/SafetyScoreSection";
import { SafetySection } from "@/components/SafetySection";
import { ThreatReport } from "@/components/ThreatReport";
import { TrustStrip } from "@/components/TrustStrip";
import { WorkflowSection } from "@/components/WorkflowSection";

export function LandingPage() {
  return (
    <RobotProvider>
      <Navbar />
      <main>
        <HeroSection />
        <div className="relative z-10 bg-black">
          <TrustStrip />
          <ProblemSection />
          <ProductPreview />
          <WorkflowSection />
          <AttackPathSection />
          <SafetyScoreSection />
          <ThreatReport />
          <DifferentiationSection />
          <FeatureGrid />
          <SafetySection />
          <FinalCTA />
          <Footer />
        </div>
      </main>
    </RobotProvider>
  );
}
