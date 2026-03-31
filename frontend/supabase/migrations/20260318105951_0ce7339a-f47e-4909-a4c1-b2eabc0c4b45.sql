
-- ============================================================
-- 1. is_descendant_of: O(1)-style recursive CTE check
--    Walks the binary tree (left_leg_id/right_leg_id) downward
--    from ancestor to find if target exists in their subtree.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_descendant_of(
  p_ancestor_user_id UUID,
  p_target_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH RECURSIVE descendants AS (
    -- Start from ancestor
    SELECT user_id, left_leg_id, right_leg_id
    FROM memberships
    WHERE user_id = p_ancestor_user_id

    UNION ALL

    -- Traverse children
    SELECT m.user_id, m.left_leg_id, m.right_leg_id
    FROM memberships m
    INNER JOIN descendants d ON (m.user_id = d.left_leg_id OR m.user_id = d.right_leg_id)
    WHERE m.user_id IS NOT NULL
  )
  SELECT EXISTS (
    SELECT 1 FROM descendants WHERE user_id = p_target_user_id
  )
$$;

-- ============================================================
-- 2. get_ancestry_path: Returns the path from a user up to the
--    root of the tree (or a given ancestor), for breadcrumbs.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_ancestry_path(
  p_user_id UUID
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  tier TEXT,
  depth INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH RECURSIVE ancestry AS (
    SELECT m.user_id, m.sponsor_id, 0 AS depth
    FROM memberships m
    WHERE m.user_id = p_user_id

    UNION ALL

    SELECT m.user_id, m.sponsor_id, a.depth + 1
    FROM memberships m
    INNER JOIN ancestry a ON m.user_id = a.sponsor_id
    WHERE a.depth < 50
  )
  SELECT
    a.user_id,
    COALESCE(p.full_name, p.email, 'Member') AS full_name,
    m.tier::TEXT,
    a.depth
  FROM ancestry a
  JOIN memberships m ON m.user_id = a.user_id
  LEFT JOIN profiles p ON p.user_id = a.user_id
  ORDER BY a.depth DESC
$$;

-- ============================================================
-- 3. get_subtree_flat: Fetches subtree nodes up to a given depth
--    Returns flat rows that the service layer assembles into JSON.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_subtree_flat(
  p_root_user_id UUID,
  p_max_depth INT DEFAULT 3
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  email TEXT,
  tier TEXT,
  rank_name TEXT,
  left_leg_id UUID,
  right_leg_id UUID,
  sponsor_id UUID,
  placement_side TEXT,
  membership_bv NUMERIC,
  package_price NUMERIC,
  created_at TIMESTAMPTZ,
  depth INT,
  parent_user_id UUID,
  child_side TEXT,
  left_bv NUMERIC,
  right_bv NUMERIC,
  matched_bv NUMERIC,
  carryforward_left NUMERIC,
  carryforward_right NUMERIC,
  left_product_bv NUMERIC,
  right_product_bv NUMERIC,
  left_membership_bv NUMERIC,
  right_membership_bv NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH RECURSIVE tree AS (
    SELECT
      m.user_id,
      m.left_leg_id,
      m.right_leg_id,
      m.sponsor_id,
      m.placement_side,
      m.membership_bv,
      m.package_price,
      m.tier::TEXT AS tier,
      0 AS depth,
      NULL::UUID AS parent_user_id,
      NULL::TEXT AS child_side
    FROM memberships m
    WHERE m.user_id = p_root_user_id

    UNION ALL

    SELECT
      child.user_id,
      child.left_leg_id,
      child.right_leg_id,
      child.sponsor_id,
      child.placement_side,
      child.membership_bv,
      child.package_price,
      child.tier::TEXT,
      t.depth + 1,
      t.user_id AS parent_user_id,
      CASE
        WHEN child.user_id = t.left_leg_id THEN 'left'
        WHEN child.user_id = t.right_leg_id THEN 'right'
      END AS child_side
    FROM memberships child
    INNER JOIN tree t ON (child.user_id = t.left_leg_id OR child.user_id = t.right_leg_id)
    WHERE t.depth < p_max_depth
      AND child.user_id IS NOT NULL
  )
  SELECT
    t.user_id,
    COALESCE(p.full_name, p.email, 'Member') AS full_name,
    p.email,
    t.tier,
    r.name AS rank_name,
    t.left_leg_id,
    t.right_leg_id,
    t.sponsor_id,
    t.placement_side,
    t.membership_bv,
    t.package_price,
    COALESCE(p.created_at, NOW()) AS created_at,
    t.depth,
    t.parent_user_id,
    t.child_side,
    COALESCE(bl.left_bv, 0) AS left_bv,
    COALESCE(bl.right_bv, 0) AS right_bv,
    COALESCE(bl.matched_bv, 0) AS matched_bv,
    COALESCE(bl.carryforward_left, 0) AS carryforward_left,
    COALESCE(bl.carryforward_right, 0) AS carryforward_right,
    COALESCE(bl.left_product_bv, 0) AS left_product_bv,
    COALESCE(bl.right_product_bv, 0) AS right_product_bv,
    COALESCE(bl.left_membership_bv, 0) AS left_membership_bv,
    COALESCE(bl.right_membership_bv, 0) AS right_membership_bv
  FROM tree t
  LEFT JOIN profiles p ON p.user_id = t.user_id
  LEFT JOIN memberships mem ON mem.user_id = t.user_id
  LEFT JOIN ranks r ON r.id = mem.current_rank_id
  LEFT JOIN LATERAL (
    SELECT *
    FROM binary_ledger b
    WHERE b.user_id = t.user_id
    ORDER BY b.created_at DESC
    LIMIT 1
  ) bl ON true
  ORDER BY t.depth ASC, t.child_side ASC
$$;
