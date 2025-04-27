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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, User, Mail, Phone, MapPin, Building, Activity, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ClientStatus } from "@/types/clients";
import { useClientsData } from "@/hooks/use-clients-data";
import { useToast } from "@/components/ui/use-toast";

const clientFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  contactName: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(6, { message: "Número de teléfono inválido" }),
  address: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(["Activo", "Pausado", "Terminado"]),
  startDate: z.date(),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface AddClientDialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded?: () => void;
}

export function AddClientDialog({
  children,
  open,
  onOpenChange,
  onClientAdded
}: AddClientDialogProps) {
  const { addClient } = useClientsData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "Activo",
      startDate: new Date(),
    },
  });

  async function onSubmit(data: ClientFormValues) {
    console.log("Añadiendo cliente:", data);
    setIsSubmitting(true);
    
    try {
      // Actually add the client to the database using the hook function
      await addClient({
        name: data.name,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        taxId: data.taxId,
        status: data.status,
        startDate: data.startDate,
        notes: data.notes
      });
      
      toast({
        title: "Cliente agregado",
        description: "El cliente ha sido registrado exitosamente",
        icon: <CheckCircle2 className="h-4 w-4 text-green-400" />
      });
      
      if (onClientAdded) {
        onClientAdded();
      }
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al agregar cliente:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al agregar el cliente",
        variant: "destructive",
        icon: <AlertCircle className="h-4 w-4 text-red-400" />
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1e1756] border-purple-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-400" />
            Registrar Nuevo Cliente
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Ingresa la información del cliente
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nombre del Cliente</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                        <Input 
                          placeholder="Empresa S.A.S." 
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
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nombre del Contacto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                        <Input 
                          placeholder="Nombre y Apellido" 
                          {...field} 
                          className="pl-10 bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                        <Input 
                          placeholder="correo@empresa.com" 
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Teléfono</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                        <Input 
                          placeholder="+57 300 123 4567" 
                          {...field} 
                          className="pl-10 bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">NIT / ID Tributario</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                        <Input 
                          placeholder="900.123.456-7" 
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Estado</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                          <Activity className="h-4 w-4 mr-2 text-purple-400" />
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Pausado">Pausado</SelectItem>
                        <SelectItem value="Terminado">Terminado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Dirección</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                      <Input 
                        placeholder="Calle 123 # 45-67, Ciudad" 
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
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-white">Fecha de Inicio</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-[#0f0b2a] border-purple-800/30 text-white",
                            !field.value && "text-slate-400"
                          )}
                        >
                          <Clock className="h-4 w-4 mr-2 text-purple-400" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 text-purple-400" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1e1756] border-purple-800/30" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="bg-[#1e1756]"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el cliente"
                      className="resize-none bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 min-h-[100px]"
                      {...field}
                    />
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
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}