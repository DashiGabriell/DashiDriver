import { ChecklistImagePreview } from "./ChecklistImagePreview";

export interface ChecklistImage {
  id: string;
  image_url: string;
  step_key: string;
  step_label: string;
  taken_at: string;
  metadata?: any;
}

interface ChecklistImageGridProps {
  images: ChecklistImage[];
  onDelete?: (id: string) => void;
  onReplace?: (image: ChecklistImage) => void;
}

export function ChecklistImageGrid({
  images,
  onDelete,
  onReplace,
}: ChecklistImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 rounded-lg border border-dashed border-muted-foreground/20">
        <p className="text-muted-foreground text-sm">
          Nenhuma foto capturada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <ChecklistImagePreview
          key={image.id}
          imageUrl={image.image_url}
          stepLabel={image.step_label}
          takenAt={image.taken_at}
          size={image.metadata?.finalSize}
          onDelete={onDelete ? () => onDelete(image.id) : undefined}
          onReplace={onReplace ? () => onReplace(image) : undefined}
        />
      ))}
    </div>
  );
}
