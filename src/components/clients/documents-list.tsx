
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Document } from "@/types/clients";
import { FileText, Download, Trash2 } from "lucide-react";
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

interface DocumentsListProps {
  documents: Document[];
  entityType: "client" | "project";
  entityId: number;
}

export function DocumentsList({ 
  documents, 
  entityType,
  entityId 
}: DocumentsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // Aquí iría la lógica para eliminar el documento
    console.log(`Eliminando documento ${documentToDelete?.id}`);
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };

  const getDocumentBadgeColor = (type: string) => {
    switch(type) {
      case "RUT": return "default";
      case "Cámara de Comercio": return "secondary";
      case "Contrato": return "warning";
      case "NDA": return "destructive";
      case "Factura": return "success";
      default: return "outline";
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No hay documentos registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-4 border rounded-lg bg-card"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{doc.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getDocumentBadgeColor(doc.type)}>
                  {doc.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Subido el {formatDate(doc.uploadDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" asChild>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-1" />
                Descargar
              </a>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => handleDelete(doc)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el documento 
              "{documentToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
