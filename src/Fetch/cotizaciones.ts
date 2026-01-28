import api from "../lib/api";

// ============================================
// TIPOS E INTERFACES
// ============================================

/**
 * Estados de una cotización
 */
export type CotizacionStatus =
    | 'draft'       // Borrador - editable
    | 'pending'     // Pendiente de aprobación
    | 'approved'    // Aprobada - lista para generar tickets
    | 'in_progress' // En progreso - tickets generados
    | 'completed'   // Completada
    | 'cancelled';  // Cancelada

export const COTIZACION_STATUS_LABELS: Record<CotizacionStatus, string> = {
    draft: 'Borrador',
    pending: 'Pendiente',
    approved: 'Aprobada',
    in_progress: 'En progreso',
    completed: 'Completada',
    cancelled: 'Cancelada',
};

export const COTIZACION_STATUS_COLORS: Record<CotizacionStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
};

/**
 * Tipos de log para la bitácora
 * 1 = Visible en bitácora (público)
 * 2 = Transaccional/Sistema (oculto)
 */
export type LogType = 1 | 2;

export const LOG_TYPE_LABELS: Record<LogType, string> = {
    1: 'Bitácora',
    2: 'Sistema',
};

/**
 * Interface para un producto en la cotización
 */
export interface CotizacionProducto {
    id_cotizacion_producto: number;
    id_cotizacion: number;
    id_product: number;
    product_name: string;
    product_sku?: string;
    quantity: number;           // Cantidad de productos por servicio
    unit_price: number;
    subtotal: number;
    i_status: boolean;
    dt_register: string;
}

/**
 * Interface para una pregunta en la cotización
 */
export interface CotizacionPregunta {
    id_cotizacion_pregunta: number;
    id_cotizacion: number;
    id_question: number;
    id_question_client?: number;
    question_text: string;
    question_type: string;
    price: number;              // Precio de la pregunta para este servicio
    promoter_earns: number;     // Lo que gana el promotor
    i_status: boolean;
    dt_register: string;
}

/**
 * Interface para un establecimiento en la cotización
 */
export interface CotizacionEstablecimiento {
    id_cotizacion_establecimiento: number;
    id_cotizacion: number;
    id_store_client: number;
    store_name: string;
    store_code?: string;
    address?: string;
    visits_limit?: number;      // Límite de visitas/tickets (null = sin límite)
    tickets_generated: number;  // Tickets ya generados
    tickets_completed: number;  // Tickets completados
    i_status: boolean;
    dt_register: string;
}

/**
 * Interface principal de Cotización
 */
export interface Cotizacion {
    id_cotizacion: number;
    id_client: number;
    id_user_created: number;

    // Información básica
    folio: string;              // Número de cotización (auto-generado)
    name: string;               // Nombre descriptivo de la cotización
    description?: string;

    // Estado y fechas
    status: CotizacionStatus;
    dt_start?: string;          // Fecha inicio del servicio
    dt_end?: string;            // Fecha fin del servicio

    // Totales calculados
    total_establecimientos: number;
    total_preguntas: number;
    total_productos: number;
    subtotal: number;
    tax?: number;
    total: number;

    // Configuración
    products_per_service?: number;  // Cantidad de productos por servicio (columna reservada)
    can_edit_after_tickets: boolean; // Si se puede editar después de generar tickets

    // Auditoría
    dt_register: string;
    dt_updated: string;
    created_by_name?: string;
    created_by_email?: string;

    // Relaciones (opcionales, se cargan en detalle)
    productos?: CotizacionProducto[];
    preguntas?: CotizacionPregunta[];
    establecimientos?: CotizacionEstablecimiento[];

    // Info del cliente
    client_name?: string;
    client_email?: string;
}

/**
 * Interface para logs de cotización (bitácora)
 */
export interface CotizacionLog {
    id_log: number;
    id_cotizacion: number;
    id_user: number;
    user_name?: string;
    user_email?: string;

    action: string;             // Descripción de la acción
    details?: string;           // Detalles adicionales (JSON string)
    i_tipo: LogType;            // 1 = Bitácora (visible), 2 = Transaccional (oculto)

    dt_register: string;
}

/**
 * Payload para crear cotización
 */
export interface CreateCotizacionPayload {
    id_client: number;
    id_user_created: number;
    name: string;
    description?: string;
    dt_start?: string;
    dt_end?: string;
    products_per_service?: number;
    can_edit_after_tickets?: boolean;

    // Arrays de IDs a incluir
    establecimiento_ids?: number[];
    pregunta_ids?: number[];        // IDs de question_client
    producto_ids?: number[];
}

/**
 * Payload para actualizar cotización
 */
export interface UpdateCotizacionPayload {
    name?: string;
    description?: string;
    status?: CotizacionStatus;
    dt_start?: string;
    dt_end?: string;
    products_per_service?: number;
    can_edit_after_tickets?: boolean;

    // Arrays para actualizar relaciones
    establecimiento_ids?: number[];
    pregunta_ids?: number[];
    producto_ids?: number[];
}

/**
 * Payload para agregar/actualizar establecimiento en cotización
 */
export interface CotizacionEstablecimientoPayload {
    id_store_client: number;
    visits_limit?: number;      // null = sin límite
}

/**
 * Payload para crear log
 */
export interface CreateLogPayload {
    action: string;
    details?: string;
    i_tipo?: LogType;           // Default: 1 (bitácora)
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
    ok: boolean;
    data: T | null;
    message: string;
}

/**
 * Estadísticas de cotizaciones
 */
export interface CotizacionStats {
    total: number;
    by_status: Record<CotizacionStatus, number>;
    total_value: number;
    avg_value: number;
}

// ============================================
// MOCK DATA (Temporal hasta tener endpoints)
// ============================================

const MOCK_COTIZACIONES: Cotizacion[] = [
    {
        id_cotizacion: 1,
        id_client: 1,
        id_user_created: 1,
        folio: 'COT-2024-0001',
        name: 'Auditoría Q1 2024 - Tiendas Norte',
        description: 'Revisión de exhibición y precios en tiendas zona norte',
        status: 'approved',
        dt_start: '2024-02-01',
        dt_end: '2024-03-31',
        total_establecimientos: 15,
        total_preguntas: 8,
        total_productos: 25,
        subtotal: 12500.00,
        tax: 2000.00,
        total: 14500.00,
        products_per_service: 5,
        can_edit_after_tickets: false,
        dt_register: '2024-01-15T10:30:00Z',
        dt_updated: '2024-01-20T14:00:00Z',
        created_by_name: 'Admin Principal',
        client_name: 'Coca-Cola FEMSA',
    },
    {
        id_cotizacion: 2,
        id_client: 1,
        id_user_created: 1,
        folio: 'COT-2024-0002',
        name: 'Verificación de Precios - Competencia',
        description: 'Levantamiento de precios de competencia',
        status: 'in_progress',
        dt_start: '2024-01-15',
        dt_end: '2024-02-28',
        total_establecimientos: 50,
        total_preguntas: 5,
        total_productos: 10,
        subtotal: 25000.00,
        total: 25000.00,
        can_edit_after_tickets: true,
        dt_register: '2024-01-10T08:00:00Z',
        dt_updated: '2024-01-18T16:30:00Z',
        created_by_name: 'Admin Principal',
        client_name: 'Coca-Cola FEMSA',
    },
    {
        id_cotizacion: 3,
        id_client: 2,
        id_user_created: 2,
        folio: 'COT-2024-0003',
        name: 'Campaña Verano 2024',
        description: 'Verificación de material POP y exhibidores',
        status: 'draft',
        total_establecimientos: 30,
        total_preguntas: 12,
        total_productos: 8,
        subtotal: 18000.00,
        total: 18000.00,
        can_edit_after_tickets: false,
        dt_register: '2024-01-22T11:00:00Z',
        dt_updated: '2024-01-22T11:00:00Z',
        created_by_name: 'Usuario Demo',
        client_name: 'PepsiCo México',
    },
    {
        id_cotizacion: 4,
        id_client: 1,
        id_user_created: 1,
        folio: 'COT-2024-0004',
        name: 'Auditoría Anual 2023',
        status: 'completed',
        dt_start: '2023-01-01',
        dt_end: '2023-12-31',
        total_establecimientos: 100,
        total_preguntas: 20,
        total_productos: 50,
        subtotal: 150000.00,
        tax: 24000.00,
        total: 174000.00,
        can_edit_after_tickets: false,
        dt_register: '2023-01-05T09:00:00Z',
        dt_updated: '2024-01-02T10:00:00Z',
        created_by_name: 'Admin Principal',
        client_name: 'Coca-Cola FEMSA',
    },
    {
        id_cotizacion: 5,
        id_client: 2,
        id_user_created: 2,
        folio: 'COT-2024-0005',
        name: 'Proyecto Cancelado',
        status: 'cancelled',
        total_establecimientos: 10,
        total_preguntas: 3,
        total_productos: 5,
        subtotal: 5000.00,
        total: 5000.00,
        can_edit_after_tickets: false,
        dt_register: '2024-01-08T14:00:00Z',
        dt_updated: '2024-01-12T09:00:00Z',
        created_by_name: 'Usuario Demo',
        client_name: 'PepsiCo México',
    },
];

const MOCK_ESTABLECIMIENTOS: CotizacionEstablecimiento[] = [
    {
        id_cotizacion_establecimiento: 1,
        id_cotizacion: 1,
        id_store_client: 1,
        store_name: 'OXXO Reforma 123',
        store_code: 'OXX-001',
        address: 'Av. Reforma 123, CDMX',
        visits_limit: 4,
        tickets_generated: 2,
        tickets_completed: 1,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
    {
        id_cotizacion_establecimiento: 2,
        id_cotizacion: 1,
        id_store_client: 2,
        store_name: 'Walmart Polanco',
        store_code: 'WAL-001',
        address: 'Av. Presidente Masaryk 111, Polanco',
        visits_limit: undefined,  // Sin límite
        tickets_generated: 5,
        tickets_completed: 5,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
    {
        id_cotizacion_establecimiento: 3,
        id_cotizacion: 1,
        id_store_client: 3,
        store_name: 'Soriana Insurgentes',
        store_code: 'SOR-001',
        address: 'Av. Insurgentes Sur 1000, CDMX',
        visits_limit: 2,
        tickets_generated: 2,
        tickets_completed: 0,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
];

const MOCK_PREGUNTAS: CotizacionPregunta[] = [
    {
        id_cotizacion_pregunta: 1,
        id_cotizacion: 1,
        id_question: 1,
        id_question_client: 1,
        question_text: '¿El producto está exhibido correctamente?',
        question_type: 'yes_no',
        price: 5.00,
        promoter_earns: 2.50,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
    {
        id_cotizacion_pregunta: 2,
        id_cotizacion: 1,
        id_question: 2,
        id_question_client: 2,
        question_text: '¿Cuál es el precio del producto?',
        question_type: 'numeric',
        price: 3.00,
        promoter_earns: 1.50,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
    {
        id_cotizacion_pregunta: 3,
        id_cotizacion: 1,
        id_question: 3,
        id_question_client: 3,
        question_text: 'Toma foto del anaquel',
        question_type: 'photo',
        price: 8.00,
        promoter_earns: 4.00,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
];

const MOCK_PRODUCTOS: CotizacionProducto[] = [
    {
        id_cotizacion_producto: 1,
        id_cotizacion: 1,
        id_product: 1,
        product_name: 'Coca-Cola 600ml',
        product_sku: 'CC-600',
        quantity: 1,
        unit_price: 18.00,
        subtotal: 18.00,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
    {
        id_cotizacion_producto: 2,
        id_cotizacion: 1,
        id_product: 2,
        product_name: 'Coca-Cola 2L',
        product_sku: 'CC-2L',
        quantity: 1,
        unit_price: 32.00,
        subtotal: 32.00,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
    {
        id_cotizacion_producto: 3,
        id_cotizacion: 1,
        id_product: 3,
        product_name: 'Sprite 600ml',
        product_sku: 'SP-600',
        quantity: 1,
        unit_price: 18.00,
        subtotal: 18.00,
        i_status: true,
        dt_register: '2024-01-15T10:30:00Z',
    },
];

const MOCK_LOGS: CotizacionLog[] = [
    {
        id_log: 1,
        id_cotizacion: 1,
        id_user: 1,
        user_name: 'Admin Principal',
        action: 'Cotización creada',
        i_tipo: 1,
        dt_register: '2024-01-15T10:30:00Z',
    },
    {
        id_log: 2,
        id_cotizacion: 1,
        id_user: 1,
        user_name: 'Admin Principal',
        action: 'Se agregaron 15 establecimientos',
        i_tipo: 1,
        dt_register: '2024-01-15T10:35:00Z',
    },
    {
        id_log: 3,
        id_cotizacion: 1,
        id_user: 1,
        user_name: 'Admin Principal',
        action: 'Cotización enviada para aprobación',
        i_tipo: 1,
        dt_register: '2024-01-18T09:00:00Z',
    },
    {
        id_log: 4,
        id_cotizacion: 1,
        id_user: 2,
        user_name: 'Super Admin',
        action: 'Cotización aprobada',
        i_tipo: 1,
        dt_register: '2024-01-20T14:00:00Z',
    },
    {
        id_log: 5,
        id_cotizacion: 1,
        id_user: 0,
        user_name: 'Sistema',
        action: 'Cálculo automático de totales',
        details: JSON.stringify({ subtotal: 12500, tax: 2000, total: 14500 }),
        i_tipo: 2,  // Transaccional - oculto en bitácora
        dt_register: '2024-01-15T10:31:00Z',
    },
];

// Flag para usar mock data
const USE_MOCK = false;

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Simula delay de red para mock data
 */
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// SUPERADMIN - CRUD DE COTIZACIONES
// ============================================

/**
 * Obtener todas las cotizaciones (SuperAdmin)
 */
export async function getCotizaciones(): Promise<ApiResponse<Cotizacion[]>> {
    if (USE_MOCK) {
        await mockDelay();
        return { ok: true, data: MOCK_COTIZACIONES, message: 'OK' };
    }
    return api.get<ApiResponse<Cotizacion[]>>('/superadmin/cotizaciones');
}

/**
 * Obtener cotización por ID con todas sus relaciones
 */
export async function getCotizacionById(id_cotizacion: number): Promise<ApiResponse<Cotizacion>> {
    if (USE_MOCK) {
        await mockDelay();
        const cotizacion = MOCK_COTIZACIONES.find(c => c.id_cotizacion === id_cotizacion);
        if (!cotizacion) {
            return { ok: false, data: null, message: 'Cotización no encontrada' };
        }
        // Agregar relaciones
        const fullCotizacion: Cotizacion = {
            ...cotizacion,
            establecimientos: MOCK_ESTABLECIMIENTOS.filter(e => e.id_cotizacion === id_cotizacion),
            preguntas: MOCK_PREGUNTAS.filter(p => p.id_cotizacion === id_cotizacion),
            productos: MOCK_PRODUCTOS.filter(p => p.id_cotizacion === id_cotizacion),
        };
        return { ok: true, data: fullCotizacion, message: 'OK' };
    }
    return api.get<ApiResponse<Cotizacion>>(`/superadmin/cotizaciones/${id_cotizacion}`);
}

/**
 * Crear nueva cotización
 */
export async function createCotizacion(payload: CreateCotizacionPayload): Promise<ApiResponse<Cotizacion>> {
    if (USE_MOCK) {
        await mockDelay(800);
        const newId = Math.max(...MOCK_COTIZACIONES.map(c => c.id_cotizacion)) + 1;
        const newFolio = `COT-2024-${String(newId).padStart(4, '0')}`;
        const newCotizacion: Cotizacion = {
            id_cotizacion: newId,
            id_client: payload.id_client,
            id_user_created: payload.id_user_created,
            folio: newFolio,
            name: payload.name,
            description: payload.description,
            status: 'draft',
            dt_start: payload.dt_start,
            dt_end: payload.dt_end,
            total_establecimientos: payload.establecimiento_ids?.length || 0,
            total_preguntas: payload.pregunta_ids?.length || 0,
            total_productos: payload.producto_ids?.length || 0,
            subtotal: 0,
            total: 0,
            products_per_service: payload.products_per_service,
            can_edit_after_tickets: payload.can_edit_after_tickets ?? false,
            dt_register: new Date().toISOString(),
            dt_updated: new Date().toISOString(),
        };
        MOCK_COTIZACIONES.push(newCotizacion);
        return { ok: true, data: newCotizacion, message: 'Cotización creada exitosamente' };
    }
    return api.post<ApiResponse<Cotizacion>>('/superadmin/cotizaciones', payload);
}

/**
 * Actualizar cotización
 */
export async function updateCotizacion(
    id_cotizacion: number,
    payload: UpdateCotizacionPayload
): Promise<ApiResponse<Cotizacion>> {
    if (USE_MOCK) {
        await mockDelay(600);
        const index = MOCK_COTIZACIONES.findIndex(c => c.id_cotizacion === id_cotizacion);
        if (index === -1) {
            return { ok: false, data: null, message: 'Cotización no encontrada' };
        }
        MOCK_COTIZACIONES[index] = {
            ...MOCK_COTIZACIONES[index],
            ...payload,
            dt_updated: new Date().toISOString(),
        };
        return { ok: true, data: MOCK_COTIZACIONES[index], message: 'Cotización actualizada' };
    }
    return api.put<ApiResponse<Cotizacion>>(`/superadmin/cotizaciones/${id_cotizacion}`, payload);
}

/**
 * Eliminar cotización (solo en draft)
 */
export async function deleteCotizacion(id_cotizacion: number): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(400);
        const index = MOCK_COTIZACIONES.findIndex(c => c.id_cotizacion === id_cotizacion);
        if (index === -1) {
            return { ok: false, data: null, message: 'Cotización no encontrada' };
        }
        if (MOCK_COTIZACIONES[index].status !== 'draft') {
            return { ok: false, data: null, message: 'Solo se pueden eliminar cotizaciones en borrador' };
        }
        MOCK_COTIZACIONES.splice(index, 1);
        return { ok: true, data: null, message: 'Cotización eliminada' };
    }
    return api.delete<ApiResponse<null>>(`/superadmin/cotizaciones/${id_cotizacion}`);
}

/**
 * Cambiar estado de cotización
 */
export async function updateCotizacionStatus(
    id_cotizacion: number,
    status: CotizacionStatus
): Promise<ApiResponse<Cotizacion>> {
    if (USE_MOCK) {
        await mockDelay(400);
        const index = MOCK_COTIZACIONES.findIndex(c => c.id_cotizacion === id_cotizacion);
        if (index === -1) {
            return { ok: false, data: null, message: 'Cotización no encontrada' };
        }
        MOCK_COTIZACIONES[index].status = status;
        MOCK_COTIZACIONES[index].dt_updated = new Date().toISOString();
        return { ok: true, data: MOCK_COTIZACIONES[index], message: 'Estado actualizado' };
    }
    return api.put<ApiResponse<Cotizacion>>(`/superadmin/cotizaciones/${id_cotizacion}/status`, { status });
}

// ============================================
// SUPERADMIN - ESTABLECIMIENTOS EN COTIZACIÓN
// ============================================

/**
 * Obtener establecimientos de una cotización
 */
export async function getCotizacionEstablecimientos(
    id_cotizacion: number
): Promise<ApiResponse<CotizacionEstablecimiento[]>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const establecimientos = MOCK_ESTABLECIMIENTOS.filter(e => e.id_cotizacion === id_cotizacion);
        return { ok: true, data: establecimientos, message: 'OK' };
    }
    return api.get<ApiResponse<CotizacionEstablecimiento[]>>(
        `/superadmin/cotizaciones/${id_cotizacion}/establecimientos`
    );
}

/**
 * Agregar establecimiento a cotización
 */
export async function addEstablecimientoToCotizacion(
    id_cotizacion: number,
    payload: CotizacionEstablecimientoPayload
): Promise<ApiResponse<CotizacionEstablecimiento>> {
    if (USE_MOCK) {
        await mockDelay(400);
        const newEstablecimiento: CotizacionEstablecimiento = {
            id_cotizacion_establecimiento: Date.now(),
            id_cotizacion,
            id_store_client: payload.id_store_client,
            store_name: `Tienda ${payload.id_store_client}`,
            visits_limit: payload.visits_limit,
            tickets_generated: 0,
            tickets_completed: 0,
            i_status: true,
            dt_register: new Date().toISOString(),
        };
        MOCK_ESTABLECIMIENTOS.push(newEstablecimiento);
        return { ok: true, data: newEstablecimiento, message: 'Establecimiento agregado' };
    }
    return api.post<ApiResponse<CotizacionEstablecimiento>>(
        `/superadmin/cotizaciones/${id_cotizacion}/establecimientos`,
        payload
    );
}

/**
 * Actualizar límite de visitas de establecimiento
 */
export async function updateEstablecimientoLimit(
    id_cotizacion_establecimiento: number,
    visits_limit?: number
): Promise<ApiResponse<CotizacionEstablecimiento>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const index = MOCK_ESTABLECIMIENTOS.findIndex(
            e => e.id_cotizacion_establecimiento === id_cotizacion_establecimiento
        );
        if (index === -1) {
            return { ok: false, data: null, message: 'Establecimiento no encontrado' };
        }
        MOCK_ESTABLECIMIENTOS[index].visits_limit = visits_limit;
        return { ok: true, data: MOCK_ESTABLECIMIENTOS[index], message: 'Límite actualizado' };
    }
    return api.put<ApiResponse<CotizacionEstablecimiento>>(
        `/superadmin/cotizaciones/establecimientos/${id_cotizacion_establecimiento}`,
        { visits_limit }
    );
}

/**
 * Remover establecimiento de cotización
 */
export async function removeEstablecimientoFromCotizacion(
    id_cotizacion_establecimiento: number
): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const index = MOCK_ESTABLECIMIENTOS.findIndex(
            e => e.id_cotizacion_establecimiento === id_cotizacion_establecimiento
        );
        if (index !== -1) {
            MOCK_ESTABLECIMIENTOS.splice(index, 1);
        }
        return { ok: true, data: null, message: 'Establecimiento removido' };
    }
    return api.delete<ApiResponse<null>>(
        `/superadmin/cotizaciones/establecimientos/${id_cotizacion_establecimiento}`
    );
}

// ============================================
// SUPERADMIN - PREGUNTAS EN COTIZACIÓN
// ============================================

/**
 * Obtener preguntas de una cotización
 */
export async function getCotizacionPreguntas(
    id_cotizacion: number
): Promise<ApiResponse<CotizacionPregunta[]>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const preguntas = MOCK_PREGUNTAS.filter(p => p.id_cotizacion === id_cotizacion);
        return { ok: true, data: preguntas, message: 'OK' };
    }
    return api.get<ApiResponse<CotizacionPregunta[]>>(
        `/superadmin/cotizaciones/${id_cotizacion}/preguntas`
    );
}

/**
 * Agregar pregunta a cotización
 */
export async function addPreguntaToCotizacion(
    id_cotizacion: number,
    id_question_client: number
): Promise<ApiResponse<CotizacionPregunta>> {
    if (USE_MOCK) {
        await mockDelay(400);
        const newPregunta: CotizacionPregunta = {
            id_cotizacion_pregunta: Date.now(),
            id_cotizacion,
            id_question: id_question_client,
            id_question_client,
            question_text: `Pregunta ${id_question_client}`,
            question_type: 'open',
            price: 5.00,
            promoter_earns: 2.50,
            i_status: true,
            dt_register: new Date().toISOString(),
        };
        MOCK_PREGUNTAS.push(newPregunta);
        return { ok: true, data: newPregunta, message: 'Pregunta agregada' };
    }
    return api.post<ApiResponse<CotizacionPregunta>>(
        `/superadmin/cotizaciones/${id_cotizacion}/preguntas`,
        { id_question_client }
    );
}

/**
 * Remover pregunta de cotización
 */
export async function removePreguntaFromCotizacion(
    id_cotizacion_pregunta: number
): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const index = MOCK_PREGUNTAS.findIndex(
            p => p.id_cotizacion_pregunta === id_cotizacion_pregunta
        );
        if (index !== -1) {
            MOCK_PREGUNTAS.splice(index, 1);
        }
        return { ok: true, data: null, message: 'Pregunta removida' };
    }
    return api.delete<ApiResponse<null>>(
        `/superadmin/cotizaciones/preguntas/${id_cotizacion_pregunta}`
    );
}

// ============================================
// SUPERADMIN - PRODUCTOS EN COTIZACIÓN
// ============================================

/**
 * Obtener productos de una cotización
 */
export async function getCotizacionProductos(
    id_cotizacion: number
): Promise<ApiResponse<CotizacionProducto[]>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const productos = MOCK_PRODUCTOS.filter(p => p.id_cotizacion === id_cotizacion);
        return { ok: true, data: productos, message: 'OK' };
    }
    return api.get<ApiResponse<CotizacionProducto[]>>(
        `/superadmin/cotizaciones/${id_cotizacion}/productos`
    );
}

/**
 * Agregar producto a cotización
 */
export async function addProductoToCotizacion(
    id_cotizacion: number,
    id_product: number,
    quantity: number = 1
): Promise<ApiResponse<CotizacionProducto>> {
    if (USE_MOCK) {
        await mockDelay(400);
        const newProducto: CotizacionProducto = {
            id_cotizacion_producto: Date.now(),
            id_cotizacion,
            id_product,
            product_name: `Producto ${id_product}`,
            quantity,
            unit_price: 10.00,
            subtotal: quantity * 10.00,
            i_status: true,
            dt_register: new Date().toISOString(),
        };
        MOCK_PRODUCTOS.push(newProducto);
        return { ok: true, data: newProducto, message: 'Producto agregado' };
    }
    return api.post<ApiResponse<CotizacionProducto>>(
        `/superadmin/cotizaciones/${id_cotizacion}/productos`,
        { id_product, quantity }
    );
}

/**
 * Remover producto de cotización
 */
export async function removeProductoFromCotizacion(
    id_cotizacion_producto: number
): Promise<ApiResponse<null>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const index = MOCK_PRODUCTOS.findIndex(
            p => p.id_cotizacion_producto === id_cotizacion_producto
        );
        if (index !== -1) {
            MOCK_PRODUCTOS.splice(index, 1);
        }
        return { ok: true, data: null, message: 'Producto removido' };
    }
    return api.delete<ApiResponse<null>>(
        `/superadmin/cotizaciones/productos/${id_cotizacion_producto}`
    );
}

// ============================================
// SUPERADMIN - LOGS / BITÁCORA
// ============================================

/**
 * Obtener logs de cotización (solo bitácora visible, i_tipo = 1)
 */
export async function getCotizacionLogs(
    id_cotizacion: number,
    includeSystem: boolean = false
): Promise<ApiResponse<CotizacionLog[]>> {
    if (USE_MOCK) {
        await mockDelay(300);
        let logs = MOCK_LOGS.filter(l => l.id_cotizacion === id_cotizacion);
        if (!includeSystem) {
            logs = logs.filter(l => l.i_tipo === 1);
        }
        // Ordenar por fecha descendente
        logs.sort((a, b) => new Date(b.dt_register).getTime() - new Date(a.dt_register).getTime());
        return { ok: true, data: logs, message: 'OK' };
    }
    const endpoint = includeSystem
        ? `/superadmin/cotizaciones/${id_cotizacion}/logs?includeSystem=true`
        : `/superadmin/cotizaciones/${id_cotizacion}/logs`;
    return api.get<ApiResponse<CotizacionLog[]>>(endpoint);
}

/**
 * Agregar log a cotización
 */
export async function addCotizacionLog(
    id_cotizacion: number,
    id_user: number,
    payload: CreateLogPayload
): Promise<ApiResponse<CotizacionLog>> {
    if (USE_MOCK) {
        await mockDelay(200);
        const newLog: CotizacionLog = {
            id_log: Date.now(),
            id_cotizacion,
            id_user,
            user_name: 'Usuario Mock',
            action: payload.action,
            details: payload.details,
            i_tipo: payload.i_tipo || 1,
            dt_register: new Date().toISOString(),
        };
        MOCK_LOGS.push(newLog);
        return { ok: true, data: newLog, message: 'Log agregado' };
    }
    return api.post<ApiResponse<CotizacionLog>>(
        `/superadmin/cotizaciones/${id_cotizacion}/logs`,
        { id_user, ...payload }
    );
}

// ============================================
// ADMIN - SOLO LECTURA
// ============================================

/**
 * Obtener cotizaciones del cliente del admin
 */
export async function getCotizacionesForClient(
    id_client: number
): Promise<ApiResponse<Cotizacion[]>> {
    if (USE_MOCK) {
        await mockDelay();
        const cotizaciones = MOCK_COTIZACIONES.filter(c => c.id_client === id_client);
        return { ok: true, data: cotizaciones, message: 'OK' };
    }
    return api.get<ApiResponse<Cotizacion[]>>(`/admin/cotizaciones/${id_client}`);
}

/**
 * Obtener detalle de cotización (Admin)
 */
export async function getCotizacionByIdForClient(
    id_client: number,
    id_cotizacion: number
): Promise<ApiResponse<Cotizacion>> {
    if (USE_MOCK) {
        await mockDelay();
        const cotizacion = MOCK_COTIZACIONES.find(
            c => c.id_cotizacion === id_cotizacion && c.id_client === id_client
        );
        if (!cotizacion) {
            return { ok: false, data: null, message: 'Cotización no encontrada' };
        }
        const fullCotizacion: Cotizacion = {
            ...cotizacion,
            establecimientos: MOCK_ESTABLECIMIENTOS.filter(e => e.id_cotizacion === id_cotizacion),
            preguntas: MOCK_PREGUNTAS.filter(p => p.id_cotizacion === id_cotizacion),
            productos: MOCK_PRODUCTOS.filter(p => p.id_cotizacion === id_cotizacion),
        };
        return { ok: true, data: fullCotizacion, message: 'OK' };
    }
    return api.get<ApiResponse<Cotizacion>>(`/admin/cotizaciones/${id_client}/${id_cotizacion}`);
}

/**
 * Obtener logs de cotización (Admin - solo bitácora visible)
 */
export async function getCotizacionLogsForClient(
    id_client: number,
    id_cotizacion: number
): Promise<ApiResponse<CotizacionLog[]>> {
    if (USE_MOCK) {
        await mockDelay(300);
        // Admin solo ve logs de bitácora (i_tipo = 1)
        const logs = MOCK_LOGS
            .filter(l => l.id_cotizacion === id_cotizacion && l.i_tipo === 1)
            .sort((a, b) => new Date(b.dt_register).getTime() - new Date(a.dt_register).getTime());
        return { ok: true, data: logs, message: 'OK' };
    }
    return api.get<ApiResponse<CotizacionLog[]>>(`/admin/cotizaciones/${id_client}/${id_cotizacion}/logs`);
}

/**
 * Obtener estadísticas de cotizaciones del cliente
 */
export async function getCotizacionStats(id_client: number): Promise<ApiResponse<CotizacionStats>> {
    if (USE_MOCK) {
        await mockDelay(300);
        const cotizaciones = MOCK_COTIZACIONES.filter(c => c.id_client === id_client);
        const stats: CotizacionStats = {
            total: cotizaciones.length,
            by_status: {
                draft: cotizaciones.filter(c => c.status === 'draft').length,
                pending: cotizaciones.filter(c => c.status === 'pending').length,
                approved: cotizaciones.filter(c => c.status === 'approved').length,
                in_progress: cotizaciones.filter(c => c.status === 'in_progress').length,
                completed: cotizaciones.filter(c => c.status === 'completed').length,
                cancelled: cotizaciones.filter(c => c.status === 'cancelled').length,
            },
            total_value: cotizaciones.reduce((sum, c) => sum + c.total, 0),
            avg_value: cotizaciones.length > 0
                ? cotizaciones.reduce((sum, c) => sum + c.total, 0) / cotizaciones.length
                : 0,
        };
        return { ok: true, data: stats, message: 'OK' };
    }
    return api.get<ApiResponse<CotizacionStats>>(`/admin/cotizaciones/${id_client}/stats`);
}

// ============================================
// BÚSQUEDA
// ============================================

/**
 * Buscar cotizaciones (SuperAdmin)
 */
export async function searchCotizaciones(
    search: string,
    status?: CotizacionStatus
): Promise<ApiResponse<Cotizacion[]>> {
    if (USE_MOCK) {
        await mockDelay(300);
        let results = MOCK_COTIZACIONES.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.folio.toLowerCase().includes(search.toLowerCase()) ||
            c.client_name?.toLowerCase().includes(search.toLowerCase())
        );
        if (status) {
            results = results.filter(c => c.status === status);
        }
        return { ok: true, data: results, message: 'OK' };
    }
    return api.post<ApiResponse<Cotizacion[]>>('/superadmin/cotizaciones/search', { search, status });
}

/**
 * Buscar cotizaciones del cliente (Admin)
 */
export async function searchCotizacionesForClient(
    id_client: number,
    search: string,
    status?: CotizacionStatus
): Promise<ApiResponse<Cotizacion[]>> {
    if (USE_MOCK) {
        await mockDelay(300);
        let results = MOCK_COTIZACIONES.filter(c =>
            c.id_client === id_client &&
            (c.name.toLowerCase().includes(search.toLowerCase()) ||
             c.folio.toLowerCase().includes(search.toLowerCase()))
        );
        if (status) {
            results = results.filter(c => c.status === status);
        }
        return { ok: true, data: results, message: 'OK' };
    }
    return api.post<ApiResponse<Cotizacion[]>>(
        `/admin/cotizaciones/${id_client}/search`,
        { search, status }
    );
}
