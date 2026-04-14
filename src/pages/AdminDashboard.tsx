import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [consultations, reviews, packages] = await Promise.all([
        supabase.from('consultations').select('id, status'),
        supabase.from('reviews').select('id'),
        supabase.from('packages').select('id'),
      ]);
      const pending = consultations.data?.filter(c => c.status === 'pending').length ?? 0;
      return {
        total: consultations.data?.length ?? 0,
        pending,
        reviews: reviews.data?.length ?? 0,
        packages: packages.data?.length ?? 0,
      };
    },
  });

  const cards = [
    { label: '총 신청', value: stats?.total ?? 0 },
    { label: '대기 중', value: stats?.pending ?? 0 },
    { label: '후기', value: stats?.reviews ?? 0 },
    { label: '패키지', value: stats?.packages ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="p-6 rounded-lg bg-card border border-border">
            <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
