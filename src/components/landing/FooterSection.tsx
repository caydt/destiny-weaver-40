import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FooterSection = () => {
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  const items: Array<[string, string | null | undefined]> = [
    ['상호',                data?.business_name],
    ['대표',                data?.owner],
    ['사업자등록번호',      data?.business_number],
    ['통신판매업 신고번호', data?.mailorder_number],
    ['주소',                data?.address],
    ['전화',                data?.phone],
    ['이메일',              data?.email],
    ['개인정보보호책임자',  data?.privacy_officer],
  ];
  const visible = items.filter(([, v]) => v && v.trim().length > 0);
  const copyrightName = data?.brand_name?.trim() || data?.business_name?.trim() || '사주 상담';

  const brandName = data?.brand_name?.trim();

  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="container mx-auto text-center space-y-2">
        {brandName && (
          <p className="text-sm font-semibold text-foreground/90">{brandName}</p>
        )}
        {visible.length > 0 && (
          <div className="text-xs text-muted-foreground/80 leading-relaxed flex flex-col items-center gap-y-0.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 sm:gap-y-1">
            {visible.map(([label, value]) => (
              <span key={label} className="sm:whitespace-nowrap">
                <span className="text-muted-foreground/60">{label}</span>{' '}
                <span className="break-keep">{value}</span>
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {copyrightName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
