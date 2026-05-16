import MarketingNav from '@/components/marketing/MarketingNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import HeroSection from '@/components/marketing/sections/HeroSection';
import ProblemSection from '@/components/marketing/sections/ProblemSection';
import SolutionSection from '@/components/marketing/sections/SolutionSection';
import RealEstateSection from '@/components/marketing/sections/RealEstateSection';
import WhyMauritiusSection from '@/components/marketing/sections/WhyMauritiusSection';
import LeadCaptureSection from '@/components/marketing/sections/LeadCaptureSection';
import HowItWorksSection from '@/components/marketing/sections/HowItWorksSection';
import TestimonialsSection from '@/components/marketing/sections/TestimonialsSection';
import FinalCTASection from '@/components/marketing/sections/FinalCTASection';

export const metadata = {
  title: 'OMEGA — Installez-vous à Maurice, sans le stress.',
  description:
    "OMEGA est la plateforme #1 pour les expatriés à l'île Maurice : guides administratifs, communauté locale, immobilier premium éligible aux permis de résidence.",
  openGraph: {
    title: 'OMEGA — Plateforme pour expatriés à Maurice',
    description:
      "Guides experts, communauté vérifiée, immobilier premium. Tout pour réussir votre installation à Maurice.",
    type: 'website',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingNav />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <RealEstateSection />
        <WhyMauritiusSection />
        <LeadCaptureSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FinalCTASection />
      </main>
      <MarketingFooter />
    </div>
  );
}
