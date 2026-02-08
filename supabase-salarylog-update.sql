-- Update SalaryLog table to support the new payroll system
-- Run this in Supabase SQL Editor to update your existing table

-- Drop the old SalaryLog table (WARNING: This will delete existing salary data!)
-- If you want to keep old data, backup first
DROP TABLE IF EXISTS "SalaryLog";

-- Create new SalaryLog table with correct schema
CREATE TABLE "SalaryLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT,
  date DATE,
  month TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  role TEXT,
  gross_total NUMERIC(10, 2),
  deductions NUMERIC(10, 2) DEFAULT 0,
  net_pay NUMERIC(10, 2),
  work_log JSONB,
  transaction_slip_url TEXT,
  status TEXT DEFAULT 'Paid',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE "SalaryLog" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Enable all access for SalaryLog" ON "SalaryLog"
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data
INSERT INTO "SalaryLog" (payment_id, date, month, staff_name, role, gross_total, deductions, net_pay, work_log, status)
VALUES 
  ('PAY-001', CURRENT_DATE, 'February', 'Nimal Fernando', 'Cleaner', 45000.00, 2000.00, 43000.00, 
   '[{"branch":"Colombo Main Office","days":30,"rate":1500,"total":45000}]'::jsonb, 'Paid'),
  ('PAY-002', CURRENT_DATE, 'February', 'Shanthi Perera', 'Supervisor', 60000.00, 0.00, 60000.00,
   '[{"branch":"Kandy Branch","days":30,"rate":2000,"total":60000}]'::jsonb, 'Paid');
