-- ======================================================================
-- UNI9JA MEDIA - Supabase / PostgreSQL Database Schema Definition & Seeds
-- Pasting this code in the Supabase SQL Editor will construct all required
-- tables, indexes, check constraints, and seed configuration parameters.
-- ======================================================================

-- 1. Enable pgcrypto extension for UUIDs and utility functions if ever needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Drop existing tables to ensure clean slate (order respects foreign keys)
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS faqs;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS contestants;
DROP TABLE IF EXISTS competitions;
DROP TABLE IF EXISTS users;

-- 3. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK(role IN ('admin', 'contestant')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Competitions Table
CREATE TABLE competitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Contestants Table
CREATE TABLE contestants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    competition_id INTEGER REFERENCES competitions(id) ON DELETE SET NULL,
    institution VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    bio TEXT,
    photo_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'suspended')),
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Votes Table
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    contestant_id INTEGER NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    price_paid DECIMAL(10,2) NOT NULL,
    voter_name VARCHAR(255),
    voter_email VARCHAR(255),
    tx_ref VARCHAR(255) UNIQUE NOT NULL,
    proof_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. FAQs Table
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Blogs Table
CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Contacts Table
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Settings Table
CREATE TABLE settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT
);

-- ======================================================================
-- Seed Default Core Data
-- ======================================================================

-- Seed Admin Username: bennygrace2026@gmail.com
-- Static password hash corresponding to: 'Uni9jamedia95#' (hashed using bcrypt)
INSERT INTO users (name, email, password, role) VALUES (
    'Super Admin',
    'bennygrace2026@gmail.com',
    '$2b$10$M9Z.JsmYQ4bpt57mS50mPOfG/jRE8wN0XlY6WjVd9gexbA7YnQh12',
    'admin'
) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Seed Active Weekly competition
INSERT INTO competitions (title, start_date, end_date, is_active) VALUES (
    'Face of the Week - Week 1',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    TRUE
);

-- Seed System Configuration Settings
INSERT INTO settings (key, value) VALUES 
('site_email', 'hello@uni9jamedia.com'),
('site_phone', '+234 123 456 7890'),
('site_address', 'Lagos, Nigeria'),
('social_instagram', 'https://instagram.com/uni9jamedia'),
('social_twitter', 'https://twitter.com/uni9jamedia'),
('vote_cost', '100'),
('rules', '## Competition Rules

1. Be respectful to all participants.
2. Do not use bots to generate votes.
3. Keep your profile appropriate for all audiences.
4. Have fun and be a great representative of UNI9JA MEDIA.'),
('rules_general', '1. Be respectful to all participants.
2. Do not use bots to generate votes.'),
('rules_contestant', '1. Keep your profile appropriate for all audiences.
2. Have fun and be a great representative of UNI9JA MEDIA.'),
('rules_voting', '1. Each vote costs N100.
2. You can vote as many times as you like.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Seed FAQs
INSERT INTO faqs (question, answer) VALUES 
('How do I register?', 'Click on "Register as Contestant" on the homepage and fill out the form.'),
('How can people vote for me?', 'Once approved, you will get a unique profile link. Share it with your friends so they can vote.'),
('Is voting free?', 'Basic participation is free, but some campaigns might require a premium voting token. See our rules for details.');

-- ======================================================================
-- Create High-Performance Indexes
-- ======================================================================
CREATE INDEX idx_contestants_status ON contestants(status);
CREATE INDEX idx_votes_status ON votes(status);
CREATE INDEX idx_votes_contestant_id ON votes(contestant_id);
CREATE INDEX idx_contestants_competition_id ON contestants(competition_id);
