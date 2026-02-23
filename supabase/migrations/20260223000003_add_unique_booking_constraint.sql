-- Remove duplicate bookings, keeping only the first one
DELETE FROM public.bookings a
WHERE a.id NOT IN (
  SELECT MIN(id) FROM public.bookings b
  GROUP BY b.barber_name, b.day, b.time
);

-- Add unique constraint to prevent double booking
ALTER TABLE public.bookings
ADD CONSTRAINT unique_barber_booking UNIQUE (barber_name, day, time);
