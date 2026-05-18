-- Run this after the base predictions table has been created.
-- It removes public row reads and exposes only anonymous aggregate functions.

DROP POLICY IF EXISTS "read all" ON public.predictions;

CREATE OR REPLACE FUNCTION public.prediction_name_exists(input_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.predictions
    WHERE name_key = lower(trim(input_name))
  );
$$;

CREATE OR REPLACE FUNCTION public.get_prediction_insights()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH visibility AS (
  SELECT
    count(*)::integer AS total,
    3::integer AS threshold,
    count(*) >= 3 AS visible
  FROM public.predictions
)
SELECT jsonb_build_object(
  'total', v.total,
  'threshold', v.threshold,
  'visible', v.visible,
  'gender', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', options.value,
      'label', options.label,
      'count', COALESCE(counts.count, 0)
    ) ORDER BY options.sort), '[]'::jsonb)
    FROM (
      VALUES
        ('boy', 'Boy', 1),
        ('girl', 'Girl', 2)
    ) AS options(value, label, sort)
    LEFT JOIN (
      SELECT gender AS value, count(*)::integer AS count
      FROM public.predictions
      GROUP BY gender
    ) AS counts ON counts.value = options.value
  ) ELSE '[]'::jsonb END,
  'birthDates', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', birth_date::text,
      'label', to_char(birth_date, 'DD Mon'),
      'count', count
    ) ORDER BY birth_date), '[]'::jsonb)
    FROM (
      SELECT birth_date, count(*)::integer AS count
      FROM public.predictions
      GROUP BY birth_date
    ) AS counts
  ) ELSE '[]'::jsonb END,
  'birthTimes', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', options.value,
      'label', options.label,
      'count', COALESCE(counts.count, 0)
    ) ORDER BY options.sort), '[]'::jsonb)
    FROM (
      VALUES
        ('night', 'Night', 1),
        ('morning', 'Morning', 2),
        ('afternoon', 'Afternoon', 3),
        ('evening', 'Evening', 4)
    ) AS options(value, label, sort)
    LEFT JOIN (
      SELECT
        CASE
          WHEN extract(hour FROM birth_time) BETWEEN 0 AND 5 THEN 'night'
          WHEN extract(hour FROM birth_time) BETWEEN 6 AND 11 THEN 'morning'
          WHEN extract(hour FROM birth_time) BETWEEN 12 AND 17 THEN 'afternoon'
          ELSE 'evening'
        END AS value,
        count(*)::integer AS count
      FROM public.predictions
      GROUP BY value
    ) AS counts ON counts.value = options.value
  ) ELSE '[]'::jsonb END,
  'weights', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', options.value,
      'label', options.label,
      'count', COALESCE(counts.count, 0)
    ) ORDER BY options.sort), '[]'::jsonb)
    FROM (
      VALUES
        ('under-2-5', 'Under 2.5 kg', 1),
        ('2-5-2-9', '2.5-2.9 kg', 2),
        ('3-0-3-4', '3.0-3.4 kg', 3),
        ('3-5-3-9', '3.5-3.9 kg', 4),
        ('4-plus', '4.0 kg+', 5)
    ) AS options(value, label, sort)
    LEFT JOIN (
      SELECT
        CASE
          WHEN weight_g < 2500 THEN 'under-2-5'
          WHEN weight_g < 3000 THEN '2-5-2-9'
          WHEN weight_g < 3500 THEN '3-0-3-4'
          WHEN weight_g < 4000 THEN '3-5-3-9'
          ELSE '4-plus'
        END AS value,
        count(*)::integer AS count
      FROM public.predictions
      GROUP BY value
    ) AS counts ON counts.value = options.value
  ) ELSE '[]'::jsonb END,
  'lengths', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', options.value,
      'label', options.label,
      'count', COALESCE(counts.count, 0)
    ) ORDER BY options.sort), '[]'::jsonb)
    FROM (
      VALUES
        ('under-48', 'Under 48 cm', 1),
        ('48-49', '48-49.9 cm', 2),
        ('50-51', '50-51.9 cm', 3),
        ('52-53', '52-53.9 cm', 4),
        ('54-plus', '54 cm+', 5)
    ) AS options(value, label, sort)
    LEFT JOIN (
      SELECT
        CASE
          WHEN length_cm < 48 THEN 'under-48'
          WHEN length_cm < 50 THEN '48-49'
          WHEN length_cm < 52 THEN '50-51'
          WHEN length_cm < 54 THEN '52-53'
          ELSE '54-plus'
        END AS value,
        count(*)::integer AS count
      FROM public.predictions
      GROUP BY value
    ) AS counts ON counts.value = options.value
  ) ELSE '[]'::jsonb END,
  'hairColours', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', options.value,
      'label', options.label,
      'count', COALESCE(counts.count, 0)
    ) ORDER BY options.sort), '[]'::jsonb)
    FROM (
      VALUES
        ('blonde', 'Blonde', 1),
        ('brown', 'Brown', 2),
        ('black', 'Black', 3),
        ('red', 'Red', 4),
        ('bald', 'Bald / very little', 5)
    ) AS options(value, label, sort)
    LEFT JOIN (
      SELECT hair_colour AS value, count(*)::integer AS count
      FROM public.predictions
      GROUP BY hair_colour
    ) AS counts ON counts.value = options.value
  ) ELSE '[]'::jsonb END,
  'eyeColours', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', options.value,
      'label', options.label,
      'count', COALESCE(counts.count, 0)
    ) ORDER BY options.sort), '[]'::jsonb)
    FROM (
      VALUES
        ('blue', 'Blue', 1),
        ('brown', 'Brown', 2),
        ('green', 'Green', 3),
        ('hazel', 'Hazel', 4),
        ('grey', 'Grey', 5)
    ) AS options(value, label, sort)
    LEFT JOIN (
      SELECT eye_colour AS value, count(*)::integer AS count
      FROM public.predictions
      GROUP BY eye_colour
    ) AS counts ON counts.value = options.value
  ) ELSE '[]'::jsonb END,
  'nameLetters', CASE WHEN v.visible THEN (
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
      'value', value,
      'label', value,
      'count', count
    ) ORDER BY count DESC, value), '[]'::jsonb)
    FROM (
      SELECT upper(name_letter) AS value, count(*)::integer AS count
      FROM public.predictions
      GROUP BY upper(name_letter)
    ) AS counts
  ) ELSE '[]'::jsonb END
)
FROM visibility AS v;
$$;

REVOKE ALL ON FUNCTION public.prediction_name_exists(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_prediction_insights() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.prediction_name_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_prediction_insights() TO anon, authenticated;
