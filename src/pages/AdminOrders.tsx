import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Status = 'pending' | 'in_progress' | 'done';

const statusConfig: Record<Status, { label: string; className: string }> = {
  pending: { label: '대기중', className: 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/30' },
  in_progress: { label: '진행중', className: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30' },
  done: { label: '완료', className: 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30' },
};

const statusOptions: Status[] = ['pending', 'in_progress', 'done'];

// 컴포넌트 외부에 정의 — AdminOrders 리렌더 시 remount 방지
const StatusBadge = ({
  id,
  status,
  onUpdate,
}: {
  id: string;
  status: Status;
  onUpdate: (id: string, status: Status) => void;
}) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <Badge variant="outline" className={cn('cursor-pointer border', config.className)}>
            {config.label}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => onUpdate(id, s)}
            className={cn(s === status && 'font-bold')}
          >
            {statusConfig[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data: consultations, isLoading } = useQuery({
    queryKey: ['admin-consultations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('consultations')
        .select('*, packages(name)')
        .order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const { error } = await supabase
        .from('consultations')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-consultations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('상태가 변경되었습니다.');
    },
    onError: () => toast.error('상태 변경에 실패했습니다.'),
  });

  const handleStatusUpdate = (id: string, status: Status) => {
    updateStatus.mutate({ id, status });
  };

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">신청 내역 관리</h1>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        신청 내역 관리
        <span className="text-base font-normal text-muted-foreground ml-3">
          총 {consultations?.length ?? 0}건
        </span>
      </h1>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-surface hover:bg-surface">
              <TableHead className="w-[140px]">신청일시</TableHead>
              <TableHead className="w-[80px]">이름</TableHead>
              <TableHead className="w-[50px]">성별</TableHead>
              <TableHead className="w-[110px]">생년월일</TableHead>
              <TableHead className="w-[80px]">시간모름</TableHead>
              <TableHead className="w-[100px]">패키지</TableHead>
              <TableHead>질문</TableHead>
              <TableHead className="w-[90px]">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations?.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-sm">
                  {format(new Date(c.created_at), 'yy.MM.dd HH:mm', { locale: ko })}
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.gender === 'M' ? '남' : c.gender === 'F' ? '여' : '-'}</TableCell>
                <TableCell className="text-sm">{c.birth_date}</TableCell>
                <TableCell>{c.birth_time_unknown ? '모름' : (c.birth_time || '-')}</TableCell>
                <TableCell className="text-sm">
                  {(c.packages as { name: string } | null)?.name ?? '-'}
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-sm cursor-default">{truncate(c.question, 50)}</span>
                    </TooltipTrigger>
                    {c.question.length > 50 && (
                      <TooltipContent className="max-w-sm whitespace-pre-wrap">
                        {c.question}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <StatusBadge id={c.id} status={(c.status as Status) || 'pending'} onUpdate={handleStatusUpdate} />
                </TableCell>
              </TableRow>
            ))}
            {!consultations?.length && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  신청 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {consultations?.map((c) => (
          <div key={c.id} className="p-4 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{c.name}</span>
              <StatusBadge id={c.id} status={(c.status as Status) || 'pending'} onUpdate={handleStatusUpdate} />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                {format(new Date(c.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                {' · '}
                {c.gender === 'M' ? '남' : c.gender === 'F' ? '여' : '-'}
              </p>
              <p>생년월일: {c.birth_date} {c.birth_time_unknown ? '(시간 모름)' : (c.birth_time || '')}</p>
              <p>패키지: {(c.packages as { name: string } | null)?.name ?? '-'}</p>
            </div>
            <p className="text-sm pt-1 border-t border-border">{c.question}</p>
          </div>
        ))}
        {!consultations?.length && (
          <p className="text-center text-muted-foreground py-12">신청 내역이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
