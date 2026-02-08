-- DCS Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create all tables

-- Branch Table
CREATE TABLE IF NOT EXISTS "Branch" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name TEXT NOT NULL,
  manager TEXT,
  manager_phone TEXT,
  branch_contact TEXT,
  backup_contact TEXT,
  status TEXT DEFAULT 'Active',
  map_link TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Cleaner Table
CREATE TABLE IF NOT EXISTS "Cleaner" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url TEXT,
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  assigned_branch TEXT,
  status TEXT DEFAULT 'Active',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Complaint Table
CREATE TABLE IF NOT EXISTS "Complaint" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  branch TEXT,
  complaint_type TEXT,
  description TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Table
CREATE TABLE IF NOT EXISTS "Notification" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW()
);

-- SalaryLog Table
CREATE TABLE IF NOT EXISTS "SalaryLog" (
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

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE "Branch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Cleaner" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Complaint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SalaryLog" ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated and anonymous users
-- (You can make these more restrictive later based on your auth requirements)

-- Branch policies
CREATE POLICY "Enable all access for Branch" ON "Branch"
  FOR ALL USING (true) WITH CHECK (true);

-- Cleaner policies
CREATE POLICY "Enable all access for Cleaner" ON "Cleaner"
  FOR ALL USING (true) WITH CHECK (true);

-- Complaint policies
CREATE POLICY "Enable all access for Complaint" ON "Complaint"
  FOR ALL USING (true) WITH CHECK (true);

-- Notification policies
CREATE POLICY "Enable all access for Notification" ON "Notification"
  FOR ALL USING (true) WITH CHECK (true);

-- SalaryLog policies
CREATE POLICY "Enable all access for SalaryLog" ON "SalaryLog"
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data
INSERT INTO "Branch" (branch_name, manager, manager_phone, branch_contact, backup_contact, status)
VALUES 
  ('Colombo Main Office', 'Kamal Perera', '0712345678', '0112345678', '0771234567', 'Active'),
  ('Kandy Branch', 'Nadeesha Silva', '0719876543', '0812223344', '0777654321', 'Active'),
  ('Galle Branch', 'Saman Kumara', '0713334444', '0913334444', '0775556666', 'Active');

INSERT INTO "Cleaner" (name, role, phone, assigned_branch, status)
VALUES 
  ('Nimal Fernando', 'Cleaner', '0771112233', 'Colombo Main Office', 'Active'),
  ('Shanthi Perera', 'Supervisor', '0772223344', 'Kandy Branch', 'Active'),
  ('Ruwan Silva', 'Cleaner', '0773334455', 'Galle Branch', 'Active'),
  ('Kamala Wickramasinghe', 'Cleaner', '0774445566', 'Colombo Main Office', 'Active');

INSERT INTO "Complaint" (date, branch, complaint_type, description, priority, status)
VALUES 
  (CURRENT_DATE, 'Colombo Main Office', 'Service Quality', 'Restroom cleaning missed for two days.', 'High', 'Open'),
  (CURRENT_DATE - INTERVAL '1 day', 'Kandy Branch', 'Equipment', 'Vacuum cleaner not working properly.', 'Medium', 'In Progress'),
  (CURRENT_DATE - INTERVAL '3 days', 'Galle Branch', 'Staff Behavior', 'Customer complaint about cleaner attitude.', 'High', 'Resolved');

INSERT INTO "Notification" (title, message, type, read)
VALUES 
  ('New Complaint Received', 'High priority complaint from Colombo Main Office', 'alert', false),
  ('Monthly Report Ready', 'Your monthly performance report is now available', 'info', false),
  ('Staff Update', 'New cleaner assigned to Galle Branch', 'info', true);

INSERT INTO "SalaryLog" (cleaner_name, month, base_salary, bonuses, deductions, total_salary, status)
VALUES 
  ('Nimal Fernando', 'January 2026', 35000.00, 2000.00, 500.00, 36500.00, 'Paid'),
  ('Shanthi Perera', 'January 2026', 45000.00, 3000.00, 0.00, 48000.00, 'Paid'),
  ('Ruwan Silva', 'January 2026', 32000.00, 1500.00, 300.00, 33200.00, 'Pending'),
  ('Kamala Wickramasinghe', 'January 2026', 33000.00, 1000.00, 0.00, 34000.00, 'Pending');
