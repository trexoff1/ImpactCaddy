-- Fix for the `Database error saving new user` 500 Error
-- Copy and run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, charity_id, charity_percentage)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CAST(NEW.raw_user_meta_data->>'charity_id' AS UUID),
    COALESCE(CAST(NEW.raw_user_meta_data->>'charity_percentage' AS NUMERIC), 10)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
