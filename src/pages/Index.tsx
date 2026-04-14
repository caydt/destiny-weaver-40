import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PackagesSection from '@/components/landing/PackagesSection';
import ReviewsSection from '@/components/landing/ReviewsSection';
import FormSection from '@/components/landing/FormSection';
import FooterSection from '@/components/landing/FooterSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <PackagesSection />
      <ReviewsSection />
      <FormSection />
      <FooterSection />
    </div>
  );
};

export default Index;
