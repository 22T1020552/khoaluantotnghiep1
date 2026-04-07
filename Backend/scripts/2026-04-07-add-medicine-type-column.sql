-- Add medicine_type for better management and prescription grouping.
-- Run manually on PostgreSQL before starting backend with ddl-auto=none.

ALTER TABLE public.medicines
    ADD COLUMN IF NOT EXISTS medicine_type VARCHAR(100);

UPDATE public.medicines
SET medicine_type = CASE
    WHEN medicine_type IS NOT NULL AND TRIM(medicine_type) <> '' THEN medicine_type
    WHEN LOWER(COALESCE(medicine_name, '')) LIKE '%cillin%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%cef%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%mycin%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%floxacin%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%amox%'
    THEN 'Khang sinh'
    WHEN LOWER(COALESCE(medicine_name, '')) LIKE '%paracetamol%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%ibuprofen%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%diclofenac%'
    THEN 'Giam dau - Ha sot'
    WHEN LOWER(COALESCE(medicine_name, '')) LIKE '%cetirizin%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%cetirizine%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%loratadin%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%fexofenadin%'
    THEN 'Di ung'
    WHEN LOWER(COALESCE(medicine_name, '')) LIKE '%vitamin%'
    THEN 'Vitamin'
    WHEN LOWER(COALESCE(medicine_name, '')) LIKE '%ho%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%hong%'
      OR LOWER(COALESCE(medicine_name, '')) LIKE '%siro%'
    THEN 'Ho - Hong'
    ELSE 'Khac'
END
WHERE medicine_type IS NULL OR TRIM(medicine_type) = '';

ALTER TABLE public.medicines
    ALTER COLUMN medicine_type SET NOT NULL;
