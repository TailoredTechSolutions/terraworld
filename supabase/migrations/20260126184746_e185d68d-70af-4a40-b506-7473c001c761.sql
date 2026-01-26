-- Create enum for verification status
CREATE TYPE public.kyc_status AS ENUM ('not_started', 'pending', 'in_review', 'approved', 'rejected');

-- Create enum for document type
CREATE TYPE public.kyc_document_type AS ENUM (
  'government_id',
  'passport',
  'drivers_license',
  'proof_of_address',
  'selfie',
  'business_registration',
  'articles_of_incorporation',
  'tax_certificate'
);

-- Create enum for account type
CREATE TYPE public.account_type AS ENUM ('individual', 'company');

-- Create KYC profiles table
CREATE TABLE public.kyc_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  account_type public.account_type NOT NULL DEFAULT 'individual',
  
  -- Individual fields
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  nationality TEXT,
  
  -- Company fields
  company_name TEXT,
  registration_number TEXT,
  tax_id TEXT,
  
  -- Address fields
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Verification status
  status public.kyc_status NOT NULL DEFAULT 'not_started',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create KYC documents table
CREATE TABLE public.kyc_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kyc_profile_id UUID NOT NULL REFERENCES public.kyc_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_type public.kyc_document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status public.kyc_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for kyc_profiles
CREATE POLICY "Users can view own KYC profile"
  ON public.kyc_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC profile"
  ON public.kyc_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC profile"
  ON public.kyc_profiles FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('not_started', 'rejected'));

CREATE POLICY "Admins can view all KYC profiles"
  ON public.kyc_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all KYC profiles"
  ON public.kyc_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for kyc_documents
CREATE POLICY "Users can view own documents"
  ON public.kyc_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own pending documents"
  ON public.kyc_documents FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all documents"
  ON public.kyc_documents FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all documents"
  ON public.kyc_documents FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- Create storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Storage policies for KYC documents
CREATE POLICY "Users can upload own KYC documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own KYC documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own KYC documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'kyc-documents' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all KYC documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND 
    has_role(auth.uid(), 'admin')
  );

-- Add trigger for updated_at
CREATE TRIGGER update_kyc_profiles_updated_at
  BEFORE UPDATE ON public.kyc_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_kyc_profiles_user_id ON public.kyc_profiles(user_id);
CREATE INDEX idx_kyc_profiles_status ON public.kyc_profiles(status);
CREATE INDEX idx_kyc_documents_kyc_profile_id ON public.kyc_documents(kyc_profile_id);
CREATE INDEX idx_kyc_documents_user_id ON public.kyc_documents(user_id);