import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

type GoogleMapsUsageService = "places_autocomplete" | "places_resolve";

export async function consumeGoogleMapsMonthlyLimit({
  defaultLimit,
  envName,
  service
}: {
  defaultLimit: number;
  envName: string;
  service: GoogleMapsUsageService;
}) {
  const limit = getPositiveIntegerEnv(envName, defaultLimit);

  if (limit <= 0) {
    return {
      allowed: false,
      message: "Address lookup is disabled for this environment.",
      status: 429
    };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      allowed: false,
      message: "Address lookup limit storage is not configured.",
      status: 500
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
  const windowStart = getCurrentMonthStart();
  const { data, error } = await supabase
    .rpc("consume_google_maps_usage", {
      p_limit_count: limit,
      p_service: service,
      p_window_start: windowStart
    })
    .single();

  if (error || !data) {
    return {
      allowed: false,
      message: "Address lookup limit check failed.",
      status: 500
    };
  }

  if (!data.allowed) {
    return {
      allowed: false,
      message: `Address lookup monthly limit reached (${data.request_count}/${data.limit_count}). Try again next month.`,
      status: 429
    };
  }

  return { allowed: true, status: 200 };
}

function getPositiveIntegerEnv(name: string, fallback: number) {
  const rawValue = Deno.env.get(name);

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function getCurrentMonthStart() {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");

  return `${now.getUTCFullYear()}-${month}-01`;
}
