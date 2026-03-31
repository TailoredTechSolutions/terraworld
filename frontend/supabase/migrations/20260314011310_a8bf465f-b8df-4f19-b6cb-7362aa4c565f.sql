
-- Manual Adjustments table for admin financial corrections
CREATE TABLE public.manual_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage adjustments"
  ON public.manual_adjustments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own adjustments"
  ON public.manual_adjustments FOR SELECT
  USING (auth.uid() = target_user_id);

-- Payout Runs table
CREATE TABLE public.payout_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_type TEXT NOT NULL CHECK (payout_type IN ('farmer', 'driver', 'affiliate')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method TEXT,
  notes TEXT,
  created_by_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payout runs"
  ON public.payout_runs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Payout Entries table (individual payouts within a run)
CREATE TABLE public.payout_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_run_id UUID NOT NULL REFERENCES public.payout_runs(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL,
  target_user_type TEXT NOT NULL CHECK (target_user_type IN ('farmer', 'driver', 'affiliate')),
  amount NUMERIC NOT NULL,
  payout_method TEXT,
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  reference_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payout_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payout entries"
  ON public.payout_entries FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own payout entries"
  ON public.payout_entries FOR SELECT
  USING (auth.uid() = target_user_id);

-- Updated_at triggers
CREATE TRIGGER update_payout_runs_updated_at
  BEFORE UPDATE ON public.payout_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payout_entries_updated_at
  BEFORE UPDATE ON public.payout_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
