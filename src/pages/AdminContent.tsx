import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Pencil, Save, Trash2, Plus, Star } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

/* ───── Section 1: Site Settings ───── */

const SiteSettingsSection = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ hero_headline: '', hero_subtext: '', upsell_text: '' });

  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) setForm({ hero_headline: data.hero_headline ?? '', hero_subtext: data.hero_subtext ?? '', upsell_text: data.upsell_text ?? '' });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const { error } = await supabase.from('site_settings').update(form).eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['site-settings'] }); setEditing(false); toast.success('저장되었습니다.'); },
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">사이트 문구</h2>
        {editing ? (
          <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}><Save className="w-4 h-4 mr-1" />저장</Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="w-4 h-4 mr-1" />수정</Button>
        )}
      </div>
      <div className="space-y-3">
        {([['hero_headline', '히어로 헤드라인'], ['hero_subtext', '히어로 서브텍스트'], ['upsell_text', '업셀 텍스트']] as const).map(([key, label]) => (
          <div key={key}>
            <Label className="text-muted-foreground text-xs">{label}</Label>
            {key === 'upsell_text' ? (
              <Textarea value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))} disabled={!editing} className="mt-1" />
            ) : (
              <Input value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))} disabled={!editing} className="mt-1" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

/* ───── Section 2: Packages ───── */

const PackagesSection = () => {
  const queryClient = useQueryClient();
  const { data: packages = [] } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('packages').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (pkg: Tables<'packages'>) => {
      const { error } = await supabase.from('packages').update({ name: pkg.name, description: pkg.description, price: pkg.price, is_active: pkg.is_active, sort_order: pkg.sort_order }).eq('id', pkg.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-packages'] }); toast.success('패키지가 수정되었습니다.'); },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('packages').insert({ name: '새 패키지', price: 0, sort_order: (packages.length + 1) * 10 });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-packages'] }); toast.success('패키지가 추가되었습니다.'); },
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">패키지 관리</h2>
        <Button size="sm" onClick={() => add.mutate()} disabled={add.isPending}><Plus className="w-4 h-4 mr-1" />새 패키지 추가</Button>
      </div>
      <div className="space-y-3">
        {packages.map((pkg) => (
          <PackageRow key={pkg.id} pkg={pkg} onSave={(p) => update.mutate(p)} />
        ))}
      </div>
    </section>
  );
};

const PackageRow = ({ pkg, onSave }: { pkg: Tables<'packages'>; onSave: (p: Tables<'packages'>) => void }) => {
  const [local, setLocal] = useState(pkg);
  useEffect(() => setLocal(pkg), [pkg]);

  const changed = JSON.stringify(local) !== JSON.stringify(pkg);

  return (
    <div className={`p-4 rounded-lg border border-border bg-card space-y-2 ${!local.is_active ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto_auto] gap-3 items-end">
        <div>
          <Label className="text-xs text-muted-foreground">이름</Label>
          <Input value={local.name} onChange={(e) => setLocal(p => ({ ...p, name: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">설명</Label>
          <Input value={local.description ?? ''} onChange={(e) => setLocal(p => ({ ...p, description: e.target.value }))} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">가격</Label>
          <Input type="number" value={local.price} onChange={(e) => setLocal(p => ({ ...p, price: Number(e.target.value) }))} className="mt-1 w-28" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">순서</Label>
          <Input type="number" value={local.sort_order ?? 0} onChange={(e) => setLocal(p => ({ ...p, sort_order: Number(e.target.value) }))} className="mt-1 w-20" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={local.is_active ?? true} onCheckedChange={(v) => { const next = { ...local, is_active: v }; setLocal(next); onSave(next); }} />
          <Label className="text-xs text-muted-foreground">{local.is_active ? '활성' : '비활성'}</Label>
        </div>
        {changed && <Button size="sm" onClick={() => onSave(local)}><Save className="w-4 h-4 mr-1" />저장</Button>}
      </div>
    </div>
  );
};

/* ───── Section 3: Payment Links ───── */

const PaymentLinksSection = () => {
  const queryClient = useQueryClient();

  const { data: packages = [] } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('packages').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: links = [] } = useQuery({
    queryKey: ['payment-links'],
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_links').select('*');
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async ({ packageId, url }: { packageId: string; url: string }) => {
      const existing = links.find(l => l.package_id === packageId);
      if (existing) {
        const { error } = await supabase.from('payment_links').update({ url, updated_at: new Date().toISOString() }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('payment_links').insert({ package_id: packageId, url });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payment-links'] }); toast.success('결제 링크가 저장되었습니다.'); },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">결제 링크</h2>
      <div className="space-y-3">
        {packages.map((pkg) => {
          const link = links.find(l => l.package_id === pkg.id);
          return <PaymentLinkRow key={pkg.id} pkg={pkg} currentUrl={link?.url ?? ''} onSave={(url) => upsert.mutate({ packageId: pkg.id, url })} />;
        })}
      </div>
    </section>
  );
};

const PaymentLinkRow = ({ pkg, currentUrl, onSave }: { pkg: Tables<'packages'>; currentUrl: string; onSave: (url: string) => void }) => {
  const [url, setUrl] = useState(currentUrl);
  useEffect(() => setUrl(currentUrl), [currentUrl]);

  return (
    <div className="flex items-end gap-3 p-4 rounded-lg border border-border bg-card">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">{pkg.name}</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="mt-1" />
      </div>
      {url !== currentUrl && <Button size="sm" onClick={() => onSave(url)}><Save className="w-4 h-4 mr-1" />저장</Button>}
    </div>
  );
};

/* ───── Section 4: Reviews ───── */

const ReviewsSection = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editReview, setEditReview] = useState<Tables<'reviews'> | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [form, setForm] = useState({ author: '', content: '', rating: 5 });

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('reviews').insert(form);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); setOpen(false); setForm({ author: '', content: '', rating: 5 }); toast.success('후기가 등록되었습니다.'); },
  });

  const updateReview = useMutation({
    mutationFn: async (r: Tables<'reviews'>) => {
      const { error } = await supabase.from('reviews').update({ author: r.author, content: r.content, rating: r.rating, is_visible: r.is_visible }).eq('id', r.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); setEditReview(null); toast.success('후기가 수정되었습니다.'); },
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('후기가 삭제되었습니다.'); },
  });

  const toggleVisibility = (r: Tables<'reviews'>) => {
    updateReview.mutate({ ...r, is_visible: !r.is_visible });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">후기 관리</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />새 후기 등록</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>새 후기 등록</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>작성자</Label><Input value={form.author} onChange={(e) => setForm(p => ({ ...p, author: e.target.value }))} className="mt-1" /></div>
              <div><Label>내용</Label><Textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} className="mt-1" /></div>
              <div><Label>별점 (1~5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm(p => ({ ...p, rating: Number(e.target.value) }))} className="mt-1 w-20" /></div>
              <Button onClick={() => create.mutate()} disabled={create.isPending || !form.author || !form.content}>등록</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit modal */}
      <Dialog open={!!editReview} onOpenChange={(v) => !v && setEditReview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>후기 수정</DialogTitle></DialogHeader>
          {editReview && (
            <div className="space-y-3">
              <div><Label>작성자</Label><Input value={editReview.author} onChange={(e) => setEditReview(p => p ? { ...p, author: e.target.value } : p)} className="mt-1" /></div>
              <div><Label>내용</Label><Textarea value={editReview.content} onChange={(e) => setEditReview(p => p ? { ...p, content: e.target.value } : p)} className="mt-1" /></div>
              <div><Label>별점 (1~5)</Label><Input type="number" min={1} max={5} value={editReview.rating ?? 5} onChange={(e) => setEditReview(p => p ? { ...p, rating: Number(e.target.value) } : p)} className="mt-1 w-20" /></div>
              <Button onClick={() => editReview && updateReview.mutate(editReview)} disabled={updateReview.isPending}>저장</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(v) => !v && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>후기를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 후기는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTargetId) deleteReview.mutate(deleteTargetId); setDeleteTargetId(null); }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className={`p-4 rounded-lg border border-border bg-card flex items-start justify-between gap-4 ${!r.is_visible ? 'opacity-40' : ''}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{r.author}</span>
                <span className="flex text-accent">{Array.from({ length: r.rating ?? 0 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{r.content}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Switch checked={r.is_visible ?? true} onCheckedChange={() => toggleVisibility(r)} />
              <Button size="icon" variant="ghost" onClick={() => setEditReview(r)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => setDeleteTargetId(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ───── Main Page ───── */

const AdminContent = () => (
  <div className="space-y-10">
    <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
    <SiteSettingsSection />
    <PackagesSection />
    <PaymentLinksSection />
    <ReviewsSection />
  </div>
);

export default AdminContent;
