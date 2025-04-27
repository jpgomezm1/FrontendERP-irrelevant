import React, { useEffect } from "react";
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
import { CalendarIcon, CalendarDays, FolderKanban, ClipboardList } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/clients";

const projectFormSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  status: z.enum(["Activo", "Pausado", "Finalizado", "Cancelado"]),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  notes: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface EditProjectDialogProps {
  children: React.ReactNode;
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
  children,
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate || null,
      notes: project.notes || "",
    },
  });

  // Actualizar el formulario cuando cambia el proyecto
  useEffect(() => {
    if (open) {
      form.reset({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate || null,
        notes: project.notes || "",
      });
    }
  }, [project, open, form]);

  function onSubmit(data: ProjectFormValues) {
    console.log("Actualizando proyecto:", data);
    // Aquí iría la lógica para actualizar el proyecto
    
    toast({
      title: "Proyecto actualizado",
      description: "Los datos del proyecto han sido actualizados correctamente.",
    });
    
    onOpenChange(false);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#1e1756] border-purple-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-purple-400" />
            Editar Proyecto
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Modifica la información del proyecto
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white form-required">Nombre del Proyecto</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
                    />
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
                  <FormLabel className="text-white form-required">Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-[#0f0b2a] border-purple-800/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#1e1756] border-purple-800/30 text-white">
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Pausado">Pausado</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white form-required">Descripción</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ClipboardList className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                      <Textarea
                        className="resize-none bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500 pl-10"
                        rows={3}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white form-required">Fecha de Inicio</FormLabel>
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-white">Fecha de Finalización (opcional)</FormLabel>
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
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarDays className="ml-auto h-4 w-4 text-purple-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#1e1756] border-purple-800/30" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < form.watch("startDate")}
                          className="bg-[#1e1756]"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-slate-400">
                      Define cuándo finalizará este proyecto
                    </FormDescription>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none bg-[#0f0b2a] border-purple-800/30 text-white placeholder:text-slate-400 focus:border-purple-500"
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
                className="bg-transparent border-purple-800/30 text-white hover:bg-[#0f0b2a]"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}