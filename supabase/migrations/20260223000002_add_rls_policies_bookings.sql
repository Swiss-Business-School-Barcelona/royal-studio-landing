-- Create RLS policies for bookings table
-- Allow anyone to insert bookings
CREATE POLICY "Enable insert for all users" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read bookings (optional, for confirmation/status checks)
CREATE POLICY "Enable read for all users" ON public.bookings
  FOR SELECT
  USING (true);
