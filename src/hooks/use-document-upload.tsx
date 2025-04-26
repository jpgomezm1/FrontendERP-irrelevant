
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
      
      // Create a unique file path to prevent overwriting
      // Format: {entityType}s/{entityId}/{timestamp}-{filename}
      const timestamp = new Date().getTime();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${entityType}s/${entityId}/${timestamp}-${safeName}`;
      
      console.log(`Uploading file to bucket: ${bucketId}, path: ${filePath}`);
      
      // Upload the actual file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketId)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false // Do not overwrite existing files
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      if (!uploadData) {
        throw new Error("No se pudo cargar el archivo, respuesta vacía");
      }

      console.log("Upload successful:", uploadData);

      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from(bucketId)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error("Could not get public URL");
        throw new Error("No se pudo obtener URL pública");
      }

      console.log("File public URL:", urlData.publicUrl);

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

      if (docError) {
        console.error("Database document insert error:", docError);
        throw new Error(`Error al guardar documento en base de datos: ${docError.message}`);
      }
      
      console.log("Document record created:", docData);
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
      toast.error(`Error al subir documento: ${error.message || error}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (documentId: number, fileUrl: string): Promise<boolean> => {
    try {
      // Get bucket ID
      const bucketId = entityType === "client" ? "client-documents" : "project-documents";
      
      // Extract the file path from the URL
      // The URL format is typically: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const urlParts = fileUrl.split(`/storage/v1/object/public/${bucketId}/`);
      if (urlParts.length < 2) {
        throw new Error("No se pudo extraer la ruta del archivo");
      }
      
      const filePath = urlParts[1];
      console.log(`Deleting file from bucket: ${bucketId}, path: ${filePath}`);

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from(bucketId)
        .remove([filePath]);

      if (storageError) {
        console.error("Storage deletion error:", storageError);
        throw new Error(`Error al eliminar archivo: ${storageError.message}`);
      }

      // Delete document record from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (dbError) {
        console.error("Database document delete error:", dbError);
        throw new Error(`Error al eliminar registro de documento: ${dbError.message}`);
      }

      toast.success("Documento eliminado exitosamente");
      return true;
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(`Error al eliminar documento: ${error.message || error}`);
      return false;
    }
  };

  return {
    isUploading,
    uploadDocument,
    deleteDocument
  };
}
