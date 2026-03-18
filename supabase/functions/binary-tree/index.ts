import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface TreeNodeResponse {
  id: string;
  user_id: string;
  full_name: string;
  tier: string;
  rank_name: string | null;
  left_leg_id: string | null;
  right_leg_id: string | null;
  sponsor_id: string | null;
  placement_side: string | null;
  membership_bv: number;
  left_bv: number;
  right_bv: number;
  matched_bv: number;
  carryforward_left: number;
  carryforward_right: number;
  product_bv: number;
  membership_bv_total: number;
  status: string;
  package_price: number;
  created_at: string;
  has_left_child: boolean;
  has_right_child: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth client to get calling user
    const authClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service client for data access
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Check role
    const { data: roles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const userRoles = (roles || []).map((r: any) => r.role);
    const isAdmin = userRoles.includes("admin");
    const isAdminReadonly = userRoles.includes("admin_readonly");
    const isAnyAdmin = isAdmin || isAdminReadonly;

    if (action === "search" && isAnyAdmin) {
      const q = url.searchParams.get("q") || "";
      if (q.length < 2) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: searchResults } = await adminClient
        .from("profiles")
        .select("user_id, full_name, email, referral_code")
        .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,referral_code.ilike.%${q}%`)
        .limit(20);

      return new Response(JSON.stringify({ results: searchResults || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "children" || action === "root") {
      const targetUserId = url.searchParams.get("userId");
      const depth = Math.min(parseInt(url.searchParams.get("depth") || "3"), 5);

      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "userId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Permission check: members can only view their own downline
      if (!isAnyAdmin) {
        const isAuthorized = await checkDescendant(adminClient, user.id, targetUserId);
        if (!isAuthorized && targetUserId !== user.id) {
          return new Response(JSON.stringify({ error: "Access denied" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const tree = await buildTreeFromUser(adminClient, targetUserId, depth);
      return new Response(JSON.stringify({ tree }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "member-detail") {
      const targetUserId = url.searchParams.get("userId");
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: "userId required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!isAnyAdmin) {
        const isAuthorized = await checkDescendant(adminClient, user.id, targetUserId);
        if (!isAuthorized && targetUserId !== user.id) {
          return new Response(JSON.stringify({ error: "Access denied" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const detail = await getMemberDetail(adminClient, targetUserId);
      return new Response(JSON.stringify({ detail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("binary-tree error:", err);
    return new Response(
      JSON.stringify({ error: "An internal error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkDescendant(client: any, rootUserId: string, targetUserId: string): Promise<boolean> {
  if (rootUserId === targetUserId) return true;

  // Walk up from target to see if we reach root
  let current = targetUserId;
  const visited = new Set<string>();
  for (let i = 0; i < 100; i++) {
    if (visited.has(current)) return false;
    visited.add(current);

    const { data: membership } = await client
      .from("memberships")
      .select("sponsor_id")
      .eq("user_id", current)
      .maybeSingle();

    if (!membership?.sponsor_id) return false;
    if (membership.sponsor_id === rootUserId) return true;
    current = membership.sponsor_id;
  }
  return false;
}

async function buildTreeFromUser(client: any, userId: string, maxDepth: number): Promise<TreeNodeResponse | null> {
  const node = await getNodeData(client, userId);
  if (!node) return null;

  if (maxDepth <= 0) return node;

  // Fetch children
  const { data: membership } = await client
    .from("memberships")
    .select("left_leg_id, right_leg_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (membership?.left_leg_id) {
    (node as any).left = await buildTreeFromUser(client, membership.left_leg_id, maxDepth - 1);
  }
  if (membership?.right_leg_id) {
    (node as any).right = await buildTreeFromUser(client, membership.right_leg_id, maxDepth - 1);
  }

  return node;
}

async function getNodeData(client: any, userId: string): Promise<TreeNodeResponse | null> {
  const { data: membership } = await client
    .from("memberships")
    .select("*, ranks:current_rank_id(name)")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) return null;

  const { data: profile } = await client
    .from("profiles")
    .select("full_name, email, created_at")
    .eq("user_id", userId)
    .maybeSingle();

  // Get latest binary ledger for BV stats
  const { data: binaryLedger } = await client
    .from("binary_ledger")
    .select("left_bv, right_bv, matched_bv, carryforward_left, carryforward_right, left_product_bv, left_membership_bv, right_product_bv, right_membership_bv")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const bv = binaryLedger || {
    left_bv: 0, right_bv: 0, matched_bv: 0,
    carryforward_left: 0, carryforward_right: 0,
    left_product_bv: 0, left_membership_bv: 0,
    right_product_bv: 0, right_membership_bv: 0,
  };

  return {
    id: membership.id,
    user_id: userId,
    full_name: profile?.full_name || profile?.email || "Member",
    tier: membership.tier,
    rank_name: membership.ranks?.name || null,
    left_leg_id: membership.left_leg_id,
    right_leg_id: membership.right_leg_id,
    sponsor_id: membership.sponsor_id,
    placement_side: membership.placement_side,
    membership_bv: membership.membership_bv,
    left_bv: bv.left_bv,
    right_bv: bv.right_bv,
    matched_bv: bv.matched_bv,
    carryforward_left: bv.carryforward_left,
    carryforward_right: bv.carryforward_right,
    product_bv: (bv.left_product_bv || 0) + (bv.right_product_bv || 0),
    membership_bv_total: (bv.left_membership_bv || 0) + (bv.right_membership_bv || 0),
    status: membership.tier !== "free" ? "active" : "inactive",
    package_price: membership.package_price,
    created_at: profile?.created_at || membership.created_at,
    has_left_child: !!membership.left_leg_id,
    has_right_child: !!membership.right_leg_id,
  };
}

async function getMemberDetail(client: any, userId: string) {
  const node = await getNodeData(client, userId);
  if (!node) return null;

  // Get wallet
  const { data: wallet } = await client
    .from("wallets")
    .select("available_balance, pending_balance, total_withdrawn")
    .eq("user_id", userId)
    .maybeSingle();

  // Get total payout earnings
  const { data: payouts } = await client
    .from("payout_ledger")
    .select("net_amount")
    .eq("user_id", userId);
  const totalEarnings = (payouts || []).reduce((s: number, p: any) => s + (p.net_amount || 0), 0);

  // Get sponsor profile
  let sponsorName = null;
  if (node.sponsor_id) {
    const { data: sponsorProfile } = await client
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", node.sponsor_id)
      .maybeSingle();
    sponsorName = sponsorProfile?.full_name || sponsorProfile?.email || null;
  }

  return {
    ...node,
    wallet: wallet || { available_balance: 0, pending_balance: 0, total_withdrawn: 0 },
    total_earnings: totalEarnings,
    sponsor_name: sponsorName,
  };
}
