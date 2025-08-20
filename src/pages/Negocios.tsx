import React, { useEffect, useMemo, useState } from "react";
import { getAllNegocios, createNegocio, updateNegocio, deleteNegocio, type Negocio } from "../Fetch/negocios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
    DialogClose,
} from "../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const NegociosList: React.FC = () => {
    const [data, setData] = useState<Negocio[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("");

    // create/edit state
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [editing, setEditing] = useState<Negocio | null>(null);
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [nombreEdit, setNombreEdit] = useState("");

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllNegocios();
            if (res.ok) setData(res.data || []);
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Error al cargar";
                setError(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const f = filter.trim().toLowerCase();
        if (!f) return data;
        return data.filter((n) => n.vc_nombre.toLowerCase().includes(f));
    }, [data, filter]);

    const onCreate = async () => {
        if (!nombreNuevo.trim()) return;
        setLoading(true);
        try {
            await createNegocio(nombreNuevo.trim());
            setNombreNuevo("");
            setOpenCreate(false);
            await load();
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Error al crear";
                setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const onStartEdit = (n: Negocio) => {
        setEditing(n);
        setNombreEdit(n.vc_nombre);
        setOpenEdit(true);
    };

    const onEdit = async () => {
        if (!editing) return;
        setLoading(true);
        try {
            await updateNegocio(editing.id_negocio, { vc_nombre: nombreEdit.trim() });
            setOpenEdit(false);
            setEditing(null);
            await load();
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Error al actualizar";
                setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async (id: number) => {
        setLoading(true);
        try {
            await deleteNegocio(id);
            await load();
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Error al eliminar";
                setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Establecimientos</h2>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Buscar por nombre..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-64"
                    />
                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                        <DialogTrigger asChild>
                            <Button>Nuevo</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear establecimiento</DialogTitle>
                                <DialogDescription>Ingresa el nombre del negocio</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Nombre"
                                    value={nombreNuevo}
                                    onChange={(e) => setNombreNuevo(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button onClick={onCreate} disabled={loading || !nombreNuevo.trim()}>
                                    {loading ? "Guardando..." : "Guardar"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-600">{error}</div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="w-[160px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={3}>Cargando...</TableCell>
                            </TableRow>
                        )}
                        {!loading && filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3}>Sin resultados</TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            filtered.map((n) => (
                                <TableRow key={n.id_negocio}>
                                    <TableCell>{n.id_negocio}</TableCell>
                                    <TableCell>{n.vc_nombre}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={() => onStartEdit(n)}>
                                                Editar
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">Eliminar</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Eliminar establecimiento</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción no se puede deshacer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(n.id_negocio)}>
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit dialog */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar establecimiento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Input value={nombreEdit} onChange={(e) => setNombreEdit(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={onEdit} disabled={loading || !nombreEdit.trim()}>
                            {loading ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NegociosList;