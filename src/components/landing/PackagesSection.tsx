import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const PackagesSection = () => {
  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleSelect = (pkgId: string) => {
    window.dispatchEvent(new CustomEvent('select-package', { detail: pkgId }));
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-5 w-72 mx-auto mb-12" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-surface space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!packages?.length) return null;

  const gridClass = cn(
    'grid gap-6',
    packages.length === 1 && 'max-w-sm mx-auto',
    packages.length === 2 && 'md:grid-cols-2 max-w-3xl mx-auto',
    packages.length === 3 && 'md:grid-cols-3',
    packages.length >= 4 && 'md:grid-cols-2 lg:grid-cols-4',
  );

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          상담 패키지
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          나에게 맞는 상담을 선택해 보세요.
        </p>

        <div className={gridClass}>
          {packages.map((pkg, i) => {
            const isPopular = packages.length >= 3 && i === Math.floor(packages.length / 2);
            return (
              <div
                key={pkg.id}
                className={cn(
                  'relative flex flex-col p-6 rounded-xl border transition-all duration-300',
                  isPopular
                    ? 'bg-primary/10 border-primary/40 md:scale-105'
                    : 'bg-surface border-border hover:border-primary/30'
                )}
                style={{ boxShadow: isPopular ? 'var(--shadow-glow)' : undefined }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    인기
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2 font-heading text-accent">
                  {pkg.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1">
                  {pkg.description}
                </p>
                <div className="text-3xl font-bold mb-5 text-foreground">
                  {pkg.price === 0 ? '무료' : (
                    <>
                      {pkg.price.toLocaleString()}
                      <span className="text-base font-normal text-muted-foreground">원</span>
                    </>
                  )}
                </div>
                <Button
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                  onClick={() => handleSelect(pkg.id)}
                >
                  이 패키지로 신청하기
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
