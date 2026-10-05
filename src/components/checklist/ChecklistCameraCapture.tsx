import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, RotateCcw, Check, X, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CHECKLIST_IMAGE_ACCEPT, normalizeChecklistImage } from "@/lib/checklist/imageProcessor";

interface ChecklistCameraCaptureProps {
  stepKey: string;
  stepLabel: string;
  required: boolean;
  onCapture: (file: File, km?: number, observation?: string) => Promise<void>;
  onCancel?: () => void;
  cameraOnly?: boolean;
  ultimoKm?: number | null;
}

export function ChecklistCameraCapture({
  stepKey,
  stepLabel,
  required,
  onCapture,
  onCancel,
  cameraOnly,
  ultimoKm,
}: ChecklistCameraCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [observation, setObservation] = useState("");
  const [kmValue, setKmValue] = useState<string>("");
  const [showKmCorrection, setShowKmCorrection] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPainel = stepKey === "painel";

  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const originalFile = input.files?.[0];
    if (!originalFile) return;

    setIsConverting(true);
    try {
      const file = await normalizeChecklistImage(originalFile);
      setSelectedFile(file);
      setObservation("");
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível ler esta imagem");
    } finally {
      setIsConverting(false);
      input.value = "";
    }
  };

  const handleCaptureClick = () => {
    if (isConverting) return;
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setObservation("");
    setKmValue("");
    setShowKmCorrection(false);
    setCorrectionReason("");
    fileInputRef.current?.click();
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

  const handleConfirm = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const km = isPainel && kmValue ? Number(kmValue) : undefined;
      const obs = isPainel && showKmCorrection && correctionReason
        ? `Correção: ${correctionReason}`
        : observation || undefined;
      await onCapture(selectedFile, km, obs);
      setPreviewUrl(null);
      setSelectedFile(null);
      setObservation("");
      setKmValue("");
      setShowKmCorrection(false);
      setCorrectionReason("");
    } catch (error) {

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <input
        type="file"
        accept={CHECKLIST_IMAGE_ACCEPT}
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <Card
          onClick={handleCaptureClick}
          className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            {isConverting ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            ) : (
              <Camera className="w-8 h-8 text-primary" />
            )}
          </div>
          <h3 className="font-semibold text-lg">{stepLabel}</h3>
          <p className="text-sm text-muted-foreground text-center px-6 mt-2">
            Toque para {cameraOnly ? "fotografar" : "abrir a câmera e tirar a foto"} {required && <span className="text-destructive">*</span>}
          </p>
          {!cameraOnly && (
            <Button variant="outline" size="sm" className="mt-6 gap-2">
              <ImageIcon className="w-4 h-4" />
              Escolher da Galeria
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden bg-black">
          <div className="relative aspect-square group">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />

            <button
              onClick={() => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setSelectedFile(null);
                setObservation("");
                setKmValue("");
                setShowKmCorrection(false);
                setCorrectionReason("");
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20"
              disabled={isUploading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            {isPainel && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-1">
                  KM Atual do Veículo
                  <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 125500"
                  value={kmValue}
                  onChange={(e) => handleKmChange(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 font-mono text-lg h-12"
                  disabled={isUploading}
                />
                {ultimoKm && (
                  <p className="text-xs text-white/60">
                    Último KM registrado: {ultimoKm.toLocaleString("pt-BR")} km
                  </p>
                )}

                {showKmCorrection && (
                  <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-300">
                          KM menor que o último registrado
                        </p>
                        <p className="text-xs text-amber-200/80 mt-1">
                          O valor digitado ({Number(kmValue).toLocaleString("pt-BR")} km) é menor que o último registrado ({ultimoKm?.toLocaleString("pt-BR")} km).
                          Se for uma correção, informe o motivo abaixo.
                        </p>
                      </div>
                    </div>
                    <Input
                      type="text"
                      placeholder="Motivo da correção (ex: Digitei 150.000 por engano)"
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm"
                      disabled={isUploading}
                    />
                  </div>
                )}
              </div>
            )}

            <Textarea
              placeholder="Observação opcional sobre esta foto..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              className="min-h-[50px] text-sm bg-muted/10 border-white/10 text-white placeholder:text-white/40"
              disabled={isUploading}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                variant="secondary"
                className="flex-1 gap-2"
                disabled={isUploading}
              >
                <RotateCcw className="w-4 h-4" />
                Tirar Novamente
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                disabled={isUploading || (isPainel && !kmValue)}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {isUploading ? "Enviando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {onCancel && !previewUrl && (
        <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
          Cancelar
        </Button>
      )}
    </div>
  );
}
