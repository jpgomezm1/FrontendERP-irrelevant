
import React from "react";
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
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      type: "Otro",
    },
  });

  function onSubmit(data: DocumentFormValues) {
    console.log("Añadiendo documento:", data);
    // Aquí iría la lógica para subir y asociar el documento
    
    toast({
      title: "Documento subido",
      description: "El documento ha sido subido correctamente.",
    });
    
    form.reset();
    onOpenChange(false);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Documento</DialogTitle>
          <DialogDescription>
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
                  <FormLabel>Nombre del Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Contrato de Servicios 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <FileUpload
                      onFileChange={(file) => onChange(file)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Subir Documento</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
