-- C-1 수정: consultations SELECT를 authenticated 전용으로 변경
DROP POLICY IF EXISTS "Anyone can view consultations" ON public.consultations;
CREATE POLICY "Authenticated can view consultations" ON public.consultations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- payment_links도 authenticated 전용으로
DROP POLICY IF EXISTS "Anyone can view payment_links" ON public.payment_links;
CREATE POLICY "Authenticated can view payment_links" ON public.payment_links
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 초기 site_settings 데이터 (없을 경우에만 삽입)
INSERT INTO public.site_settings (hero_headline, hero_subtext, upsell_text)
SELECT
  '당신의 운명을 읽어드립니다',
  '사주 명리학으로 삶의 방향을 찾아보세요',
  'PDF 심층 리포트를 추가하시면 50% 할인된 가격에 제공해 드립니다.'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- 초기 패키지 데이터 (없을 경우에만 삽입)
INSERT INTO public.packages (name, description, price, is_active, sort_order)
SELECT * FROM (VALUES
  ('기본 상담', '사주 원국 분석 + 핵심 운세 안내', 39000, true, 1),
  ('심화 상담', '기본 상담 + 대운·세운 흐름 분석', 69000, true, 2),
  ('프리미엄 상담', '심화 상담 + PDF 리포트 + 후속 질문 1회', 99000, true, 3)
) AS v(name, description, price, is_active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.packages);
