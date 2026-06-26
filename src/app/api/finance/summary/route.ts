import { NextResponse, NextRequest } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const revenuePromise = context.supabase
    .from("financial_transactions")
    .select("amount")
    .eq("factory_id", context.factoryId)
    .eq("transaction_type", "Income");

  const expensePromise = context.supabase
    .from("financial_transactions")
    .select("amount")
    .eq("factory_id", context.factoryId)
    .eq("transaction_type", "Expense");

  // salary_payments doesn't have factory_id, so get employee IDs for this factory first
  const { data: employees } = await context.supabase
    .from("employees")
    .select("id")
    .eq("factory_id", context.factoryId);
  const employeeIds = (employees ?? []).map((e: any) => e.id);

  const payrollPromise = context.supabase
    .from("salary_payments")
    .select("net_salary")
    .in("employee_id", employeeIds.length > 0 ? employeeIds : ["00000000-0000-0000-0000-000000000000"]);

  const [revenueResult, expenseResult, payrollResult] = await Promise.all([
    revenuePromise,
    expensePromise,
    payrollPromise,
  ]);

  if (revenueResult.error || expenseResult.error || payrollResult.error) {
    return NextResponse.json({ error: "Failed to load finance metrics" }, { status: 500 });
  }

  const totalRevenue = (revenueResult.data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const totalExpenses = (expenseResult.data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const totalPayroll = (payrollResult.data ?? []).reduce((sum, row) => sum + Number(row.net_salary || 0), 0);
  const grossProfit = totalRevenue - totalExpenses;
  const netProfit = grossProfit - totalPayroll;

  return NextResponse.json({
    success: true,
    summary: {
      revenue: totalRevenue,
      expenses: totalExpenses,
      payroll: totalPayroll,
      grossProfit,
      netProfit,
    },
  });
}
