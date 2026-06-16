import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import StatsSection from '@/components/StatsSection';
import PopularDishes from '@/components/PopularDishes';
import TasteOfHome from '@/components/TasteOfHome';
import Testimonials from '@/components/Testimonials';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import FloatingBeans from '@/components/FloatingBeans';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <StatsSection />
      <PopularDishes />
      <TasteOfHome />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
