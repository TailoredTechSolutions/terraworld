import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.25.76';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    // In production, you would fetch actual prices from the products table
    // For now, we validate the structure and recalculate totals
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, stock, name')
      .in('id', orderData.items.map(i => i.id));

    // Build a price lookup map from database
    const productPrices: Record<string, { price: number; stock: number; name: string }> = {};
    if (products) {
      products.forEach(p => {
        productPrices[p.id] = { price: Number(p.price), stock: p.stock, name: p.name };
      });
    }

    // Validate items and calculate server-side totals
    let subtotal = 0;
    const validatedItems: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      farmId?: string;
      farmName?: string;
    }> = [];

    for (const item of orderData.items) {
      const dbProduct = productPrices[item.id];
      
      if (dbProduct) {
        // Use database price, not client-provided price
        validatedItems.push({
          ...item,
          name: dbProduct.name, // Use DB name
          price: dbProduct.price, // Use DB price
        });
        subtotal += dbProduct.price * item.quantity;
      } else {
        // If product not found in DB, use client price (for static products)
        // In production, you might reject unknown products
        validatedItems.push(item);
        subtotal += item.price * item.quantity;
      }
    }

    // Calculate fees server-side
    const deliveryFee = subtotal > 0 ? 45 : 0;
    const total = subtotal + deliveryFee;
    const itemsCount = validatedItems.reduce((sum, item) => sum + item.quantity, 0);

    // Look up a farmer ID if available (simplified for now)
    let farmerId: string | null = null;
    if (orderData.items[0]?.farmId) {
      const { data: farmerData } = await supabase
        .from('farmers')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (farmerData) {
        farmerId = farmerData.id;
      }
    }

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
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        status: 'pending',
        notes: orderData.notes ? `Payment: ${orderData.payment_method}. ${orderData.notes}` : `Payment: ${orderData.payment_method}`,
      }])
      .select('id, order_number, total, status, created_at')
      .single();

    if (insertError) {
      console.error('[create-order] Database error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[create-order] Order created successfully:', order.order_number);

    // Return success with order details (no sensitive data)
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          order_number: order.order_number,
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
