import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/authServer";
import supabase from "@/lib/supabase";
import { ORDER_STATUSES, OrderStatus } from "@/models/order";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase fetch order error:", error);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

type UpdateOrderInput = Partial<{
  buyer_name: string;
  po_number: string | null;
  buyer_country: string | null;
  style_code: string;
  production_line: string | null;
  quantity: number;
  color: string | null;
  size: string | null;
  fabric: string | null;
  unit_price: number;
  order_date: string | null;
  delivery_date: string | null;
  shipment_date: string | null;
  remarks: string | null;
  status: OrderStatus;
}>;

function normalizeString(value: unknown): string | null | undefined {
  if (typeof value === "string") return value;
  if (value === null) return null;
  return undefined;
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeStatus(value: unknown): OrderStatus | undefined {
  if (typeof value !== "string") return undefined;
  return ORDER_STATUSES.includes(value as OrderStatus) ? (value as OrderStatus) : undefined;
}

function normalizeUpdatePayload(body: Record<string, unknown>): UpdateOrderInput {
  const normalized: UpdateOrderInput = {
    buyer_name: normalizeString(body.buyer_name ?? body.buyerName) ?? undefined,
    po_number: normalizeString(body.po_number ?? body.poNumber),
    buyer_country: normalizeString(body.buyer_country ?? body.buyerCountry),
    style_code: normalizeString(body.style_code ?? body.styleCode) ?? undefined,
    production_line: normalizeString(body.production_line ?? body.productionLine),
    quantity: normalizeNumber(body.quantity ?? body.quantity),
    color: normalizeString(body.color),
    size: normalizeString(body.size),
    fabric: normalizeString(body.fabric),
    unit_price: normalizeNumber(body.unit_price ?? body.unitPrice),
    order_date: normalizeString(body.order_date ?? body.orderDate),
    delivery_date: normalizeString(body.delivery_date ?? body.deliveryDate),
    shipment_date: normalizeString(body.shipment_date ?? body.shipmentDate),
    remarks: normalizeString(body.remarks),
    status: normalizeStatus(body.status),
  };

  // Convert empty strings to null for nullable fields only.
  const normalizedRecord = normalized as Record<string, unknown>;
  (Object.keys(normalized) as (keyof UpdateOrderInput)[]).forEach((k) => {
    if (normalizedRecord[k] === "") normalizedRecord[k] = null;
  });

  return normalized;
}

async function updateOrder(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const payload = normalizeUpdatePayload(body);

  const { data: order, error } = await supabase
    .from("orders")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.userId)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("Supabase update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order, success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // pass only id into updateOrder to avoid TS mismatch
    const body = await req.json();
    const payload = normalizeUpdatePayload(body);

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: order, error } = await supabase
      .from("orders")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Supabase update order error:", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ order, success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

// Requirement: PUT /api/orders/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: deleted, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .eq("user_id", user.userId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Supabase delete order error:", error);
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: 500 }
      );
    }

    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
