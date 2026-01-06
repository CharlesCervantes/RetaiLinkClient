import { Upload, Download } from "lucide-react";

import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"

export function EstablecimientoModalRegistroMasivo() {

    const handleDownloadTemplate = () => {
        try {
            const link = document.createElement('a');

            link.href = '/templates/establecimientos_template.xlsx';
            link.download = 'establecimientos_template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("f.hanldeDownloadTemplate: ", error);
        }
    };

    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        <Upload size={18} />
                        Registro masivo de establecimientos
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Registro masivo de establecimientos</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid w-full max-w-sm items-center gap-3">
                            <Label htmlFor="template"></Label>
                            <Input id="template" type="file" accept=".xlsx,.xls" />
                        </div>
                        <Button type="submit"> <Upload size={18} /> Subir</Button>
                    </div>

                    <DialogFooter>
                        <Button type="button" onClick={handleDownloadTemplate}>
                            <Download size={18} />
                            Descargar template
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}