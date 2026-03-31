
-- Add SELECT-only policies for admin_readonly on all tables

CREATE POLICY "Read-only admins can view audit log"
ON public.audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view binary ledger"
ON public.binary_ledger FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view all BV"
ON public.bv_ledger FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view addresses"
ON public.buyer_addresses FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view pools"
ON public.compensation_pools FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view bookings"
ON public.delivery_bookings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view zones"
ON public.delivery_zones FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view assets"
ON public.digital_assets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view drivers"
ON public.drivers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view farm products"
ON public.farm_products FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view farmers"
ON public.farmers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view KYC documents"
ON public.kyc_documents FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view KYC profiles"
ON public.kyc_profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view adjustments"
ON public.manual_adjustments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view transfers"
ON public.member_transfers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view memberships"
ON public.memberships FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view notifications"
ON public.notifications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view order items"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view payout entries"
ON public.payout_entries FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view payout ledger"
ON public.payout_ledger FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view payout runs"
ON public.payout_runs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view settings"
ON public.platform_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view product images"
ON public.product_images FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view products"
ON public.products FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view shop products"
ON public.shop_products FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view tickets"
ON public.support_tickets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view messages"
ON public.ticket_messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view tokens"
ON public.token_ledger FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view transactions"
ON public.wallet_transactions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view wallets"
ON public.wallets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));

CREATE POLICY "Read-only admins can view withdrawals"
ON public.withdrawal_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin_readonly'::app_role));
