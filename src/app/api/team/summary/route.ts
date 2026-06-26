import { NextResponse, NextRequest } from "next/server";
import { getFactoryContext } from "@/lib/factoryAuth";

export async function GET(req: NextRequest) {
  const context = await getFactoryContext(req);
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const { supabase, factoryId } = context;

  const [
    { data: employees, error: employeeError },
    { data: teams, error: teamError },
    { data: salaryPayments, error: payrollError },
    { data: attendance, error: attendanceError },
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("status")
      .eq("factory_id", factoryId),
    supabase
      .from("teams")
      .select("id")
      .eq("factory_id", factoryId),
    supabase
      .from("salary_payments")
      .select("net_salary, employees!inner(factory_id)")
      .eq("employees.factory_id", factoryId),
    supabase
      .from("employee_attendance")
      .select("status, employees!inner(factory_id)")
      .eq("employees.factory_id", factoryId)
      .gte("attendance_date", new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10)),
  ]);

  if (employeeError || teamError || payrollError || attendanceError) {
    return NextResponse.json({ error: "Failed to load team summary" }, { status: 500 });
  }

  const totalEmployees = employees?.length ?? 0;
  const activeEmployees = employees?.filter((employee) => employee.status === "Active").length ?? 0;
  const departmentCount = teams?.length ?? 0;

  const monthlyPayrollCost = (salaryPayments ?? []).reduce((total, sp) => {
    return total + Number(sp.net_salary || 0);
  }, 0);

  const totalAttendance = attendance?.length ?? 0;
  const presentCount = (attendance ?? []).filter((record) => record.status === "Present").length;
  const attendanceRate = totalAttendance > 0 ? Number(((presentCount / totalAttendance) * 100).toFixed(1)) : 0;

  return NextResponse.json({
    success: true,
    summary: {
      totalEmployees,
      activeEmployees,
      departmentCount,
      monthlyPayrollCost,
      attendanceRate,
    },
  });
}
