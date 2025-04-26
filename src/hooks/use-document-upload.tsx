
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
      const bucketId = entityType === "client" ? "client-documents" : "project-documents";
      const filePath = `${entityType}s/${entityId}/${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) throw new Error("Could not get public URL");

      const document = {
        name,
        type,
        url: urlData.publicUrl,
        uploadDate: new Date()
      };

      const tableName = entityType === "client" ? "documents" : "documents";
      const { data: docData, error: docError } = await supabase
        .from(tableName)
        .insert([{
          ...document,
          [`${entityType}id`]: entityId
        }])
        .select()
        .single();

      if (docError) throw docError;
      
      toast.success("Documento subido exitosamente");
      return docData;
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
