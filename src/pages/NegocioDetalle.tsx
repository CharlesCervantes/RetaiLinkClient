import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { type Negocio, getNegocioById } from "../Fetch/negocios";
import { getUsersByBusiness, Usuario, registerUserByBuisness } from "../Fetch/usuarios";
import { generatePassword, validateEmail, validateMexicanPhone } from "../utils/passwordGenerator";

const NegocioDetalle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [negocio, setNegocio] = useState<Negocio | undefined>(location.state?.negocio);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [isEmail, setIsEmail] = useState(true);
    const [formData, setFormData] = useState({
        vc_nombre: '',
        vc_username: '',
        vc_password: ''
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        console.log("Unix timestamp: ", timestamp);
        
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const cargarUsuarios = async () => {
        if (mostrarUsuarios) {
            setMostrarUsuarios(false);
            return;
        }

        setCargandoUsuarios(true);
        try {
            const negocioId = parseInt(id || '0');
            if (isNaN(negocioId)) {
                throw new Error('ID del negocio no es válido');
            }
            
            const res = await getUsersByBusiness(negocioId);
            if (res.ok) {
                setUsuarios(res.data);
                setMostrarUsuarios(true);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setCargandoUsuarios(false);
        }
    };

    const resetForm = () => {
        setFormData({
            vc_nombre: '',
            vc_username: '',
            vc_password: ''
        });
        setFormErrors({});
        setIsEmail(true);
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.vc_nombre.trim()) {
            errors.vc_nombre = 'El nombre es requerido';
        }

        if (!formData.vc_username.trim()) {
            errors.vc_username = isEmail ? 'El email es requerido' : 'El teléfono es requerido';
        } else {
            if (isEmail && !validateEmail(formData.vc_username)) {
                errors.vc_username = 'El formato del email no es válido';
            } else if (!isEmail && !validateMexicanPhone(formData.vc_username)) {
                errors.vc_username = 'El teléfono debe tener exactamente 10 dígitos';
            }
        }

        if (!formData.vc_password) {
            errors.vc_password = 'Debe generar una contraseña';
        }

        return errors;
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            const negocioId = parseInt(id || '0');
            const newUser: Usuario = {
                id_usuario: 0,
                vc_nombre: formData.vc_nombre,
                vc_username: formData.vc_username,
                vc_password: formData.vc_password,
                id_negocio: negocioId,
                i_rol: 2
            };

            const res = await registerUserByBuisness(newUser);
            if (res.ok) {
                setModalOpen(false);
                resetForm();
                cargarUsuarios();
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            setFormErrors({ general: 'Error al crear el usuario. Intente nuevamente.' });
        } finally {
            setIsSubmitting(false);
        }
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
                            variant="secondary"
                            onClick={cargarUsuarios}
                            disabled={cargandoUsuarios}
                        >
                            {cargandoUsuarios 
                                ? 'Cargando...' 
                                : mostrarUsuarios 
                                    ? 'Ocultar Usuarios' 
                                    : 'Ver Usuarios'
                            }
                        </Button>
                        {/* <Button 
                            variant="outline" 
                            onClick={() => navigate('/negocios')}
                        >
                            Editar Negocio
                        </Button> */}
                        
                        {/* <Button 
                            variant="secondary"
                            onClick={() => {
                                // Aquí se puede agregar funcionalidad adicional como ver productos, empleados, etc.
                                console.log('Ver más detalles del negocio:', negocio.id_negocio);
                            }}
                        >
                            Ver Productos
                        </Button> */}
                    </div>

                    <div>
                        {/* Mostrar la seccion seleccionada */}
                    </div>
                </CardContent>
            </Card>

            {/* Sección de Usuarios */}
            {mostrarUsuarios && (
                <Card>
                    <CardHeader>
                        <CardTitle>Usuarios del Negocio: {negocio.vc_nombre}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Lista de Usuarios</h3>
                            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                                <DialogTrigger asChild>
                                    <Button>Crear Usuario</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmitUser} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombre Completo</Label>
                                            <Input
                                                id="nombre"
                                                value={formData.vc_nombre}
                                                onChange={(e) => setFormData({...formData, vc_nombre: e.target.value})}
                                                placeholder="Ingrese el nombre completo"
                                            />
                                            {formErrors.vc_nombre && (
                                                <p className="text-sm text-red-600">{formErrors.vc_nombre}</p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="isEmail"
                                                    checked={isEmail}
                                                    onCheckedChange={(checked) => {
                                                        setIsEmail(checked as boolean);
                                                        setFormData({...formData, vc_username: ''});
                                                        setFormErrors({...formErrors, vc_username: ''});
                                                    }}
                                                />
                                                <Label htmlFor="isEmail">Usar Email como username</Label>
                                            </div>
                                            <Label htmlFor="username">
                                                {isEmail ? 'Email' : 'Teléfono (10 dígitos)'}
                                            </Label>
                                            <Input
                                                id="username"
                                                type={isEmail ? 'email' : 'tel'}
                                                value={formData.vc_username}
                                                onChange={(e) => setFormData({...formData, vc_username: e.target.value})}
                                                placeholder={isEmail ? 'ejemplo@correo.com' : '1234567890'}
                                            />
                                            {formErrors.vc_username && (
                                                <p className="text-sm text-red-600">{formErrors.vc_username}</p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Contraseña (generada automáticamente)</Label>
                                            <div className="flex space-x-2">
                                                <Input
                                                    id="password"
                                                    value={formData.vc_password}
                                                    readOnly
                                                    placeholder="Click en generar para crear contraseña"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setFormData({...formData, vc_password: generatePassword()})}
                                                >
                                                    Generar
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setModalOpen(false);
                                                    resetForm();
                                                }}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting}>
                                                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                                            </Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        
                        {usuarios.length === 0 ? (
                            <p className="text-muted-foreground">No hay usuarios registrados para este negocio.</p>
                        ) : (
                            <div className="space-y-4">
                                {usuarios.map((usuario, index) => (
                                    <div key={usuario.id_usuario || index} className="border rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                                <p className="text-base">{usuario.vc_nombre || 'No disponible'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                                <p className="text-base">{usuario.vc_username || 'No disponible'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                                <p className="text-base">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        usuario.b_activo !== false
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {usuario.b_activo !== false ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

        </div>
    );
};

export default NegocioDetalle;