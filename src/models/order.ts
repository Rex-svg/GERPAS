export type OrderStatus =
  | "Pending"
  | "Cutting"
  | "Sewing"
  | "Finishing"
  | "QC"
  | "Shipped";

export interface Order {
  id: string;
  user_id: string;

  buyer_name: string;
  po_number?: string | null;
  buyer_country?: string | null;

  style_code: string;
  production_line?: string | null;

  quantity: number;

  color?: string | null;
  size?: string | null;
  fabric?: string | null;

  unit_price: number;
  order_date?: string | null;
  delivery_date?: string | null;
  shipment_date?: string | null;

  remarks?: string | null;

  status: OrderStatus;

  created_at: string;
  updated_at: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Cutting",
  "Sewing",
  "Finishing",
  "QC",
  "Shipped",
];
