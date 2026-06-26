import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/authServer";
import supabase from "@/lib/supabase";
import { OrderStatus } from "@/models/order";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch orders error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders, success: true });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Minimal validation + shape conversion to match schema
    const payload = {
      user_id: user.userId,
      buyer_name: body.buyer_name ?? body.buyerName,
      po_number: body.po_number ?? body.poNumber ?? null,
      buyer_country: body.buyer_country ?? body.buyerCountry ?? null,
      style_code: body.style_code ?? body.styleCode,
      production_line: body.production_line ?? body.productionLine ?? null,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      color: body.color ?? null,
      size: body.size ?? null,
      fabric: body.fabric ?? null,
      unit_price: body.unit_price !== undefined ? Number(body.unit_price) : Number(body.unitPrice ?? 0),
      order_date: body.order_date ?? body.orderDate ?? null,
      delivery_date: body.delivery_date ?? body.deliveryDate ?? null,
      shipment_date: body.shipment_date ?? body.shipmentDate ?? null,
      remarks: body.remarks ?? null,
      status: (body.status as OrderStatus | undefined) ?? "Pending",
    };

    const requiredMissing =
      !payload.buyer_name ||
      !payload.style_code ||
      !payload.quantity ||
      Number.isNaN(payload.quantity);

    if (requiredMissing) {
      return NextResponse.json(
        { error: "Missing required fields: buyer_name, style_code, quantity" },
        { status: 400 }
      );
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase create order error:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ order, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
