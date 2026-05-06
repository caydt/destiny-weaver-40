-- 브랜드명(서비스 노출용 이름) 컬럼 추가. 사업자명(법적 표기)과 분리.
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS brand_name TEXT;

COMMENT ON COLUMN public.site_settings.brand_name IS '브랜드명 (푸터 카피라이트 등 노출용 서비스 이름)';
