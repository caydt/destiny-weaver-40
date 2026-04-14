import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

const HeroSection = () => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('site_settings').select('*').limit(1).single();
      return data;
    },
  });

  const headline = settings?.hero_headline || '당신의 운명을 읽어드립니다';
  const subtext = settings?.hero_subtext || '사주팔자와 운세를 통해 삶의 방향을 찾아보세요. 전문 역학 상담으로 더 나은 내일을 만들어 드립니다.';

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-accent/5 blur-2xl" />

      <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">전통 역학 · 사주 · 운세</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          {headline}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
          {subtext}
        </p>

        <Button
          size="lg"
          className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg animate-glow-pulse"
          onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          상담 신청하기
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
