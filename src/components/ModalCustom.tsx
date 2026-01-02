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
    buttonTitle: string;
    dialogTitle: string;
    dialogDescription: string;

    body: React.ReactNode;
    onSubmit?: () => Promise<boolean> | boolean;
    isLoading?: boolean;
}

export function ModalCustom({ buttonTitle, dialogTitle, dialogDescription, body, onSubmit, isLoading = false }: ModalCustomProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      const success = await onSubmit();
      if (success) {
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">{buttonTitle}</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>
                {dialogDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {body}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
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
