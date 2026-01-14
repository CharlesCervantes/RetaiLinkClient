import { useState } from 'react'
import { Upload, Download, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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

import { useAuthStore } from '../../store/authStore'
import { uploadStoresFromExcel } from '../../Fetch/establecimientos';

interface Props {
    id_client?: number;
    onSuccess?: () => void;
}

export function EstablecimientoModalRegistroMasivo({ id_client, onSuccess }: Props) {
    const { user } = useAuthStore();

    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) {
            setFile(null);
            return;
        }

        const validExtensions = [".xlsx", ".xls"];
        const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

        if (!validExtensions.includes(extension)) {
            toast.error("Solo se permiten archivos Excel (.xlsx, .xls)");
            e.target.value = "";
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Selecciona un archivo Excel");
            return;
        }

        const clientId = id_client || user?.id_client;

        if (!clientId) {
            toast.error("No se pudo identificar el cliente");
            return;
        }

        setLoading(true);

        try {
            const result = await uploadStoresFromExcel(clientId, user?.id_user || 0, file);

            if (result.ok) {
                toast.success(result.message);

                if (result.data?.failed > 0) {
                    toast.warning(`${result.data.failed} registros no se pudieron importar`);
                    console.log("Errores de importación:", result.data.errors);
                }

                setOpen(false);
                setFile(null);
                onSuccess?.();
            } else {
                toast.error(result.message || "Error al importar establecimientos");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al procesar el archivo");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadTemplate = () => {
        try {
            const templateData = [
                {
                    Nombre: "Ejemplo Tienda 1",
                    Codigo: "TDA-001",
                    Calle: "Av. Principal",
                    Numero_Ext: "123",
                    Numero_Int: "",
                    Colonia: "Centro",
                    Municipio: "Monterrey",
                    Estado: "Nuevo León",
                    CP: "64000",
                    Pais: "México",
                },
                {
                    Nombre: "Ejemplo Tienda 2",
                    Codigo: "TDA-002",
                    Calle: "Calle Roble",
                    Numero_Ext: "456",
                    Numero_Int: "Local 3",
                    Colonia: "Del Valle",
                    Municipio: "San Pedro",
                    Estado: "Nuevo León",
                    CP: "66220",
                    Pais: "México",
                }
            ];

            const ws = XLSX.utils.json_to_sheet(templateData);

            ws['!cols'] = [
                { wch: 20 },
                { wch: 12 },
                { wch: 25 },
                { wch: 12 },
                { wch: 12 },
                { wch: 15 },
                { wch: 15 },
                { wch: 15 },
                { wch: 10 },
                { wch: 12 },
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Establecimientos");

            XLSX.writeFile(wb, "plantilla_establecimientos.xlsx");

            toast.success("Plantilla descargada");
        } catch (error) {
            console.error("f.handleDownloadTemplate: ", error);
            toast.error("Error al generar la plantilla");
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!loading) {
            setOpen(isOpen);
            if (!isOpen) {
                setFile(null);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Upload size={18} />
                    Registro masivo
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registro masivo de establecimientos</DialogTitle>
                        <DialogDescription>
                            Sube un archivo Excel con los datos de los establecimientos.
                            Descarga la plantilla para ver el formato requerido.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid w-full items-center gap-3">
                            <Label htmlFor="excel-file">Archivo Excel</Label>
                            <Input
                                id="excel-file"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                disabled={loading}
                            />
                            {file && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FileSpreadsheet size={16} />
                                    <span>{file.name}</span>
                                </div>
                            )}
                        </div>

                        <Button type="submit" disabled={loading || !file}>
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Upload size={18} className="mr-2" />
                                    Subir e importar
                                </>
                            )}
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            disabled={loading}
                        >
                            <Download size={18} className="mr-2" />
                            Descargar plantilla
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}