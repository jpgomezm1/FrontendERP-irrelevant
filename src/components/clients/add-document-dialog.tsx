import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentType } from "@/types/clients";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, FileUp, Tag, AlertCircle, CheckCircle2 } from "lucide-react";

const documentFormSchema = z.object({
  name: z.string().min(1, { message: "El nombre del documento es requerido" }),
  type: z.enum([
    "RUT", 
    "Cámara de Comercio", 
    "NDA", 
    "Contrato", 
    "Factura", 
    "Otro"
  ]),
  file: z.any().refine((file) => file?.size, {
    message: "El archivo es requerido",
  }),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

interface AddDocumentDialogProps {
  children: React.ReactNode;
  clientId?: number;
  projectId?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDocumentDialog({
  children,
  clientId,
  projectId,
  open,
  onOpenChange,
}: AddDocumentDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      type: "Otro",
    },
  });

  function onSubmit(data: DocumentFormValues) {
    setIsSubmitting(true);
    console.log("Añadiendo documento:", data);
    
    // Simular carga
    setTimeout(() => {
      // Aquí iría la lógica para subir y asociar el documento
      
      toast({
        title: "Documento subido",
        description: "El documento ha sido subido correctamente.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
      });
      
      form.reset();
      setIsSubmitting(false);
      onOpenChange(false);
    }, 1500);
  }

  const documentTypes: DocumentType[] = [
    "RUT", 
    "Cámara de Comercio", 
    "NDA", 
    "Contrato", 
    "Factura", 
    "Otro"
  ];

  const entityType = clientId ? "cliente" : "proyecto";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-[#1e1756] border-purple-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-400" />
            Añadir Documento
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Sube un nuevo documento para el {entityType}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Nombre del Documento</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                      <Input 
                        placeholder="Ej. Contrato de Servicios 2023" 
                        {...field} 
                        className="pl-10 bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tipo de Documento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                        <Tag className="h-4 w-4 mr-2 text-purple-400" />
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel className="text-white">Archivo</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-purple-800/30 rounded-md p-6 flex flex-col items-center justify-center text-center bg-[#0f0b2a]/50">
                      <FileUp className="h-10 w-10 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-300">
                        Arrastra y suelta un archivo o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Formatos aceptados: PDF, DOC, XLS, JPG, PNG. Máx 5MB
                      </p>
                      <FileUpload
                        onFileSelect={(file) => onChange(file)}
                        acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        className="mt-4 bg-[#1e1756]/20 border-purple-800/20 text-white hover:bg-[#1e1756]/40"
                        {...rest}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Subiendo...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FileUp className="h-4 w-4 mr-2" />
                    Subir Documento
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}