-- broadcast_notification() grava category = 'system_broadcast'; a constraint antiga
-- era NOT VALID e não incluía essa categoria, então qualquer UPDATE nessas linhas falhava.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_category_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_category_check CHECK (
  category = ANY (ARRAY[
    'payment_overdue', 'insurance_expiring', 'maintenance_overdue', 'damage_registered',
    'payment_confirmed', 'vehicle_returned', 'plan_expiring', 'km_limit_exceeded',
    'system_broadcast'
  ]::text[])
);

NOTIFY pgrst, 'reload schema';
