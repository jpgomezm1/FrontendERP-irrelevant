
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentType } from "@/types/clients";
import { toast } from "sonner";

interface UseDocumentUploadProps {
  entityType: "client" | "project";
  entityId: number;
}

export function useDocumentUpload({ entityType, entityId }: UseDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (
    file: File,
    type: DocumentType,
    name: string
  ): Promise<Document | null> => {
    setIsUploading(true);
    
    try {
      // Choose the right bucket based on entity type
      const bucketId = entityType === "client" ? "client-documents" : "project-documents";
      // Create a path that follows the folder structure: clients/{clientId}/{filename} or projects/{projectId}/{filename}
      const filePath = `${entityType}s/${entityId}/${file.name}`;
      
      // Upload the actual file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) throw new Error("Could not get public URL");

      // Format the current date as ISO string and then extract just the date part
      const uploadDateStr = new Date().toISOString().split('T')[0];

      // Create document record with proper field names matching Supabase schema
      const documentToInsert = {
        name,
        type,
        url: urlData.publicUrl,
        uploaddate: uploadDateStr,
        [`${entityType}id`]: entityId
      };

      // Save the document metadata to the database
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert([documentToInsert])
        .select()
        .single();

      if (docError) throw docError;
      
      toast.success("Documento subido exitosamente");
      
      // Convert the returned Supabase data to our Document type
      const document: Document = {
        id: docData.id,
        name: docData.name,
        type: docData.type as DocumentType,
        url: docData.url,
        uploadDate: new Date(docData.uploaddate)
      };
      
      return document;
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error("Error al subir documento");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (documentId: number, fileUrl: string) => {
    try {
      const bucketId = entityType === "client" ? "client-documents" : "project-documents";
      // Extract the file path from the URL by removing the bucket part
      const filePath = fileUrl.split(`${bucketId}/`)[1];

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete document record
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (dbError) throw dbError;

      toast.success("Documento eliminado exitosamente");
      return true;
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Error al eliminar documento");
      return false;
    }
  };

  return {
    isUploading,
    uploadDocument,
    deleteDocument
  };
}
