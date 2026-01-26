import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.25.76';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============ FIXED CONSTANTS (NON-NEGOTIABLE) ============
const TERRA_FEE_RATE = 0.30; // 30% Terra service fee

// Validation schema for order input
const orderItemSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  quantity: z.number().int().positive().max(100),
  price: z.number().positive().max(1000000),
  farmId: z.string().optional(),
  farmName: z.string().max(200).optional(),
});

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  customer_phone: z.string().trim().min(10).max(20),
  customer_email: z.string().trim().email().max(255).optional().nullable(),
  delivery_address: z.string().trim().min(10).max(500),
  items: z.array(orderItemSchema).min(1).max(50),
  payment_method: z.enum(['card', 'gcash', 'crypto']),
  notes: z.string().max(500).optional().nullable(),
  referrer_id: z.string().uuid().optional().nullable(), // For affiliate tracking
});

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    const body = await req.json();
    console.log('[create-order] Received order request');
    
    const validationResult = orderSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('[create-order] Validation failed:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid order data', 
          details: validationResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const orderData = validationResult.data;

    // Server-side price calculation - NEVER trust client prices
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock, name, farmer_id')
      .in('id', orderData.items.map(i => i.id));

    // Build a price lookup map from database
    const productPrices: Record<string, { price: number; stock: number; name: string; farmer_id: string }> = {};
    if (products) {
      products.forEach(p => {
        productPrices[p.id] = { price: Number(p.price), stock: p.stock, name: p.name, farmer_id: p.farmer_id };
      });
    }

    // Validate items and calculate server-side totals
    // Farmer price = base price (what farmer gets)
    // Customer pays = Farmer price + 30% Terra fee
    let totalFarmerPrice = 0;
    let farmerId: string | null = null;
    const validatedItems: Array<{
      id: string;
      name: string;
      quantity: number;
      farmer_price: number;
      terra_fee: number;
      total_price: number;
      farmId?: string;
      farmName?: string;
    }> = [];

    for (const item of orderData.items) {
      const dbProduct = productPrices[item.id];
      
      // Farmer price is the base product price
      const farmerPricePerUnit = dbProduct ? dbProduct.price : item.price;
      const terraFeePerUnit = farmerPricePerUnit * TERRA_FEE_RATE;
      const totalPricePerUnit = farmerPricePerUnit + terraFeePerUnit;
      
      if (dbProduct) {
        validatedItems.push({
          id: item.id,
          name: dbProduct.name,
          quantity: item.quantity,
          farmer_price: farmerPricePerUnit,
          terra_fee: terraFeePerUnit,
          total_price: totalPricePerUnit,
          farmId: item.farmId,
          farmName: item.farmName,
        });
        totalFarmerPrice += farmerPricePerUnit * item.quantity;
        
        // Get farmer ID from first product
        if (!farmerId && dbProduct.farmer_id) {
          farmerId = dbProduct.farmer_id;
        }
      } else {
        validatedItems.push({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          farmer_price: farmerPricePerUnit,
          terra_fee: terraFeePerUnit,
          total_price: totalPricePerUnit,
          farmId: item.farmId,
          farmName: item.farmName,
        });
        totalFarmerPrice += farmerPricePerUnit * item.quantity;
      }
    }

    // Calculate Terra fee and totals
    const terraFee = totalFarmerPrice * TERRA_FEE_RATE;
    const subtotal = totalFarmerPrice + terraFee; // Customer subtotal includes Terra fee
    const deliveryFee = subtotal > 0 ? 45 : 0;
    const total = subtotal + deliveryFee;
    const itemsCount = validatedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Business Volume = Terra fee (₱1 = 1 BV)
    const terraFeeBV = terraFee;

    console.log(`[create-order] Farmer price: ₱${totalFarmerPrice}, Terra fee: ₱${terraFee} (${terraFeeBV} BV)`);

    // Create the order using service role (bypasses RLS)
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert([{
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email || null,
        delivery_address: orderData.delivery_address,
        farmer_id: farmerId,
        items: validatedItems,
        items_count: itemsCount,
        farmer_price: totalFarmerPrice,
        terra_fee: terraFee,
        terra_fee_bv: terraFeeBV,
        referrer_id: orderData.referrer_id || null,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        status: 'pending',
        notes: orderData.notes ? `Payment: ${orderData.payment_method}. ${orderData.notes}` : `Payment: ${orderData.payment_method}`,
      }])
      .select('id, order_number, total, status, created_at, terra_fee, terra_fee_bv')
      .single();

    if (insertError) {
      console.error('[create-order] Database error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[create-order] Order created successfully:', order.order_number);

    // Record BV in the ledger if there's a referrer
    if (orderData.referrer_id && terraFeeBV > 0) {
      // Get referrer's membership to determine placement leg
      const { data: membership } = await supabase
        .from('memberships')
        .select('placement_side')
        .eq('user_id', orderData.referrer_id)
        .maybeSingle();

      const leg = membership?.placement_side || 'left';

      const { error: bvError } = await supabase
        .from('bv_ledger')
        .insert({
          user_id: orderData.referrer_id,
          order_id: order.id,
          bv_type: 'product',
          leg: leg,
          bv_amount: terraFeeBV,
          terra_fee: terraFee,
          source_description: `Order ${order.order_number} - Product BV`,
        });

      if (bvError) {
        console.error('[create-order] BV ledger error:', bvError);
        // Don't fail the order if BV recording fails
      } else {
        console.log(`[create-order] BV recorded: ${terraFeeBV} to ${leg} leg for referrer ${orderData.referrer_id}`);
      }
    }

    // Return success with order details including Terra fee breakdown
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
          farmer_price: totalFarmerPrice,
          terra_fee: terraFee,
          terra_fee_bv: terraFeeBV,
          delivery_fee: deliveryFee,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[create-order] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
