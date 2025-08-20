import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getUsersByBusiness, type Usuario } from "../fetch/usuarios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const UsuariosTabla: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState("");

    const negocioNombre = location.state?.negocioNombre || "Negocio";

    useEffect(() => {
        if (id) {
            loadUsuarios();
        }
    }, [id]);

    const loadUsuarios = async () => {
        if (!id) return;
        
        setLoading(true);
        setError(null);
        try {
            const res = await getUsersByBusiness(parseInt(id));
            if (res.ok) {
                setUsuarios(res.data || []);
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Error al cargar usuarios";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsuarios = React.useMemo(() => {
        const f = filter.trim().toLowerCase();
        if (!f) return usuarios;
        return usuarios.filter((u) => 
            u.vc_nombre.toLowerCase().includes(f) ||
            u.vc_email.toLowerCase().includes(f) ||
            (u.vc_telefono && u.vc_telefono.toLowerCase().includes(f))
        );
    }, [usuarios, filter]);

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "No disponible";
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">Usuarios de {negocioNombre}</h2>
                    <p className="text-sm text-muted-foreground">
                        Total de usuarios: {usuarios.length}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-80"
                    />
                    <Button variant="outline" onClick={() => navigate(`/negocios/${id}`)}>
                        Volver al Negocio
                    </Button>
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha de Registro</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Cargando usuarios...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && filteredUsuarios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {usuarios.length === 0 ? "No hay usuarios registrados en este negocio" : "Sin resultados para la búsqueda"}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            filteredUsuarios.map((usuario) => (
                                <TableRow key={usuario.id_usuario}>
                                    <TableCell className="font-medium">{usuario.id_usuario}</TableCell>
                                    <TableCell>{usuario.vc_nombre}</TableCell>
                                    <TableCell>{usuario.vc_email}</TableCell>
                                    <TableCell>{usuario.vc_telefono || "No disponible"}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            usuario.b_activo !== false 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {usuario.b_activo !== false ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(usuario.dt_registro)}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default UsuariosTabla;