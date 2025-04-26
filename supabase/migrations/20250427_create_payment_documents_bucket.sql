
-- Create storage bucket for payment documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-documents', 'Payment Documents', true);

-- Allow authenticated users to upload payment documents
CREATE POLICY "Allow authenticated users to upload payment documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-documents');

-- Allow authenticated users to view payment documents
CREATE POLICY "Allow authenticated users to view payment documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'payment-documents');
