import { useEffect, useState } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LayoutDashboard, ShoppingBag, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: '대시보드', exact: true },
  { to: '/admin/orders', icon: ShoppingBag, label: '신청 관리' },
  { to: '/admin/content', icon: FileText, label: '콘텐츠 관리' },
];

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange가 초기 세션 상태도 즉시 emit하므로 단독 사용
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin/login');
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">로딩 중...</div>;

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-background">
      <aside className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-border p-3 sm:p-4 flex flex-row sm:flex-col flex-wrap items-center sm:items-stretch gap-2">
        <h2 className="text-lg font-bold mb-2 sm:mb-6 px-2 w-full sm:w-auto">관리자</h2>
        {navItems.map((item) => {
          const active = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="ml-auto sm:ml-0 sm:mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
