/*
  # Fix role structure and permissions

  1. Changes
    - Drop existing tables and recreate with proper structure
    - Change admin role to eigenaar
    - Set up proper RLS policies
    
  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated users
*/

-- Drop existing tables
DROP TABLE IF EXISTS roles_per_user;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS volunteers;

-- Create roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create roles_per_user table
CREATE TABLE roles_per_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS on roles_per_user
ALTER TABLE roles_per_user ENABLE ROW LEVEL SECURITY;

-- Create volunteers table
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on volunteers
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read their own role assignments"
  ON roles_per_user
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can create volunteer applications"
  ON volunteers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Eigenaar can read all volunteer applications"
  ON volunteers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_per_user rpu
      JOIN roles r ON r.id = rpu.role_id
      WHERE rpu.user_id = auth.uid()
      AND r.name = 'eigenaar'
    )
  );

CREATE POLICY "Eigenaar can update volunteer applications"
  ON volunteers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM roles_per_user rpu
      JOIN roles r ON r.id = rpu.role_id
      WHERE rpu.user_id = auth.uid()
      AND r.name = 'eigenaar'
    )
  );

-- Insert eigenaar role
INSERT INTO roles (name, description)
VALUES ('eigenaar', 'Eigenaar met volledige toegang tot het systeem')
ON CONFLICT (name) DO NOTHING;