import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Document } from "@/types/clients";
import { FileText, Download, Trash2, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useDocumentUpload } from "@/hooks/use-document-upload";
import { toast } from "sonner";

interface DocumentsListProps {
  documents: Document[];
  entityType: "client" | "project";
  entityId: number;
  onDeleted?: () => void;
}

export function DocumentsList({ 
  documents, 
  entityType,
  entityId,
  onDeleted
}: DocumentsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteDocument } = useDocumentUpload({ entityType, entityId });

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    
    setIsDeleting(true);
    try {
      console.log(`Deleting document: ${documentToDelete.id}, URL: ${documentToDelete.url}`);
      const success = await deleteDocument(documentToDelete.id, documentToDelete.url);
      
      if (success && onDeleted) {
        onDeleted();
        toast("Documento eliminado", {
          description: "El documento ha sido eliminado correctamente",
          icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast("Error", { 
        description: "Error al eliminar documento",
        icon: <AlertCircle className="h-4 w-4 text-red-400" />
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = (url: string, documentName: string) => {
    try {
      // Verify that the URL is valid
      if (!url) {
        toast("Error", { 
          description: "URL del documento no válida",
          icon: <AlertCircle className="h-4 w-4 text-red-400" />
        });
        return;
      }

      console.log("Opening document URL:", url);
      
      // Open the URL in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error opening document:", error);
      toast("Error", { 
        description: "Error al abrir el documento",
        icon: <AlertCircle className="h-4 w-4 text-red-400" />
      });
    }
  };

  const getDocumentBadgeClass = (type: string) => {
    switch(type) {
      case "RUT": 
        return "bg-blue-900/30 text-blue-300 border-blue-800/30";
      case "Cámara de Comercio": 
        return "bg-purple-900/30 text-purple-300 border-purple-800/30";
      case "Contrato": 
        return "bg-yellow-900/30 text-yellow-300 border-yellow-800/30";
      case "NDA": 
        return "bg-red-900/30 text-red-300 border-red-800/30";
      case "Factura": 
        return "bg-green-900/30 text-green-300 border-green-800/30";
      default: 
        return "bg-slate-800/50 text-slate-300 border-slate-700/50";
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-purple-400/30 mx-auto mb-3" />
        <p className="text-slate-400">No hay documentos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-4 border border-purple-800/30 rounded-lg bg-[#1e1756]/20"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-[#0f0b2a] rounded-md border border-purple-800/30">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="font-medium text-white">{doc.name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge 
                  variant="outline"
                  className={getDocumentBadgeClass(doc.type)}
                >
                  {doc.type}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Subido el {formatDate(doc.uploadDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleDownload(doc.url, doc.name)}
              className="bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
            >
              <Download className="h-4 w-4 mr-1 text-purple-400" />
              Descargar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleDelete(doc)}
              className="text-red-300 hover:text-red-200 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1e1756] border-purple-800/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Esta acción eliminará permanentemente el documento 
              "<span className="text-white font-medium">{documentToDelete?.name}</span>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeleting}
              className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Eliminando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}