-- Career Job Solution Database Schema for Supabase
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    address TEXT,
    skills TEXT,
    experience TEXT,
    education TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PLACED', 'INACTIVE')),
    cv_data JSONB,
    is_ai_enhanced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vacancies Table
CREATE TABLE IF NOT EXISTS vacancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    contact_person TEXT,
    phone_number TEXT,
    address TEXT,
    role TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    timing TEXT,
    required_skills TEXT,
    salary TEXT,
    remarks TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FILLED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Placements Table
CREATE TABLE IF NOT EXISTS placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_role TEXT NOT NULL,
    salary NUMERIC NOT NULL,
    joining_date TIMESTAMPTZ NOT NULL
);

-- Settings Table (single row)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_name TEXT DEFAULT 'Career Job Solution',
    logo_url TEXT DEFAULT 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
    address TEXT,
    contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vacancies_status ON vacancies(status);
CREATE INDEX IF NOT EXISTS idx_vacancies_created_at ON vacancies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_placements_candidate_id ON placements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_placements_joining_date ON placements(joining_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
-- For development: allow all operations. For production: implement proper auth.

CREATE POLICY "Enable all access for candidates" ON candidates
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for vacancies" ON vacancies
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for placements" ON placements
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for settings" ON settings
    FOR ALL USING (true) WITH CHECK (true);

-- Insert default settings if not exists
INSERT INTO settings (agency_name, logo_url, address, contact)
SELECT 'Career Job Solution', 
       'https://cdn-icons-png.flaticon.com/512/3135/3135768.png', 
       'Pokhara, Nepal', 
       '+977 9800000000'
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);