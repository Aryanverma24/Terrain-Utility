import { HeroSection } from "./HeroSection";
import { MissionVision } from "./MissionVision";
import { Founders } from "./Founders";
import { Values } from "./Values";
import { Stats } from "./Stats";
import { CTA } from "./CTA";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      <HeroSection />
      <MissionVision />
      <Stats />
      <Founders />
      <Values />
      <CTA />
    </div>
  );
};

export default About;
