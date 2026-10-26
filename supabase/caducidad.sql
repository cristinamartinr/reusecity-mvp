-- ReUseCity - Caducidad automática de publicaciones
-- TFG - Octubre 2026
--
-- Requiere la extensión pg_cron habilitada en Supabase.
-- Programa una tarea que actualiza cada minuto
-- las publicaciones cuya fecha de caducidad ha pasado.
--
-- Los objetos marcados como REMOVED no se modifican.

SELECT cron.schedule(
  'reusecity-expire-items',
  '* * * * *',
  $$
    UPDATE public.item_reports
    SET status = 'EXPIRED'
    WHERE status = 'AVAILABLE'
      AND expires_at IS NOT NULL
      AND expires_at <= NOW();
  $$
);