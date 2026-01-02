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
import { PreguntasNegocioTable } from "../components/ui/preguntas-negocio-table";
import { StatusBadge } from "../components/ui/status-badge";
import { LoadingButton } from "../components/ui/loading-button";
import { type Negocio, getNegocioById } from "../Fetch/negocios";
import { getUsersByBusiness, Usuario, registerUserInClient } from "../Fetch/usuarios";
import { PreguntaNegocio, getPreguntasByNegocio } from "../Fetch/preguntas"
import { generatePassword, validateEmail, validateMexicanPhone } from "../utils/passwordGenerator";

import { UsersIcon, UserCheck2, FileQuestion, Edit2Icon } from "lucide-react";

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

    const [mostrarPreguntas, setMostrarPreguntas] = useState(false);
    const [preguntas, setPreguntas] = useState<PreguntaNegocio[]>([]);
    const [cargandoPreguntas, setCargandoPreguntas] = useState(false);

    
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

    const cargarPreguntas = async () => {
        if(mostrarPreguntas){
            setMostrarPreguntas(false);
            return;
        }

        setCargandoPreguntas(true);
        try {
            const negocioId = parseInt(id || '0');

            if (isNaN(negocioId)) {
                throw new Error('ID del negocio no es válido');
            }

            const res = await getPreguntasByNegocio(negocioId);
            if (res.ok) {
                setPreguntas(res.data || []);
                setMostrarPreguntas;
            }
        } catch (error) {
            console.error('NegocioDetalle.tsx - cargarPreguntas: ', error);
        } finally {
            setCargandoPreguntas(false);
        }
    }

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

            const res = await registerUserInClient({
                name: newUser.vc_nombre,
                lastname: '',
                email: newUser.vc_username,
                id_user_creator: 1,
                id_client: negocioId
            });
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
        <DialogContent className="sm:max-w-[500px] bg-card">
            <DialogHeader>
                <DialogTitle className="text-primary text-xl flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    Crear Nuevo Usuario
                </DialogTitle>
                <p className="text-sm text-secondary mt-2">
                    Registrar un nuevo usuario para el negocio: <span className="font-semibold">{negocio?.vc_nombre}</span>
                </p>
            </DialogHeader>
            <form onSubmit={handleSubmitUser} className="space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-accent rounded-full"></div>
                        <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-primary flex items-center gap-1">
                            Nombre Completo
                            <span className="text-error">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            value={formData.vc_nombre}
                            onChange={(e) => setFormData({...formData, vc_nombre: e.target.value})}
                            placeholder="Ej: Juan Pérez García"
                            className={`custom-input ${formErrors.vc_nombre ? 'error-input' : ''}`}
                        />
                        {formErrors.vc_nombre && (
                            <p className="error-text">{formErrors.vc_nombre}</p>
                        )}
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-accent rounded-full"></div>
                        <h3 className="text-lg font-semibold text-primary">Credenciales de Acceso</h3>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
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
                                <Label htmlFor="isEmail" className="text-primary font-medium">
                                    Usar Email como nombre de usuario
                                </Label>
                            </div>
                            <p className="text-xs text-secondary mt-1 ml-6">
                                {isEmail ? 'Se usará el email para iniciar sesión' : 'Se usará el teléfono para iniciar sesión'}
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-primary flex items-center gap-1">
                                {isEmail ? '<Mail /> Correo Electrónico' : '📱 Teléfono'}
                                <span className="text-error">*</span>
                            </Label>
                            <Input
                                id="username"
                                type={isEmail ? 'email' : 'tel'}
                                value={formData.vc_username}
                                onChange={(e) => setFormData({...formData, vc_username: e.target.value})}
                                placeholder={isEmail ? 'ejemplo@correo.com' : '5512345678'}
                                className={`custom-input ${formErrors.vc_username ? 'error-input' : ''}`}
                            />
                            {formErrors.vc_username && (
                                <p className="error-text">{formErrors.vc_username}</p>
                            )}
                            {!isEmail && (
                                <p className="text-xs text-secondary">
                                    Ingresa 10 dígitos sin espacios ni guiones
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-accent rounded-full"></div>
                        <h3 className="text-lg font-semibold text-primary">Contraseña</h3>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-primary">🔐 Contraseña Generada</Label>
                        <div className="space-y-3">
                            <div className="flex space-x-2">
                                <Input
                                    id="password"
                                    value={formData.vc_password}
                                    readOnly
                                    placeholder="Haz clic en 'Generar' para crear una contraseña segura"
                                    className="custom-input font-mono"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData({...formData, vc_password: generatePassword()})}
                                    className="btn-outline px-4"
                                >
                                    🎲 Generar
                                </Button>
                            </div>
                            {formData.vc_password && (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                                    <p className="text-sm text-green-700 font-medium">✅ Contraseña generada correctamente</p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Asegúrate de comunicar esta contraseña al usuario de forma segura.
                                    </p>
                                </div>
                            )}
                            {formErrors.vc_password && (
                                <p className="error-text">{formErrors.vc_password}</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {formErrors.general && (
                    <div className="bg-error bg-opacity-10 border border-error rounded-lg p-3">
                        <p className="error-text text-center">{formErrors.general}</p>
                    </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setModalOpen(false);
                            resetForm();
                        }}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <LoadingButton
                        type="submit"
                        loading={isSubmitting}
                        loadingText="Creando usuario..."
                        className="btn-primary"
                    >
                        👤 Crear Usuario
                    </LoadingButton>
                </div>
            </form>
        </DialogContent>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${negocio.vc_nombre}:`}
                subtitle="Información y gestión completa del cliente"
                breadcrumbs={[
                    { label: "Inicio", onClick: () => navigate('/') },
                    { label: "Clientes", onClick: () => navigate('/negocios') },
                    { label: negocio.vc_nombre }
                ]}
                actions={[
                    {
                        label: "Volver a Clientes",
                        onClick: () => navigate('/negocios'),
                        variant: "outline",
                        icon: <UserCheck2/>
                    }
                ]}
            />

            {/* Resumen del negocio */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="custom-card p-6 text-center">
                    <div className="flex justify-center mb-2">
                        <UserCheck2 size={48} className="text-primary" />
                    </div>
                    <div className="text-lg font-semibold text-primary">{negocio.vc_nombre}</div>
                    <div className="text-sm text-secondary">Nombre del cliente</div>
                </div>
                
                <div className="custom-card p-6 text-center">
                    <div className="text-2xl font-bold text-info mb-2">#{negocio.id_negocio}</div>
                    <div className="text-sm text-secondary">ID del cliente</div>
                </div>
                
                <div className="custom-card p-6 text-center">
                    <div className="mb-2">
                        <StatusBadge status={negocio.b_activo !== false ? 'active' : 'inactive'} />
                    </div>
                    <div className="text-sm text-secondary">Estado Actual</div>
                </div>
                
                <div className="custom-card p-6 text-center">
                    <div className="text-lg font-semibold text-primary mb-2">
                        {usuarios.length || 0}
                    </div>
                    <div className="text-sm text-secondary">Usuarios Registrados</div>
                </div>
            </div>

            <InfoCard
                title="Información Detallada"
                subtitle="Datos de registro y actualización"
                columns={2}
                items={[
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
                title="Gestión del Negocio"
                subtitle="Administra usuarios y configuraciones"
                layout="grid"
                actions={[
                    {
                        label: mostrarUsuarios ? 'Ocultar Usuarios' : 'Ver Usuarios del Negocio',
                        onClick: cargarUsuarios,
                        loading: cargandoUsuarios,
                        variant: mostrarUsuarios ? 'outline' : 'secondary',
                        icon: <UsersIcon/>,
                        loadingText: 'Cargando usuarios...',
                    },
                    {
                        label: 'Preguntas',
                        icon: <FileQuestion />,
                        onClick: cargarPreguntas,
                        loading: cargandoPreguntas,
                        variant: mostrarPreguntas ? 'outline' : 'secondary',
                        loadingText: 'Cargando Preguntas...'
                    }
                ]}
            />

            {/* Sección de Usuarios */}
            {mostrarUsuarios && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl"><UsersIcon/></div>
                            <div>
                                <h2 className="text-xl font-semibold text-primary">
                                    Usuarios de {negocio.vc_nombre}
                                </h2>
                                <p className="text-sm text-secondary">
                                    Gestiona los usuarios registrados en este negocio
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <UserList
                        title=""
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
                                        // TODO: Implementar editar usuario
                                        console.log('Editar usuario:', user.id_usuario);
                                    }}
                                    className="btn-outline text-xs"
                                    title="Editar usuario"
                                >
                                    <Edit2Icon /> Editar
                                </Button>
                            </>
                        )}
                    />
                </div>
            )}

            {/* Sección de preguntas */}
            {mostrarPreguntas && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl"><FileQuestion/></div>
                            <div>
                                <h2 className="text-xl font-semibold text-primary">
                                    Preguntas de {negocio.vc_nombre}
                                </h2>
                                <p className="text-sm text-secondary">
                                    Gestiona las preguntas asignadas a este negocio
                                </p>
                            </div>
                        </div>
                    </div>

                    <PreguntasNegocioTable preguntas={preguntas} loading={cargandoPreguntas} />
                    
                    {/* <UserList
                        title=""
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
                                        // TODO: Implementar editar usuario
                                        console.log('Editar usuario:', user.id_usuario);
                                    }}
                                    className="btn-outline text-xs"
                                    title="Editar usuario"
                                >
                                    <Edit2Icon /> Editar
                                </Button>
                            </>
                        )}
                    /> */}
                </div>
            )}

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                {createUserModal}
            </Dialog>

        </div>
    );
};

export default NegocioDetalle;