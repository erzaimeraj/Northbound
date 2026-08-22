import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FREE_SHIPPING_THRESHOLD_CENTS = 7500;
const STANDARD_SHIPPING_CENTS = 795;

interface OrderItemInput {
  product_id: string;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  variant?: string;
}

interface PlaceOrderBody {
  customer_name: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country?: string;
  items: OrderItemInput[];
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function serverError(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NB-${code}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: PlaceOrderBody = await req.json();

    // --- Validate shipping fields ---
    if (!body.customer_name || body.customer_name.trim().length < 2) {
      return badRequest("A valid name is required.");
    }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return badRequest("A valid email address is required.");
    }
    if (!body.address || body.address.trim().length < 5) {
      return badRequest("A valid street address is required.");
    }
    if (!body.city || body.city.trim().length < 2) {
      return badRequest("A valid city is required.");
    }
    if (!body.postal_code || body.postal_code.trim().length < 3) {
      return badRequest("A valid postal code is required.");
    }

    // --- Validate items ---
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return badRequest("Your cart is empty.");
    }

    for (const item of body.items) {
      if (!item.product_id || typeof item.product_id !== "string") {
        return badRequest("Invalid product reference.");
      }
      if (
        typeof item.unit_price_cents !== "number" ||
        item.unit_price_cents < 0
      ) {
        return badRequest("Invalid product price.");
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return badRequest("Invalid quantity.");
      }
      if (item.quantity > 99) {
        return badRequest("Quantity exceeds maximum of 99 per item.");
      }
    }

    // --- Connect to Supabase with service role (bypasses RLS for inserts) ---
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return serverError("Server is not configured.");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // --- Verify products exist and fetch real prices (server-side truth) ---
    const productIds = body.items.map((i) => i.product_id);
    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, price_cents")
      .in("id", productIds);

    if (prodError) {
      return serverError("Could not verify products.");
    }

    const priceMap = new Map(
      (products ?? []).map((p: { id: string; price_cents: number }) => [
        p.id,
        p.price_cents,
      ]),
    );

    // Use server-verified prices, not client-provided
    let subtotalCents = 0;
    const verifiedItems = body.items.map((item) => {
      const realPrice = priceMap.get(item.product_id);
      if (realPrice === undefined) {
        throw new Error(`Product ${item.product_name} is no longer available.`);
      }
      const lineTotal = realPrice * item.quantity;
      subtotalCents += lineTotal;
      return {
        product_id: item.product_id,
        product_name: item.product_name,
        unit_price_cents: realPrice,
        quantity: item.quantity,
        variant: item.variant ?? null,
      };
    });

    const shippingCents =
      subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS || subtotalCents === 0
        ? 0
        : STANDARD_SHIPPING_CENTS;
    const totalCents = subtotalCents + shippingCents;

    // --- Create the order with retry on order_number collision ---
    let order: { id: string; order_number: string } | null = null;
    let lastErr: string | null = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNumber = generateOrderNumber();
      const { data: created, error: insertErr } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: body.customer_name.trim(),
          email: body.email.trim().toLowerCase(),
          address: body.address.trim(),
          city: body.city.trim(),
          postal_code: body.postal_code.trim(),
          country: (body.country ?? "United States").trim(),
          subtotal_cents: subtotalCents,
          shipping_cents: shippingCents,
          total_cents: totalCents,
          status: "confirmed",
        })
        .select("id, order_number")
        .single();

      if (insertErr) {
        // unique constraint violation — try another code
        if (insertErr.code === "23505") {
          lastErr = insertErr.message;
          continue;
        }
        return serverError("Could not create order.");
      }

      order = created as { id: string; order_number: string };
      break;
    }

    if (!order) {
      return serverError(
        lastErr ? `Order creation failed: ${lastErr}` : "Order creation failed.",
      );
    }

    // --- Insert order items ---
    const itemsToInsert = verifiedItems.map((item) => ({
      ...item,
      order_id: order!.id,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemsToInsert);

    if (itemsErr) {
      return serverError("Order created but items could not be saved.");
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("no longer available")) {
      return badRequest(message);
    }
    return serverError(message);
  }
});
