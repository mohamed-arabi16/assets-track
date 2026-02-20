-- ===== RLS & Triggers Migration =====
-- Run this in your Supabase SQL editor

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 2. Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- 3. Assets policies
CREATE POLICY "Users can view own assets" ON assets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own assets" ON assets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own assets" ON assets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own assets" ON assets FOR DELETE USING (user_id = auth.uid());

-- 4. Debts policies
CREATE POLICY "Users can view own debts" ON debts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own debts" ON debts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own debts" ON debts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own debts" ON debts FOR DELETE USING (user_id = auth.uid());

-- 5. Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (user_id = auth.uid());

-- 6. Incomes policies
CREATE POLICY "Users can view own incomes" ON incomes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own incomes" ON incomes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own incomes" ON incomes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own incomes" ON incomes FOR DELETE USING (user_id = auth.uid());

-- 7. User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (user_id = auth.uid());

-- 8. Auto-create profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
