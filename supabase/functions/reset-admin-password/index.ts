import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: Record<string, string> = {};

  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const target = users?.users?.find((u) => u.email === "gwaltn3y@gmail.com");

  if (target) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(target.id, {
      password: "TerraSuper#2026AG!",
    });
    results["gwaltn3y@gmail.com"] = error ? `Error: ${error.message}` : "Password reset OK";
  } else {
    results["gwaltn3y@gmail.com"] = "User not found";
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
