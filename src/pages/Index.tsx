import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import DifferenceSection from '@/components/DifferenceSection';
import RelaxZoneSection from '@/components/RelaxZoneSection';
import CoffeeSection from '@/components/CoffeeSection';
import ServicesSection from '@/components/ServicesSection';
import ClubSection from '@/components/ClubSection';
import TeamSection from '@/components/TeamSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import LocationSection from '@/components/LocationSection';
import ClosingSection from '@/components/ClosingSection';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import FixedBookButton from '@/components/FixedBookButton';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <AboutSection />
          <DifferenceSection />
          <RelaxZoneSection />
          <CoffeeSection />
          <ServicesSection />
          <ClubSection />
          <TeamSection />
          <TestimonialsSection />
          <LocationSection />
          <ClosingSection />
        </main>
        <Footer />
        <WhatsAppButton />
        <FixedBookButton />
      </div>
    </LanguageProvider>
  );
};

export default Index;
