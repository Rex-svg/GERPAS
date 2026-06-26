export type EmployeeStatus = "Active" | "Inactive" | "On Leave";
export type AttendanceStatus = "Present" | "Absent" | "Late" | "On Leave";
export type PayrollStatus = "Pending" | "Paid" | "Processing";

export interface Team {
  id: string;
  factory_id: string;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface TeamWithCount extends Team {
  employee_count: number;
}

export interface Employee {
  id: string;
  factory_id: string;
  team_id?: string | null;
  department_id?: string | null;
  employee_code: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
  monthly_salary: number;
  salary?: number;
  joining_date: string;
  status: EmployeeStatus;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  check_in?: string | null;
  check_out?: string | null;
  total_hours?: number | null;
  status: AttendanceStatus;
  created_at: string;
  employee?: {
    full_name: string;
    designation: string;
  };
}

export interface SalaryPayment {
  id: string;
  employee_id: string;
  payment_month: string;
  basic_salary: number;
  bonus: number;
  deduction: number;
  net_salary: number;
  payment_date?: string | null;
  financial_transaction_id?: string | null;
  remarks?: string | null;
  created_at: string;
  employee?: {
    full_name: string;
    employee_code: string;
  };
}
