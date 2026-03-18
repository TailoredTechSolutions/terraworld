import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ── Shape flat rows from get_subtree_flat into nested tree JSON ──
interface FlatRow {
  user_id: string;
  full_name: string;
  email: string;
  tier: string;
  rank_name: string | null;
  left_leg_id: string | null;
  right_leg_id: string | null;
  sponsor_id: string | null;
  placement_side: string | null;
  membership_bv: number;
  package_price: number;
  created_at: string;
  depth: number;
  parent_user_id: string | null;
  child_side: string | null;
  left_bv: number;
  right_bv: number;
  matched_bv: number;
  carryforward_left: number;
  carryforward_right: number;
  left_product_bv: number;
  right_product_bv: number;
  left_membership_bv: number;
  right_membership_bv: number;
}

interface TreeNode {
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
  left?: TreeNode | null;
  right?: TreeNode | null;
}

function rowToNode(row: FlatRow): TreeNode {
  return {
    id: row.user_id,
    user_id: row.user_id,
    full_name: row.full_name,
    tier: row.tier,
    rank_name: row.rank_name,
    left_leg_id: row.left_leg_id,
    right_leg_id: row.right_leg_id,
    sponsor_id: row.sponsor_id,
    placement_side: row.placement_side,
    membership_bv: row.membership_bv,
    left_bv: row.left_bv,
    right_bv: row.right_bv,
    matched_bv: row.matched_bv,
    carryforward_left: row.carryforward_left,
    carryforward_right: row.carryforward_right,
    product_bv: (row.left_product_bv || 0) + (row.right_product_bv || 0),
    membership_bv_total: (row.left_membership_bv || 0) + (row.right_membership_bv || 0),
    status: row.tier !== "free" ? "active" : "inactive",
    package_price: row.package_price,
    created_at: row.created_at,
    has_left_child: !!row.left_leg_id,
    has_right_child: !!row.right_leg_id,
  };
}

function buildNestedTree(rows: FlatRow[]): TreeNode | null {
  if (!rows.length) return null;

  const nodeMap = new Map<string, TreeNode>();

  // Create all nodes
  for (const row of rows) {
    nodeMap.set(row.user_id, rowToNode(row));
  }

  // Link children to parents
  for (const row of rows) {
    if (row.parent_user_id && row.child_side) {
      const parent = nodeMap.get(row.parent_user_id);
      const child = nodeMap.get(row.user_id);
      if (parent && child) {
        if (row.child_side === "left") parent.left = child;
        else if (row.child_side === "right") parent.right = child;
      }
    }
  }

  // Root is the first row (depth 0)
  return nodeMap.get(rows[0].user_id) || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth: validate caller
    const authClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const callerId = claimsData.claims.sub as string;

    // Service client for privileged queries
    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Helper: write audit log (fire-and-forget)
    function logAudit(action: string, entityType: string, entityId: string | null, details: Record<string, unknown>) {
      admin.from("audit_log").insert({
        actor_id: callerId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
      }).then(({ error }) => { if (error) console.error("audit_log error:", error); });
    }

    // Role check (single query)
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId);
    const userRoles = (roles || []).map((r: { role: string }) => r.role);
    const isAnyAdmin = userRoles.includes("admin") || userRoles.includes("admin_readonly");

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ── SEARCH (admin only) ──
    if (action === "search") {
      if (!isAnyAdmin) return jsonResponse({ error: "Forbidden" }, 403);

      const q = url.searchParams.get("q") || "";
      if (q.length < 2) return jsonResponse({ results: [] });

      const { data: searchResults } = await admin
        .from("profiles")
        .select("user_id, full_name, email, referral_code")
        .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,referral_code.ilike.%${q}%`)
        .limit(20);

      logAudit("tree_search", "binary_tree", null, { query: q, results_count: (searchResults || []).length });
      return jsonResponse({ results: searchResults || [] });
    }

    // ── SUBTREE FETCH (root / children) ──
    if (action === "root" || action === "children") {
      const targetUserId = url.searchParams.get("userId");
      const depth = Math.min(parseInt(url.searchParams.get("depth") || "3"), 5);

      if (!targetUserId) return jsonResponse({ error: "userId required" }, 400);

      // Authorization: members can only view self + descendants
      if (!isAnyAdmin && targetUserId !== callerId) {
        const { data: isDesc, error: descErr } = await admin.rpc("is_descendant_of", {
          p_ancestor_user_id: callerId,
          p_target_user_id: targetUserId,
        });
        if (descErr || !isDesc) {
          return jsonResponse({ error: "Access denied" }, 403);
        }
      }

      // Single recursive CTE query for entire subtree
      const { data: rows, error: treeErr } = await admin.rpc("get_subtree_flat", {
        p_root_user_id: targetUserId,
        p_max_depth: depth,
      });

      if (treeErr) {
        console.error("get_subtree_flat error:", treeErr);
        return jsonResponse({ error: "Failed to fetch tree" }, 500);
      }

      const tree = buildNestedTree((rows as FlatRow[]) || []);

      // Audit: admin viewing another member's tree
      if (isAnyAdmin && targetUserId !== callerId) {
        logAudit("tree_view", "binary_tree", targetUserId, { action, depth, target_user_id: targetUserId });
      }

      return jsonResponse({ tree });
    }

    // ── ANCESTRY PATH (for breadcrumbs) ──
    if (action === "ancestry") {
      const targetUserId = url.searchParams.get("userId");
      if (!targetUserId) return jsonResponse({ error: "userId required" }, 400);

      // Authorization
      if (!isAnyAdmin && targetUserId !== callerId) {
        const { data: isDesc } = await admin.rpc("is_descendant_of", {
          p_ancestor_user_id: callerId,
          p_target_user_id: targetUserId,
        });
        if (!isDesc) return jsonResponse({ error: "Access denied" }, 403);
      }

      const { data: path, error: pathErr } = await admin.rpc("get_ancestry_path", {
        p_user_id: targetUserId,
      });

      if (pathErr) {
        console.error("get_ancestry_path error:", pathErr);
        return jsonResponse({ error: "Failed to fetch ancestry" }, 500);
      }

      return jsonResponse({ path: path || [] });
    }

    // ── MEMBER DETAIL ──
    if (action === "member-detail") {
      const targetUserId = url.searchParams.get("userId");
      if (!targetUserId) return jsonResponse({ error: "userId required" }, 400);

      // Authorization
      if (!isAnyAdmin && targetUserId !== callerId) {
        const { data: isDesc } = await admin.rpc("is_descendant_of", {
          p_ancestor_user_id: callerId,
          p_target_user_id: targetUserId,
        });
        if (!isDesc) return jsonResponse({ error: "Access denied" }, 403);
      }

      // Use subtree flat for single node (depth 0)
      const { data: rows } = await admin.rpc("get_subtree_flat", {
        p_root_user_id: targetUserId,
        p_max_depth: 0,
      });

      const nodeRows = (rows as FlatRow[]) || [];
      if (!nodeRows.length) return jsonResponse({ detail: null });

      const node = rowToNode(nodeRows[0]);

      // Wallet + earnings in parallel
      const [walletRes, payoutsRes, sponsorRes] = await Promise.all([
        admin.from("wallets").select("available_balance, pending_balance, total_withdrawn").eq("user_id", targetUserId).maybeSingle(),
        admin.from("payout_ledger").select("net_amount").eq("user_id", targetUserId),
        node.sponsor_id
          ? admin.from("profiles").select("full_name, email").eq("user_id", node.sponsor_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const totalEarnings = (payoutsRes.data || []).reduce(
        (s: number, p: { net_amount: number }) => s + (p.net_amount || 0), 0
      );

      return jsonResponse({
        detail: {
          ...node,
          wallet: walletRes.data || { available_balance: 0, pending_balance: 0, total_withdrawn: 0 },
          total_earnings: totalEarnings,
          sponsor_name: sponsorRes.data?.full_name || sponsorRes.data?.email || null,
        },
      });
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (err) {
    console.error("binary-tree error:", err);
    return jsonResponse({ error: "An internal error occurred." }, 500);
  }
});
