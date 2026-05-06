-- 사업자정보 컬럼 추가 (전자상거래법 푸터 표기용)
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS business_name      TEXT,
  ADD COLUMN IF NOT EXISTS owner               TEXT,
  ADD COLUMN IF NOT EXISTS business_number     TEXT,
  ADD COLUMN IF NOT EXISTS mailorder_number    TEXT,
  ADD COLUMN IF NOT EXISTS address             TEXT,
  ADD COLUMN IF NOT EXISTS phone               TEXT,
  ADD COLUMN IF NOT EXISTS email               TEXT,
  ADD COLUMN IF NOT EXISTS privacy_officer     TEXT;

COMMENT ON COLUMN public.site_settings.business_name   IS '상호 (회사명)';
COMMENT ON COLUMN public.site_settings.owner           IS '대표자명';
COMMENT ON COLUMN public.site_settings.business_number IS '사업자등록번호';
COMMENT ON COLUMN public.site_settings.mailorder_number IS '통신판매업 신고번호';
COMMENT ON COLUMN public.site_settings.address         IS '사업장 주소';
COMMENT ON COLUMN public.site_settings.phone           IS '대표 전화';
COMMENT ON COLUMN public.site_settings.email           IS '이메일';
COMMENT ON COLUMN public.site_settings.privacy_officer IS '개인정보보호책임자';
