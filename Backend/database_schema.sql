-- Smart Civic Portal Database Schema

-- 1. Create Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'district_admin', 'state_admin')),
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In Supabase, you must allow public access strictly if you prefer custom policies. 
-- By default, RLS (Row Level Security) is enabled. If you want full access for now during scaffold development:
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow users to update own record" ON public.users FOR UPDATE USING (auth.uid() = id);

-- 2. Create Complaints Table
CREATE TABLE public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority_score INTEGER DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'escalated')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    district TEXT NOT NULL,
    image_url TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_image_url TEXT
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to complaints" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert" ON public.complaints FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to update" ON public.complaints FOR UPDATE USING (true); -- simplify admin check for scaffold

-- 3. Create Storage Bucket for Images (Optional but recommended)
-- Go to Supabase > Storage and create a bucket named 'complaints'
-- Policies for storage:
-- CREATE POLICY "Give users access to own folder xnnb1_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'complaints');
-- CREATE POLICY "Give users access to own folder xnnb1_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'complaints');

-- 4. Create Escalation Logs Table
CREATE TABLE public.escalation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    escalated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.escalation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to escalation logs" ON public.escalation_log FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert escalation logs" ON public.escalation_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');
