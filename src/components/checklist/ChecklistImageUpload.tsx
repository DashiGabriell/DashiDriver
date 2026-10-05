import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, AlertTriangle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CHECKLIST_IMAGE_ACCEPT,
  isSupportedImageFile,
  normalizeChecklistImage,
} from "@/lib/checklist/imageProcessor";

interface ChecklistImageUploadProps {
  onImageSelected: (file: File, km?: number, observation?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  stepKey?: string;
  ultimoKm?: number | null;
}

export function ChecklistImageUpload({
  onImageSelected,
  isLoading = false,
  disabled = false,
  stepKey,
  ultimoKm,
}: ChecklistImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [observation, setObservation] = useState("");
  const [kmValue, setKmValue] = useState<string>("");
  const [showKmCorrection, setShowKmCorrection] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isPainel = stepKey === "painel";

  const handleFileSelect = async (originalFile: File) => {
    if (!isSupportedImageFile(originalFile)) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (originalFile.size > maxSize) {
      toast.error("Imagem muito grande. Máximo 10MB");
      return;
    }

    let file: File;
    setIsConverting(true);
    try {
      file = await normalizeChecklistImage(originalFile);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler esta imagem");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    } finally {
      setIsConverting(false);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setSelectedFile(file);
      setObservation("");
    };
    reader.readAsDataURL(file);
  };

  const handleKmChange = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    setKmValue(numeric);
    if (ultimoKm && Number(numeric) < ultimoKm && numeric.length > 0) {
      setShowKmCorrection(true);
    } else {
      setShowKmCorrection(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    const km = isPainel && kmValue ? Number(kmValue) : undefined;
    const obs = isPainel && showKmCorrection && correctionReason
      ? `Correção: ${correctionReason}`
      : observation || undefined;
    onImageSelected(selectedFile, km, obs);
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    setObservation("");
    setKmValue("");
    setShowKmCorrection(false);
    setCorrectionReason("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) handleFileSelect(files[0]);
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
          preview
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-primary/2"
        } ${disabled || isLoading || isConverting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={CHECKLIST_IMAGE_ACCEPT}
          onChange={handleInputChange}
          disabled={disabled || isLoading || isConverting}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {isConverting ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Preparando imagem...</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground truncate max-w-xs">
                {selectedFile?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Imagem selecionada</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Trocar imagem
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Selecione uma imagem</p>
              <p className="text-xs text-muted-foreground mt-1">
                Arraste e solte ou clique para selecionar
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Formatos: JPG, PNG, WebP, HEIC • Máximo: 10MB</p>
          </div>
        )}
      </div>

      {!preview && !isConverting && (
        <>
          <input
            ref={cameraInputRef}
            type="file"
            accept={CHECKLIST_IMAGE_ACCEPT}
            capture="environment"
            onChange={handleInputChange}
            disabled={disabled || isLoading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 md:hidden"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled || isLoading}
          >
            <Camera className="w-4 h-4" />
            Tirar foto
          </Button>
        </>
      )}

      {preview && (
        <div className="space-y-3">
          {isPainel && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                KM Atual do Veículo
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Ex: 125500"
                value={kmValue}
                onChange={(e) => handleKmChange(e.target.value)}
                className="font-mono text-lg h-12"
                disabled={isLoading}
              />
              {ultimoKm && (
                <p className="text-xs text-muted-foreground">
                  Último KM registrado: {ultimoKm.toLocaleString("pt-BR")} km
                </p>
              )}

              {showKmCorrection && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-600">
                        KM menor que o último registrado
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        O valor digitado ({Number(kmValue).toLocaleString("pt-BR")} km) é menor que
                        o último registrado ({ultimoKm?.toLocaleString("pt-BR")} km). Se for uma
                        correção, informe o motivo abaixo.
                      </p>
                    </div>
                  </div>
                  <Input
                    type="text"
                    placeholder="Motivo da correção (ex: Digitei 150.000 por engano)"
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="text-sm"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          )}

          <Textarea
            placeholder="Observação opcional sobre esta foto..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="min-h-[60px] text-sm"
            disabled={isLoading}
          />

          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full gap-2 h-11"
            disabled={isLoading || disabled || (isPainel && !kmValue)}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Enviar imagem
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
