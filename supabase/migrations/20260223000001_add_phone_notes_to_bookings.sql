-- Add phone_number and notes columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN phone_number TEXT NOT NULL DEFAULT '',
ADD COLUMN notes TEXT;

-- Remove the default after adding the column if you want stricter validation
ALTER TABLE public.bookings
ALTER COLUMN phone_number DROP DEFAULT;
