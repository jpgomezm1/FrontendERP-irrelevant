import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { Button } from "./button";

export interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  className?: string;
  buttonText?: string;
  selectedFile?: File | null;
  value?: string;
  onChange?: (value: string) => void;
  bucket?: string;
  accept?: string;
}

export function FileUpload({
  onFileSelect,
  acceptedFileTypes = ".pdf,.jpg,.jpeg,.png",
  maxFileSizeMB = 5,
  className,
  buttonText = "Seleccionar archivo",
  selectedFile = null,
  value,
  onChange,
  bucket,
  accept,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(selectedFile);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileTypes = accept || acceptedFileTypes;

  const handleFileSelect = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) {
        setFile(null);
        onFileSelect(null);
        if (onChange) onChange("");
        return;
      }

      const fileExtension = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;
      const isValidType = fileTypes
        .split(",")
        .some(type => type.trim() === fileExtension || type.trim() === selectedFile.type);

      if (!isValidType) {
        setError(`Tipo de archivo no permitido. Use: ${fileTypes}`);
        return;
      }

      const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setError(`El archivo excede el tamaño máximo de ${maxFileSizeMB}MB`);
        return;
      }

      setError(null);
      setFile(selectedFile);
      onFileSelect(selectedFile);
      
      if (onChange) {
        const mockFileUrl = URL.createObjectURL(selectedFile);
        onChange(mockFileUrl);
      }
    },
    [fileTypes, maxFileSizeMB, onFileSelect, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      if (e.dataTransfer.files.length) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    onFileSelect(null);
    if (onChange) onChange("");
  };

  return (
    <div className={className}>
      <div
        className={cn(
          "file-upload-area border-2 border-dashed border-muted-foreground/25 rounded-md p-4",
          isDragging && "bg-muted/50 border-primary",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {(file || value) ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-between w-full bg-secondary rounded p-2">
              <span className="text-sm truncate max-w-[200px]">
                {file ? file.name : value ? value.split('/').pop() : 'Archivo seleccionado'}
              </span>
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {file && (
              <div className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              Arrastre y suelte, o haga clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground">
              Archivos permitidos: {fileTypes.replace(/\./g, "")}
            </p>
            <p className="text-xs text-muted-foreground">
              Tamaño máximo: {maxFileSizeMB}MB
            </p>
            <Button variant="secondary" size="sm" className="mt-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                {buttonText}
              </label>
            </Button>
          </div>
        )}
        <input
          id="file-upload"
          type="file"
          className="sr-only"
          onChange={handleInputChange}
          accept={fileTypes}
        />
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
}
