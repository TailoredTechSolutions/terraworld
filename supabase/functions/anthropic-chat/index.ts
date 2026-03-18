import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ AUTHENTICATION ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============ MAIN LOGIC ============
    const { messages, stream = true, model = 'claude-sonnet-4-20250514', system } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

    if (!ANTHROPIC_API_KEY) {
      console.error('[anthropic-chat] ANTHROPIC_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Anthropic AI service is not configured. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Anthropic request body
    const anthropicBody: Record<string, unknown> = {
      model,
      max_tokens: 8192,
      messages: messages.filter((m: { role: string }) => m.role !== 'system'),
      stream,
    };

    // Handle system prompt
    const systemPrompt = system || messages.find((m: { role: string }) => m.role === 'system')?.content;
    if (systemPrompt) {
      anthropicBody.system = systemPrompt;
    }

    console.log('[anthropic-chat] Calling Anthropic API with model:', model, 'for user:', user.id);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[anthropic-chat] API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Anthropic API credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'AI service encountered an error. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    } else {
      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      return new Response(
        JSON.stringify({ content: text, usage: data.usage }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[anthropic-chat] error:', error);
    return new Response(
      JSON.stringify({ error: 'An internal error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
