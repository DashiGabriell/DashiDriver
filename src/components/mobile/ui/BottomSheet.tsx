import { Drawer } from "vaul";
import { ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
  trigger?: ReactNode;
  title?: string;
  description?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const BottomSheet = ({
  children,
  trigger,
  title,
  description,
  isOpen,
  onOpenChange,
}: BottomSheetProps) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground>
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
        <Drawer.Content className="bg-background flex flex-col rounded-t-[32px] h-auto max-h-[94vh] mt-24 fixed bottom-0 left-0 right-0 z-[101] border-t border-border/50 shadow-neu">
          <div className="p-4 bg-background rounded-t-[32px] flex-1">
            {/* Grabber/Handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-6" />
            
            <div className="max-w-md mx-auto">
              {title && (
                <Drawer.Title className="font-bold text-xl mb-1 text-center">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="text-muted-foreground text-sm mb-6 text-center">
                  {description}
                </Drawer.Description>
              )}
              
              <div className="pb-safe-bottom">
                {children}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default BottomSheet;
