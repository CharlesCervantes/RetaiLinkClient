import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { PageHeader } from "../components/ui/page-header";
import { InfoCard } from "../components/ui/info-card";
import { ActionCard } from "../components/ui/action-card";
import { UserList } from "../components/ui/user-list";
import { StatusBadge } from "../components/ui/status-badge";
import { LoadingButton } from "../components/ui/loading-button";
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
            <div className="space-y-6">
                <PageHeader
                    title="Detalle del Negocio"
                    loading={true}
                    actions={[
                        {
                            label: "Volver a Negocios",
                            onClick: () => navigate('/negocios'),
                            variant: "outline"
                        }
                    ]}
                />
                <InfoCard
                    title="Información del Negocio"
                    items={[]}
                    loading={true}
                />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Detalle del Negocio"
                    actions={[
                        {
                            label: "Volver a Negocios",
                            onClick: () => navigate('/negocios'),
                            variant: "outline"
                        }
                    ]}
                />
                <InfoCard
                    title="Error"
                    items={[
                        {
                            label: "Mensaje",
                            value: <span className="text-error">{error}</span>
                        }
                    ]}
                />
            </div>
        );
    }

    if (!negocio) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Detalle del Negocio"
                    actions={[
                        {
                            label: "Volver a Negocios",
                            onClick: () => navigate('/negocios'),
                            variant: "outline"
                        }
                    ]}
                />
                <InfoCard
                    title="No encontrado"
                    items={[
                        {
                            label: "Estado",
                            value: "No se encontraron datos del negocio."
                        }
                    ]}
                />
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

    const createUserModal = (
        <DialogContent className="sm:max-w-[425px] bg-card">
            <DialogHeader>
                <DialogTitle className="text-primary">Crear Nuevo Usuario</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitUser} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-primary">Nombre Completo</Label>
                    <Input
                        id="nombre"
                        value={formData.vc_nombre}
                        onChange={(e) => setFormData({...formData, vc_nombre: e.target.value})}
                        placeholder="Ingrese el nombre completo"
                        className={`custom-input ${formErrors.vc_nombre ? 'error-input' : ''}`}
                    />
                    {formErrors.vc_nombre && (
                        <p className="error-text">{formErrors.vc_nombre}</p>
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
                        <Label htmlFor="isEmail" className="text-primary">Usar Email como username</Label>
                    </div>
                    <Label htmlFor="username" className="text-primary">
                        {isEmail ? 'Email' : 'Teléfono (10 dígitos)'}
                    </Label>
                    <Input
                        id="username"
                        type={isEmail ? 'email' : 'tel'}
                        value={formData.vc_username}
                        onChange={(e) => setFormData({...formData, vc_username: e.target.value})}
                        placeholder={isEmail ? 'ejemplo@correo.com' : '1234567890'}
                        className={`custom-input ${formErrors.vc_username ? 'error-input' : ''}`}
                    />
                    {formErrors.vc_username && (
                        <p className="error-text">{formErrors.vc_username}</p>
                    )}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-primary">Contraseña (generada automáticamente)</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="password"
                            value={formData.vc_password}
                            readOnly
                            placeholder="Click en generar para crear contraseña"
                            className="custom-input"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData({...formData, vc_password: generatePassword()})}
                            className="btn-outline"
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
                        className="btn-secondary"
                    >
                        Cancelar
                    </Button>
                    <LoadingButton
                        type="submit"
                        loading={isSubmitting}
                        loadingText="Creando..."
                        className="btn-primary"
                    >
                        Crear Usuario
                    </LoadingButton>
                </div>
            </form>
        </DialogContent>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Detalle: ${negocio.vc_nombre}`}
                subtitle="Información completa del negocio y gestión de usuarios"
                breadcrumbs={[
                    { label: "Negocios", onClick: () => navigate('/negocios') },
                    { label: negocio.vc_nombre }
                ]}
                actions={[
                    {
                        label: "Volver a Negocios",
                        onClick: () => navigate('/negocios'),
                        variant: "outline",
                        icon: "←"
                    }
                ]}
            />

            <InfoCard
                title="Información del Negocio"
                subtitle="Datos principales y estado actual"
                columns={4}
                items={[
                    {
                        label: "ID del Negocio",
                        value: negocio.id_negocio
                    },
                    {
                        label: "Estado",
                        value: <StatusBadge status={negocio.b_activo !== false ? 'active' : 'inactive'} />
                    },
                    {
                        label: "Fecha de Registro",
                        value: formatDate(negocio.dt_registro)
                    },
                    {
                        label: "Última Actualización",
                        value: formatDate(negocio.dt_actualizacion)
                    }
                ]}
            />

            <ActionCard
                title="Acciones Disponibles"
                subtitle="Gestiona los diferentes aspectos del negocio"
                layout="grid"
                actions={[
                    {
                        label: mostrarUsuarios ? 'Ocultar Usuarios' : 'Ver Usuarios',
                        onClick: cargarUsuarios,
                        loading: cargandoUsuarios,
                        variant: 'secondary',
                        icon: mostrarUsuarios ? "👥" : "👥",
                        loadingText: 'Cargando usuarios...'
                    }
                ]}
            />

            {/* Sección de Usuarios */}
            {mostrarUsuarios && (
                <UserList
                    title={`Usuarios del Negocio: ${negocio.vc_nombre}`}
                    users={usuarios}
                    loading={cargandoUsuarios && !mostrarUsuarios}
                    onCreateUser={() => setModalOpen(true)}
                    creatingUser={isSubmitting}
                    emptyMessage={`No hay usuarios registrados para ${negocio.vc_nombre}.`}
                    createUserModal={createUserModal}
                    renderUserActions={(user) => (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    // Implementar editar usuario
                                    console.log('Editar usuario:', user.id_usuario);
                                }}
                                className="btn-outline text-xs"
                            >
                                Editar
                            </Button>
                        </>
                    )}
                />
            )}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                {createUserModal}
            </Dialog>

        </div>
    );
};

export default NegocioDetalle;