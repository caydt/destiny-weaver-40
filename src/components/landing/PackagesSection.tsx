import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PackagesSection = () => {
  const { data: packages } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      return data ?? [];
    },
  });

  if (!packages?.length) return null;

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          상담 패키지
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          나에게 맞는 상담을 선택해 보세요.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <div
              key={pkg.id}
              className={`relative p-6 rounded-lg border transition-all duration-300 ${
                i === 1
                  ? 'bg-primary/10 border-primary/40 scale-105'
                  : 'bg-card border-border hover:border-primary/30'
              }`}
              style={{ boxShadow: i === 1 ? 'var(--shadow-glow)' : undefined }}
            >
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  인기
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 min-h-[40px]">{pkg.description}</p>
              <div className="text-3xl font-bold mb-6">
                {pkg.price.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground">원</span>
              </div>
              <Button
                className="w-full"
                variant={i === 1 ? 'default' : 'outline'}
                onClick={() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                신청하기
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
