import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PackagesSection from '@/components/landing/PackagesSection';
import ReviewsSection from '@/components/landing/ReviewsSection';
import FormSection from '@/components/landing/FormSection';
import FooterSection from '@/components/landing/FooterSection';

const Index = () => {
  const queryClient = useQueryClient();

  // Prefetch packages, reviews, site_settings on mount
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['packages'],
      queryFn: async () => {
        const { data } = await supabase.from('packages').select('*').eq('is_active', true).order('sort_order');
        return data ?? [];
      },
    });
    queryClient.prefetchQuery({
      queryKey: ['reviews'],
      queryFn: async () => {
        const { data } = await supabase.from('reviews').select('*').eq('is_visible', true).order('created_at', { ascending: false });
        return data ?? [];
      },
    });
    queryClient.prefetchQuery({
      queryKey: ['site-settings'],
      queryFn: async () => {
        const { data } = await supabase.from('site_settings').select('*').limit(1).single();
        return data;
      },
    });
  }, [queryClient]);

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
