import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarCheck, ClipboardList, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      const { data: consultations } = await supabase
        .from('consultations')
        .select('id, status, created_at');

      const all = consultations ?? [];
      const total = all.length;
      const todayCount = all.filter(c => c.created_at.startsWith(todayStr)).length;
      const doneCount = all.filter(c => c.status === 'done').length;
      const completionRate = total > 0 ? ((doneCount / total) * 100).toFixed(1) : '0.0';

      return { todayCount, total, completionRate };
    },
  });

  const cards = [
    {
      label: '오늘 신청 수',
      value: stats?.todayCount ?? 0,
      icon: CalendarCheck,
    },
    {
      label: '전체 신청 수',
      value: stats?.total ?? 0,
      icon: ClipboardList,
    },
    {
      label: '완료율',
      value: `${stats?.completionRate ?? '0.0'}%`,
      icon: CheckCircle2,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="p-6 rounded-xl bg-surface border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <card.icon className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
            <p className="text-3xl font-bold text-accent">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
