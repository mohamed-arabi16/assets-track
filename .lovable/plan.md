

# Production-Ready Plan for Balance Tracker

This plan covers fixing the immediate build errors and then converting the app from mock/demo data to a fully functional production application backed by Supabase.

---

## Phase 1: Fix Build Errors

**File: `src/pages/Assets.tsx`**
- The `Asset` interface defines `id` as `string`, but mock data uses numeric IDs (`1`, `2`, `3`). Change them to strings (`"1"`, `"2"`, `"3"`).

---

## Phase 2: Real Authentication with Supabase

**Current problem:** Auth is fake -- any email + 6-char password logs you in, stored in localStorage. No real accounts exist.

**Changes:**

1. **`src/contexts/AuthContext.tsx`** -- Replace the mock login/register/logout with real Supabase auth:
   - `login` calls `supabase.auth.signInWithPassword()`
   - `register` calls `supabase.auth.signUp()` and creates a profile row
   - `logout` calls `supabase.auth.signOut()`
   - Use `onAuthStateChange` listener (set up before `getSession()`) to track session
   - Remove localStorage-based user management

2. **`src/pages/SignIn.tsx`** / **`src/pages/SignUp.tsx`** -- No structural changes needed; they already call the context methods.

3. **`src/components/ProtectedRoute.tsx`** -- Update to check Supabase session instead of localStorage user.

---

## Phase 3: Real CRUD Operations (Replace All Mock Data)

Every page currently uses hardcoded arrays. Each will be updated to fetch from and write to Supabase tables.

### 3a. Income Page (`src/pages/Income.tsx`)
- Fetch incomes from `incomes` table filtered by `user_id`
- Wire up "Add Income" dialog form to insert rows
- Wire up Edit/Delete buttons to update/delete rows
- Use `formatCurrency` from context (currently missing)

### 3b. Expenses Page (`src/pages/Expenses.tsx`)
- Fetch expenses from `expenses` table filtered by `user_id`
- Wire up "Add Expense" button to open a dialog and insert rows
- Wire up Edit/Delete buttons

### 3c. Debts Page (`src/pages/Debts.tsx`)
- Fetch debts from `debts` table filtered by `user_id`
- Add an "Add Debt" dialog
- Wire up Edit/Delete buttons

### 3d. Assets Page (`src/pages/Assets.tsx`)
- Already fetches from Supabase but falls back to mock data
- Wire up "Add Asset" dialog form to actually insert
- Wire up Edit/Delete buttons

### 3e. Dashboard (`src/pages/Dashboard.tsx`)
- Replace hardcoded values with real aggregated data from all tables
- Recent Activity section should show actual recent transactions

---

## Phase 4: Settings That Actually Apply

**File: `src/pages/Settings.tsx`**
- Connect currency selector to `useCurrency` context
- Persist settings to `user_settings` table in Supabase
- Load settings on app start and apply (theme, currency, language)

---

## Phase 5: Row-Level Security (RLS)

Add RLS policies so each user can only access their own data:
- Enable RLS on all tables (`assets`, `debts`, `expenses`, `incomes`, `user_settings`, `profiles`)
- Add policies: `SELECT/INSERT/UPDATE/DELETE WHERE user_id = auth.uid()`
- Create a trigger to auto-create a `profiles` row and `user_settings` row on user signup

---

## Phase 6: Polish and Edge Cases

- Add loading states/spinners when fetching data
- Add empty states ("No income recorded yet") for each page
- Add confirmation dialogs for delete actions
- Add form validation with proper error messages on all dialogs
- Ensure the month filter in TopNavbar actually filters data across pages

---

## Technical Details

### Database Migration (new SQL migration)
```text
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for each table (users see only their own data)
-- Profile auto-creation trigger on auth.users insert
-- user_settings auto-creation trigger on auth.users insert
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `src/contexts/AuthContext.tsx` | Rewrite with Supabase auth |
| `src/pages/Assets.tsx` | Fix type error + real CRUD |
| `src/pages/Income.tsx` | Real CRUD + formatCurrency |
| `src/pages/Expenses.tsx` | Real CRUD |
| `src/pages/Debts.tsx` | Real CRUD + Add dialog |
| `src/pages/Dashboard.tsx` | Real aggregated data |
| `src/pages/Settings.tsx` | Connect to context + persist |
| `src/components/ProtectedRoute.tsx` | Use Supabase session |
| `database/schema.sql` | Add RLS policies + triggers |

