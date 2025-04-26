
import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { usePaymentsData } from "@/hooks/use-payments-data";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, Calendar, Upload, Eye, Upload as UploadIcon, Trash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPaymentsByProjectId } from "@/services/paymentService";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ProjectPaymentsProps {
  projectId: number;
}

export function ProjectPayments({ projectId }: ProjectPaymentsProps) {
  const { toast } = useToast();
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [documentUploadStatus, setDocumentUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedDocumentUrl, setUploadedDocumentUrl] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  
  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ['project-payments', projectId],
    queryFn: () => getPaymentsByProjectId(projectId),
  });
  
  const { updatePaymentStatus, generateInstallments } = usePaymentsData();
  
  const handleOpenMarkAsPaidDialog = (paymentId: number) => {
    setSelectedPaymentId(paymentId);
    setMarkAsPaidDialogOpen(true);
    setDocumentUploadStatus('idle');
    setUploadedDocumentUrl(null);
    setFileToUpload(null);
  };
  
  const handleOpenDocumentPreview = (documentUrl: string) => {
    setSelectedDocumentUrl(documentUrl);
    setPreviewDialogOpen(true);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileToUpload(files[0]);
    }
  };
  
  const handleUploadDocument = async () => {
    if (!fileToUpload || !selectedPaymentId) return;
    
    try {
      setDocumentUploadStatus('uploading');
      
      // Create a unique file path
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-payment-${selectedPaymentId}.${fileExt}`;
      const filePath = `payment-documents/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('payment-documents')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('payment-documents')
        .getPublicUrl(filePath);
      
      setUploadedDocumentUrl(urlData.publicUrl);
      setDocumentUploadStatus('success');
      
    } catch (error) {
      console.error("Error uploading document:", error);
      setDocumentUploadStatus('error');
      toast({
        title: "Error",
        description: "No se pudo subir el documento",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkAsPaid = async () => {
    if (!selectedPaymentId) return;
    
    try {
      setIsUpdating(true);
      await updatePaymentStatus(
        selectedPaymentId, 
        "Pagado", 
        selectedDate || new Date(),
        uploadedDocumentUrl || undefined
      );
      
      toast({
        title: "Pago actualizado",
        description: "El pago ha sido marcado como pagado correctamente"
      });
      
      setMarkAsPaidDialogOpen(false);
      refetch(); // Refresh the payments list
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pago",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleGenerateInstallments = async () => {
    try {
      // Get the first payment to extract project details
      const firstPayment = payments[0];
      if (!firstPayment) {
        throw new Error("No se encontraron pagos para este proyecto");
      }
      
      // Get payment plan details from existing payments
      const implementationPayments = payments.filter(p => p.type === "Implementación");
      const recurringPayments = payments.filter(p => p.type === "Recurrente");
      
      let planType = "Fee único";
      if (implementationPayments.length > 0 && recurringPayments.length > 0) {
        planType = "Mixto";
      } else if (implementationPayments.length > 0 && implementationPayments.length > 1) {
        planType = "Fee por cuotas";
      } else if (recurringPayments.length > 0) {
        planType = "Suscripción periódica";
      }
      
      // Calculate implementation fee params
      let implementationParams = undefined;
      if (implementationPayments.length > 0) {
        const totalAmount = implementationPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        implementationParams = {
          total: totalAmount,
          currency: implementationPayments[0].currency,
          installments: implementationPayments.length
        };
      }
      
      // Calculate recurring fee params
      let recurringParams = undefined;
      if (recurringPayments.length > 0) {
        // Use the most common amount (in case there are discounts)
        const amountCounts = {};
        recurringPayments.forEach(payment => {
          const amount = Number(payment.amount);
          amountCounts[amount] = (amountCounts[amount] || 0) + 1;
        });
        
        const mostCommonAmount = Object.keys(amountCounts).reduce(
          (a, b) => amountCounts[a] > amountCounts[b] ? a : b
        );
        
        recurringParams = {
          amount: Number(mostCommonAmount),
          currency: recurringPayments[0].currency,
          frequency: "Mensual", // Default to monthly
          dayOfCharge: new Date(recurringPayments[0].date).getDate(),
        };
      }
      
      await generateInstallments(
        projectId,
        firstPayment.clientId,
        planType,
        implementationParams,
        recurringParams
      );
      
      toast({
        title: "Cuotas generadas",
        description: "Las cuotas de pago han sido generadas correctamente"
      });
      
      refetch(); // Refresh the payments list
    } catch (error) {
      console.error("Error generating installments:", error);
      toast({
        title: "Error",
        description: "No se pudieron generar las cuotas de pago",
        variant: "destructive"
      });
    }
  };
  
  const paymentColumns = [
    {
      accessorKey: "date",
      header: "Fecha Programada",
      cell: ({ row }) => formatDate(new Date(row.original.date)),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.original.type;
        if (type === "Implementación") {
          const installment = row.original.installmentNumber;
          return `${type} (Cuota ${installment})`;
        }
        return type;
      },
    },
    {
      accessorKey: "amount",
      header: "Monto",
      cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge 
            variant={
              status === "Pagado" ? "success" : 
              status === "Pendiente" ? "warning" : 
              "destructive"
            }
            className="flex items-center gap-1"
          >
            {status === "Pagado" ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : status === "Vencido" ? (
              <XCircle className="h-3 w-3" />
            ) : null}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paidDate",
      header: "Fecha de Pago",
      cell: ({ row }) => row.original.paidDate ? formatDate(new Date(row.original.paidDate)) : "-",
    },
    {
      accessorKey: "documentUrl",
      header: "Comprobante",
      cell: ({ row }) => {
        if (row.original.documentUrl) {
          return (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleOpenDocumentPreview(row.original.documentUrl!)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Comprobante
            </Button>
          );
        }
        return "-";
      }
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const { status, id } = row.original;
        
        if (status === "Pendiente" || status === "Vencido") {
          return (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleOpenMarkAsPaidDialog(id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Marcar como Pagado
            </Button>
          );
        }
        
        return null;
      },
    },
  ];

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-muted-foreground">No hay pagos registrados para este proyecto</p>
        </div>
      ) : (
        <>
          <DataTable
            columns={paymentColumns}
            data={payments}
          />
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleGenerateInstallments}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Regenerar Cuotas
            </Button>
          </div>
        </>
      )}
      
      {/* Dialog for marking payment as paid */}
      <Dialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar pago como pagado</DialogTitle>
            <DialogDescription>
              Seleccione la fecha en que se realizó el pago y suba el comprobante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="font-medium text-sm">Fecha de pago</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, "PPP", {
                          locale: es,
                        })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex flex-col space-y-2">
                <label className="font-medium text-sm">Comprobante de pago</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="flex flex-col items-center space-y-2">
                    {documentUploadStatus === 'success' ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm text-green-700">Documento subido correctamente</p>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => setDocumentUploadStatus('idle')}
                          className="mt-2"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Eliminar y subir otro
                        </Button>
                      </div>
                    ) : (
                      <>
                        <UploadIcon className="h-8 w-8 text-gray-400" />
                        <p className="text-sm text-muted-foreground">
                          Sube un comprobante de pago (opcional)
                        </p>
                        <input
                          type="file"
                          accept="image/*, application/pdf"
                          onChange={handleFileChange}
                          className="w-full text-sm"
                        />
                        {fileToUpload && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleUploadDocument}
                            disabled={documentUploadStatus === 'uploading'}
                            className="mt-2"
                          >
                            {documentUploadStatus === 'uploading' ? (
                              <>
                                <span className="animate-spin mr-1">⏳</span>
                                Subiendo...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-1" />
                                Subir documento
                              </>
                            )}
                          </Button>
                        )}
                        {documentUploadStatus === 'error' && (
                          <p className="text-sm text-red-500 mt-2">
                            Error al subir el documento. Inténtalo de nuevo.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdating}>
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              type="button" 
              disabled={!selectedDate || isUpdating}
              onClick={handleMarkAsPaid}
            >
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for document preview */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 flex justify-center">
            {selectedDocumentUrl && (
              selectedDocumentUrl.endsWith('.pdf') ? (
                <iframe
                  src={selectedDocumentUrl}
                  className="w-full h-[500px]"
                  title="Documento de comprobante"
                />
              ) : (
                <img 
                  src={selectedDocumentUrl} 
                  alt="Comprobante de pago" 
                  className="max-w-full max-h-[500px] object-contain"
                />
              )
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setPreviewDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(selectedDocumentUrl!, '_blank')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Abrir en nueva pestaña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
