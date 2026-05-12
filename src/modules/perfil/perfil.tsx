import { toast } from "sonner"
import { useEffect, useState } from "react"
import { Pencil, KeyRound, ShieldCheck, Calendar, Mail, Loader2, CheckCircle2, Eye, EyeOff, X, Lock } from "lucide-react"


import { useAuthStore } from "@/stores"
import { getPerfil, updateProfile, updateEmail, changePassword, PerfilUsuario } from "@/Fetch/perfil";
import { Button, Card, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, PageWrapper } from "@/components"


const ROL_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: "Super Admin", color: "bg-purple-100 text-purple-800 border-purple-200" },
  2: { label: "Administrador", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
const initials = (name: string, lastname: string) => `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase();



function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string; }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 p-1.5 bg-gray-100 rounded-md">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-400 font-medium">{label}</span>
        <span className="text-sm text-gray-900 font-medium mt-0.5">{value}</span>
      </div>
    </div>
  );
}



interface EditModalProps {
  open: boolean;
  perfil: PerfilUsuario;
  onClose: () => void;
  onSaved: (name: string, lastname: string, email: string) => void;
}

function ModalEditarPerfil({ open, perfil, onClose, onSaved }: EditModalProps) {
  const [name, setName] = useState(perfil.name);
  const [lastname, setLastname] = useState(perfil.lastname);
  const [email, setEmail] = useState(perfil.email);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open) {
      setName(perfil.name);
      setLastname(perfil.lastname);
      setEmail(perfil.email);
    }
  }, [open, perfil]);

  const handleGuardar = async () => {
    if (!name.trim() || !lastname.trim() || !email.trim()) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    setGuardando(true);
    try {
      const promises: Promise<unknown>[] = [
        updateProfile(perfil.id_user, { name: name.trim(), lastname: lastname.trim() }),
      ];
      if (email.trim() !== perfil.email) {
        promises.push(updateEmail(perfil.id_user, { email: email.trim() }));
      }
      await Promise.all(promises);
      onSaved(name.trim(), lastname.trim(), email.trim());
      toast.success("Perfil actualizado correctamente");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-gray-600" />
            Editar perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-lastname">Apellido</Label>
              <Input
                id="edit-lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Tu apellido"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Correo electrónico</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PwdModalProps {
  open: boolean;
  onClose: () => void;
}

function ModalCambiarPassword({ open, onClose }: PwdModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const handleClose = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    onClose();
  };

  const handleGuardar = async () => {
    if (!current || !next || !confirm) {
      toast.error("Completa todos los campos");
      return;
    }
    if (next.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (next !== confirm) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setGuardando(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      toast.success("Contraseña actualizada correctamente");
      handleClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cambiar la contraseña";
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
  };

  const strength = next.length === 0 ? null : next.length < 6 ? "débil" : next.length < 10 ? "media" : "fuerte";
  const strengthColor = { débil: "bg-red-400", media: "bg-amber-400", fuerte: "bg-green-500" };
  const strengthWidth = { débil: "w-1/3", media: "w-2/3", fuerte: "w-full" };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-gray-600" />
            Cambiar contraseña
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contraseña actual */}
          <div className="space-y-1.5">
            <Label htmlFor="pwd-current">Contraseña actual</Label>
            <div className="relative">
              <Input
                id="pwd-current"
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div className="space-y-1.5">
            <Label htmlFor="pwd-new">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="pwd-new"
                type={showNext ? "text" : "password"}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Barra de fuerza */}
            {strength && (
              <div className="space-y-1 pt-1">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColor[strength]} ${strengthWidth[strength]}`}
                  />
                </div>
                <p className={`text-xs font-medium capitalize ${
                  strength === "débil" ? "text-red-500" : strength === "media" ? "text-amber-500" : "text-green-600"
                }`}>
                  Seguridad: {strength}
                </p>
              </div>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-1.5">
            <Label htmlFor="pwd-confirm">Confirmar nueva contraseña</Label>
            <div className="relative">
              <Input
                id="pwd-confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className={confirm && confirm !== next ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {confirm && confirm === next && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {confirm && confirm !== next && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {confirm && confirm !== next && (
              <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="ghost" onClick={handleClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <KeyRound className="w-4 h-4 mr-2" />
            )}
            Actualizar contraseña
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



export function Perfil() {
  const { user, login, token } = useAuthStore();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalEdit, setModalEdit] = useState(false);
  const [modalPwd, setModalPwd] = useState(false);

  useEffect(() => {
    getPerfil()
      .then((res) => { if (res.ok) setPerfil(res.data); })
      .catch(() => {
        // Fallback: usar datos del store si la API falla
        if (user) {
          setPerfil({
            id_user: user.id_user,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            i_rol: user.i_rol,
            i_status: 1,
            dt_register: user.dt_register,
            dt_updated: user.dt_updated,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (name: string, lastname: string, email: string) => {
    if (!perfil) return;
    const updated = { ...perfil, name, lastname, email, dt_updated: new Date().toISOString() };
    setPerfil(updated);
    // Actualizar el store para reflejar el cambio en el sidebar/header
    if (token) login(token, { ...updated });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 mr-2 text-gray-400" />
        <span className="text-gray-400">Cargando perfil...</span>
      </div>
    );

  if (!perfil) return null;

  const rolInfo = ROL_LABEL[perfil.i_rol] ?? { label: `Rol ${perfil.i_rol}`, color: "bg-gray-100 text-gray-700" };
  const isSuperAdmin = perfil.i_rol === 1;

  return (
    <PageWrapper className="max-w-2xl">
        {/* ── Encabezado ── */}
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Mi Perfil</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Visualiza y actualiza tu información personal.</p>
        </div>

        {/* ── Tarjeta principal ── */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-600 relative" />

          {/* Avatar + info */}
          <div className="px-6 pb-6 relative z-10">
            <div className="flex items-end justify-between -mt-10 mb-4">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gray-900 flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">
                  {initials(perfil.name, perfil.lastname)}
                </span>
              </div>

              {/* Botón editar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalEdit(true)}
                className="flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar perfil
              </Button>
            </div>

            {/* Nombre + rol */}
            <div className="space-y-1 mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {perfil.name} {perfil.lastname}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${rolInfo.color}`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {rolInfo.label}
                </span>
                {perfil.i_status === 1 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Activo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    Inactivo
                  </span>
                )}
              </div>
            </div>

            {/* Info rows */}
            <div>
              <InfoRow icon={Mail} label="Correo electrónico" value={perfil.email} />
              <InfoRow
                icon={Calendar}
                label="Miembro desde"
                value={fmtDate(perfil.dt_register)}
              />
              <InfoRow
                icon={Calendar}
                label="Última actualización"
                value={fmtDate(perfil.dt_updated)}
              />
            </div>
          </div>
        </Card>

        {/* ── Seguridad ── */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                <KeyRound className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Contraseña</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Actualiza tu contraseña de acceso a la plataforma.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalPwd(true)}
              className="flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Cambiar
            </Button>
          </div>
        </Card>

        {/* ── Rol (bloqueado, solo lectura) ── */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                <ShieldCheck className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Rol y permisos</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tu rol actual es <span className="font-medium text-gray-600">{rolInfo.label}</span>.
                  {!isSuperAdmin && " Solo un Super Admin puede modificar los roles."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="flex items-center gap-1.5 opacity-50 cursor-not-allowed"
              title="Próximamente disponible"
            >
              <Lock className="w-3.5 h-3.5" />
              Cambiar rol
            </Button>
          </div>
        </Card>

      {/* ── Modales ── */}
      <ModalEditarPerfil
        open={modalEdit}
        perfil={perfil}
        onClose={() => setModalEdit(false)}
        onSaved={handleSaved}
      />

      <ModalCambiarPassword
        open={modalPwd}
        onClose={() => setModalPwd(false)}
      />
    </PageWrapper>
  );
}
