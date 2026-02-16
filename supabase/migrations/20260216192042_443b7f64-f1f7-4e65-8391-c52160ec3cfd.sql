
-- =============================================
-- 1. Buyer Addresses (multiple delivery addresses)
-- =============================================
CREATE TABLE public.buyer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Philippines',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.buyer_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses" ON public.buyer_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.buyer_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.buyer_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.buyer_addresses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_buyer_addresses_updated_at BEFORE UPDATE ON public.buyer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. Support Tickets
-- =============================================
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ticket_number TEXT NOT NULL DEFAULT ('TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0')),
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own open tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id AND status IN ('open', 'in_progress'));
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 3. Ticket Messages
-- =============================================
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user',
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of own tickets" ON public.ticket_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM support_tickets st WHERE st.id = ticket_messages.ticket_id AND st.user_id = auth.uid()));
CREATE POLICY "Users can insert messages to own tickets" ON public.ticket_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM support_tickets st WHERE st.id = ticket_messages.ticket_id AND st.user_id = auth.uid()));
CREATE POLICY "Admins can manage all messages" ON public.ticket_messages FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- 4. Notifications
-- =============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Notifications created via backend only" ON public.notifications FOR INSERT WITH CHECK (false);
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =============================================
-- 5. Add business fields to profiles
-- =============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_id TEXT;

-- =============================================
-- 6. Trigger to create notification on order status change
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_title TEXT;
  v_message TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Find user_id from customer_email
    SELECT p.user_id INTO v_user_id
    FROM profiles p WHERE p.email = NEW.customer_email LIMIT 1;

    IF v_user_id IS NOT NULL THEN
      CASE NEW.status
        WHEN 'preparing' THEN
          v_title := 'Order Being Prepared';
          v_message := 'Your order ' || NEW.order_number || ' is now being prepared.';
        WHEN 'in_transit' THEN
          v_title := 'Order On Its Way';
          v_message := 'Your order ' || NEW.order_number || ' is on its way to you!';
        WHEN 'delivered' THEN
          v_title := 'Order Delivered';
          v_message := 'Your order ' || NEW.order_number || ' has been delivered. Enjoy!';
        WHEN 'cancelled' THEN
          v_title := 'Order Cancelled';
          v_message := 'Your order ' || NEW.order_number || ' has been cancelled.';
        ELSE
          v_title := 'Order Updated';
          v_message := 'Your order ' || NEW.order_number || ' status changed to ' || NEW.status || '.';
      END CASE;

      INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
      VALUES (v_user_id, v_title, v_message, 'order', 'order', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();
