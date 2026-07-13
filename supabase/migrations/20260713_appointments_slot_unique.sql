-- ============================================================
-- Candado anti doble-reserva — EvangelCake
-- ============================================================
-- Garantiza a nivel de base de datos que no puedan existir dos
-- citas vivas (pendiente/confirmada) en el mismo día y hora,
-- aunque dos personas confirmen exactamente a la vez.
-- Las canceladas/no-show no bloquean el hueco.
-- ============================================================

create unique index if not exists appointments_slot_unique
  on public.appointments (appointment_date, appointment_slot)
  where status in ('pending', 'confirmed');
