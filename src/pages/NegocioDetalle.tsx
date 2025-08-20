import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { type Negocio, getNegocioById } from "../Fetch/negocios";

const NegocioDetalle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [negocio, setNegocio] = useState<Negocio | undefined>(location.state?.negocio);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!negocio && id) {
            const loadNegocio = async () => {
                setLoading(true);
                setError(null);
                try {
                    const res = await getNegocioById(parseInt(id));
                    if (res.ok) {
                        setNegocio(res.data);
                    }
                } catch (e) {
                    const msg = e instanceof Error ? e.message : "Error al cargar el negocio";
                    setError(msg);
                } finally {
                    setLoading(false);
                }
            };
            loadNegocio();
        }
    }, [id, negocio]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Detalle del Negocio</h2>
                    <Button variant="outline" onClick={() => navigate('/negocios')}>
                        Volver
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">Cargando...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Detalle del Negocio</h2>
                    <Button variant="outline" onClick={() => navigate('/negocios')}>
                        Volver
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!negocio) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Detalle del Negocio</h2>
                    <Button variant="outline" onClick={() => navigate('/negocios')}>
                        Volver
                    </Button>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">No se encontraron datos del negocio.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "No disponible";
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Detalle del Negocio</h2>
                <Button variant="outline" onClick={() => navigate('/negocios')}>
                    Volver a Negocios
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{negocio.vc_nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">ID del Negocio</label>
                            <p className="text-lg">{negocio.id_negocio}</p>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Estado</label>
                            <p className="text-lg">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    negocio.b_activo !== false 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {negocio.b_activo !== false ? 'Activo' : 'Inactivo'}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                            <p className="text-lg">{formatDate(negocio.dt_registro)}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                            <p className="text-lg">{formatDate(negocio.dt_actualizacion)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Acciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => navigate('/negocios')}
                        >
                            Editar Negocio
                        </Button>
                        <Button 
                            variant="secondary"
                            onClick={() => navigate(`/negocios/${negocio.id_negocio}/usuarios`, { 
                                state: { negocioNombre: negocio.vc_nombre } 
                            })}
                        >
                            Ver Usuarios
                        </Button>
                        <Button 
                            variant="secondary"
                            onClick={() => {
                                // Aquí se puede agregar funcionalidad adicional como ver productos, empleados, etc.
                                console.log('Ver más detalles del negocio:', negocio.id_negocio);
                            }}
                        >
                            Ver Productos
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NegocioDetalle;