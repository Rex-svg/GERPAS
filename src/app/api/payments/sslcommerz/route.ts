import { NextRequest, NextResponse } from "next/server";

const SSL_COMMERZ_SANDBOX = process.env.SSL_COMMERZ_SANDBOX !== "false";
const SSL_COMMERZ_STORE_ID = process.env.SSL_COMMERZ_STORE_ID;
const SSL_COMMERZ_STORE_PASSWORD = process.env.SSL_COMMERZ_STORE_PASSWORD;

const getBaseUrl = (req: NextRequest): string => {
  if (req.nextUrl?.origin) return req.nextUrl.origin;
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("host") || "localhost:3000";
  return `${protocol}://${host}`;
};

const getSslCommerzUrl = (): string => {
  return SSL_COMMERZ_SANDBOX
    ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";
};

export async function POST(req: NextRequest) {
  if (!SSL_COMMERZ_STORE_ID || !SSL_COMMERZ_STORE_PASSWORD) {
    return NextResponse.json(
      { error: "SSLCommerz is not configured. Please set SSL_COMMERZ_STORE_ID and SSL_COMMERZ_STORE_PASSWORD." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const planName = String(body.planName || "GERPAS Plan");
    const amount = Number(body.amount);
    const billingCycle = body.billingCycle === "yearly" ? "yearly" : "monthly";

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment amount." }, { status: 400 });
    }

    const origin = getBaseUrl(req);
    const tranId = `gerpas-${Date.now()}`;
    const successUrl = `${origin}/payment-success`;
    const failUrl = `${origin}/payment-fail`;
    const cancelUrl = `${origin}/payment-fail`;

    const formData = new URLSearchParams({
      store_id: SSL_COMMERZ_STORE_ID,
      store_passwd: SSL_COMMERZ_STORE_PASSWORD,
      total_amount: amount.toString(),
      currency: "BDT",
      tran_id: tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      product_name: planName,
      product_category: billingCycle,
      product_profile: "service",
      cus_name: "GERPAS Customer",
      cus_email: "customer@gerpas.com",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1207",
      cus_country: "Bangladesh",
      cus_phone: "01234567890",
      shipping_method: "NO",
      num_of_item: "1",
      value_a: planName,
      value_b: billingCycle,
    });

    const response = await fetch(getSslCommerzUrl(), {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();

    if (!response.ok || data.status !== "SUCCESS") {
      const message = data.failedreason || data.status || "SSLCommerz checkout initialization failed.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ redirectUrl: data.GatewayPageURL, transactionId: tranId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown payment gateway error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
