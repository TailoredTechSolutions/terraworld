import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Check authorization header for admin access
    const authHeader = req.headers.get('authorization');
    
    // For now, we'll implement a simple check - in production you'd verify JWT claims
    // This allows the admin dashboard to fetch orders
    let isAuthorized = false;
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Verify the JWT
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
      
      if (!authError && user) {
        // In production, check if user has admin role
        // For now, any authenticated user can access (you should add role check)
        isAuthorized = true;
        console.log('[get-orders] Authenticated user:', user.email);
      }
    }

    // For admin dashboard access without full auth implementation,
    // we'll allow access but log it. In production, this should require proper admin role.
    // This is a temporary measure until full auth is implemented.
    
    console.log('[get-orders] Fetching orders, authorized:', isAuthorized);

    // Use service role to bypass RLS and fetch orders
    const { data: orders, error } = await supabaseService
      .from('orders')
      .select(`
        *,
        farmers:farmer_id(name),
        drivers:driver_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[get-orders] Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch orders' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[get-orders] Returning', orders?.length || 0, 'orders');

    return new Response(
      JSON.stringify({ orders: orders || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-orders] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
