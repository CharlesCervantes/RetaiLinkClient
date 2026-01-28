import { useState } from "react"
import { Button } from "../components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
export interface ModalCustomProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    buttonTitle?: string;
    dialogTitle: string;
    dialogDescription: string;
    body: React.ReactNode;
    onSubmit?: () => Promise<boolean> | boolean;
    isLoading?: boolean;
    showTrigger?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Nuevo: tamaño del modal
}

export function ModalCustom({ 
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    buttonTitle, 
    dialogTitle, 
    dialogDescription, 
    body, 
    onSubmit, 
    isLoading = false,
    showTrigger = true,
    size = 'sm' // Default: tamaño pequeño
}: ModalCustomProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      const success = await onSubmit();
      if (success) {
        setOpen(false);
      }
    }
  };

  // Mapeo de tamaños
  const sizeClasses = {
    sm: 'sm:max-w-[425px]',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl',
    full: 'sm:max-w-[95vw]'
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline">{buttonTitle}</Button>
          </DialogTrigger>
        )}

        <DialogContent className={`${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                {dialogDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4">
              {body}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  )
}