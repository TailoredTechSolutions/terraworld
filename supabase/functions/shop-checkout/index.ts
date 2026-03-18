import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TERRA_FEE_RATE = 0.30;

function generateAssetCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = `${prefix}-`;
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { items, shipping_address, notes } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Items required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch shop products
    const productIds = items.map((i: any) => i.shop_product_id);
    const { data: shopProducts, error: prodError } = await supabaseService
      .from("shop_products")
      .select("*")
      .in("id", productIds)
      .eq("status", "active");

    if (prodError || !shopProducts?.length) {
      return new Response(JSON.stringify({ error: "Invalid products" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productMap = new Map(shopProducts.map(p => [p.id, p]));

    // Calculate totals
    let subtotal = 0;
    const orderItems: Array<{
      shop_product_id: string;
      name: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.shop_product_id);
      if (!product) continue;

      // Check stock for merchandise
      if (product.product_type === "merchandise" && product.stock_quantity !== null) {
        if (product.stock_quantity < item.quantity) {
          return new Response(JSON.stringify({ error: `Insufficient stock for ${product.name}` }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const totalPrice = Math.round(product.price * item.quantity * 100) / 100;
      subtotal += totalPrice;

      orderItems.push({
        shop_product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        total_price: totalPrice,
      });
    }

    // RULE: Terra Fee generates BV. ₱1 Terra Fee = 1 BV
    const terraFee = Math.round(subtotal * TERRA_FEE_RATE * 100) / 100;
    const total = Math.round((subtotal + terraFee) * 100) / 100;
    const bvGenerated = terraFee; // ₱1 = 1 BV

    // Get profile for name
    const { data: profile } = await supabaseService
      .from("profiles")
      .select("full_name, email, phone, referral_code, referred_by")
      .eq("user_id", user.id)
      .maybeSingle();

    // Determine order type from first item
    const firstProduct = shopProducts[0];
    const orderType = `shop_${firstProduct.product_type}` as string;

    // Create order
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: profile?.full_name || user.email || "Member",
        customer_phone: profile?.phone || "",
        customer_email: user.email,
        delivery_address: shipping_address || "Digital Delivery",
        subtotal,
        terra_fee: terraFee,
        terra_fee_bv: bvGenerated,
        total,
        items: orderItems,
        items_count: orderItems.reduce((sum, i) => sum + i.quantity, 0),
        order_type: orderType,
        bv_type: "product", // Shop items are product BV
        status: "pending",
        notes,
        referrer_id: profile?.referred_by || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    for (const item of orderItems) {
      await supabaseService.from("order_items").insert({
        order_id: order.id,
        shop_product_id: item.shop_product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      });
    }

    // Issue digital assets for coupons/tickets
    const issuedAssets: Array<{ asset_code: string; asset_type: string; name: string }> = [];

    for (const item of orderItems) {
      const product = productMap.get(item.shop_product_id);
      if (!product) continue;

      if (product.product_type === "coupon" || product.product_type === "ticket") {
        for (let i = 0; i < item.quantity; i++) {
          const prefix = product.product_type === "coupon" ? "CPN" : "TKT";
          const assetCode = generateAssetCode(prefix);

          await supabaseService.from("digital_assets").insert({
            user_id: user.id,
            shop_product_id: product.id,
            order_id: order.id,
            asset_type: product.product_type,
            asset_code: assetCode,
            qr_data: JSON.stringify({ code: assetCode, product: product.name, orderId: order.id }),
            status: "active",
            expires_at: product.metadata?.expires_at || null,
            metadata: { product_name: product.name, sku: product.sku },
          });

          issuedAssets.push({ asset_code: assetCode, asset_type: product.product_type, name: product.name });
        }
      }

      // Decrement stock for merchandise
      if (product.product_type === "merchandise" && product.stock_quantity !== null) {
        await supabaseService
          .from("shop_products")
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq("id", product.id);
      }
    }

    // Create BV ledger entry
    if (bvGenerated > 0 && profile?.referred_by) {
      await supabaseService.from("bv_ledger").insert({
        user_id: user.id,
        order_id: order.id,
        bv_amount: bvGenerated,
        bv_type: "product",
        terra_fee: terraFee,
        source_description: `Shop order ${orderNumber}`,
      });
    }

    return new Response(JSON.stringify({
      order_id: order.id,
      order_number: orderNumber,
      total,
      terra_fee: terraFee,
      bv_generated: bvGenerated,
      digital_assets: issuedAssets,
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[shop-checkout] error:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
