import { api } from "../lib/api";

// ============================================================================
// TYPES
// ============================================================================

export type QuestionType = 'open' | 'options' | 'yes_no' | 'numeric' | 'date' | 'photo';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
    open: 'Texto abierto',
    options: 'Opciones',
    yes_no: 'Sí / No',
    numeric: 'Numérico',
    date: 'Fecha',
    photo: 'Foto',
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface QuestionOption {
    id_option: number;
    id_question: number;
    option_text: string;
    option_value_numeric?: number;
    option_value_text?: string;
    option_order: number;
    i_status: boolean;
}

export interface Question {
    id_question: number;
    id_user: number;
    question: string;
    question_type: QuestionType;
    base_price: number;
    promoter_earns: number;
    i_status: boolean;
    // Type-specific fields
    is_multiple?: boolean;      // For 'options' type
    min_value?: number;         // For 'numeric' type
    max_value?: number;         // For 'numeric' type
    max_photos?: number;        // For 'photo' type
    // Metadata
    dt_register: string;
    dt_updated: string;
    created_by_name?: string;
    created_by_email?: string;
    // Options (loaded separately or included)
    options?: QuestionOption[];
}

export interface QuestionClient {
    id_question_client: number;
    id_question: number;
    id_client: number;
    client_price: number;
    client_promoter_earns: number;
    assignment_status: number;
    assigned_at: string;
    question: string;
    question_type: QuestionType;
    base_price: number;
    promoter_earns: number;
    question_status: number;
    // Type-specific fields
    is_multiple?: boolean;
    min_value?: number;
    max_value?: number;
    max_photos?: number;
    options?: QuestionOption[];
}

export interface ClientAssignment {
    id_question_client: number;
    id_client: number;
    client_price: number;
    client_promoter_earns: number;
    assigned_at: string;
    client_name: string;
}

export interface QuestionStats {
    total_questions: number;
    total_price: number;
    avg_price: number;
    total_promoter_earns: number;
    avg_promoter_earns: number;
}

export interface CreateOptionPayload {
    option_text: string;
    option_value_numeric?: number;
    option_value_text?: string;
    option_order: number;
}

export interface CreateQuestionPayload {
    id_user: number;
    question: string;
    question_type: QuestionType;
    base_price: number;
    promoter_earns: number;
    i_status?: boolean;
    // Type-specific fields
    is_multiple?: boolean;      // For 'options' type
    min_value?: number;         // For 'numeric' type
    max_value?: number;         // For 'numeric' type
    max_photos?: number;        // For 'photo' type
    // Options for 'options' type
    options?: CreateOptionPayload[];
}

export interface UpdateQuestionPayload {
    id_user: number;
    question?: string;
    question_type?: QuestionType;
    base_price?: number;
    promoter_earns?: number;
    i_status?: boolean;
    // Type-specific fields
    is_multiple?: boolean;
    min_value?: number;
    max_value?: number;
    max_photos?: number;
    // Options for 'options' type (replaces all existing options)
    options?: CreateOptionPayload[];
}

export interface AssignQuestionPayload {
    id_user: number;
    client_price?: number;
    client_promoter_earns?: number;
}

export interface ApiResponse<T> {
    ok: boolean;
    data: T | null;
    message: string;
}

// ============================================================================
// SUPERADMIN - CRUD de Preguntas
// ============================================================================

/**
 * Listar todas las preguntas
 */
export const getQuestions = async (): Promise<ApiResponse<Question[]>> => {
    return api.get<ApiResponse<Question[]>>("/superadmin/questions");
};

/**
 * Obtener pregunta por ID
 */
export const getQuestionById = async (id_question: number): Promise<ApiResponse<Question>> => {
    return api.get<ApiResponse<Question>>(`/superadmin/questions/${id_question}`);
};

/**
 * Crear pregunta
 */
export const createQuestion = async (payload: CreateQuestionPayload): Promise<ApiResponse<{ id: number }>> => {
    return api.post<ApiResponse<{ id: number }>>("/superadmin/questions", payload);
};

/**
 * Actualizar pregunta
 */
export const updateQuestion = async (
    id_question: number,
    payload: UpdateQuestionPayload
): Promise<ApiResponse<{ success: boolean }>> => {
    return api.put<ApiResponse<{ success: boolean }>>(`/superadmin/questions/${id_question}`, payload);
};

/**
 * Eliminar pregunta (soft delete)
 */
export const deleteQuestion = async (
    id_question: number,
    _id_user: number
): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<ApiResponse<{ success: boolean }>>(`/superadmin/questions/${id_question}`);
};

// ============================================================================
// SUPERADMIN - Asignación de Preguntas a Clientes
// ============================================================================

/**
 * Asignar pregunta a cliente
 */
export const assignQuestionToClient = async (
    id_question: number,
    id_client: number,
    payload: AssignQuestionPayload
): Promise<ApiResponse<{ id: number }>> => {
    return api.post<ApiResponse<{ id: number }>>(
        `/superadmin/questions/${id_question}/clients/${id_client}`,
        payload
    );
};

/**
 * Desasignar pregunta de cliente
 */
export const unassignQuestionFromClient = async (
    id_question: number,
    id_client: number,
    _id_user: number
): Promise<ApiResponse<null>> => {
    return api.delete<ApiResponse<null>>(
        `/superadmin/questions/${id_question}/clients/${id_client}`
    );
};

/**
 * Actualizar precios de asignación
 */
export const updateQuestionClientPrices = async (
    id_question_client: number,
    payload: { id_user: number; client_price?: number; client_promoter_earns?: number }
): Promise<ApiResponse<{ success: boolean }>> => {
    return api.put<ApiResponse<{ success: boolean }>>(
        `/superadmin/questions-client/${id_question_client}`,
        payload
    );
};

// ============================================================================
// SUPERADMIN - Consultas
// ============================================================================

/**
 * Preguntas asignadas a un cliente
 */
export const getQuestionsForClient = async (id_client: number): Promise<ApiResponse<QuestionClient[]>> => {
    return api.get<ApiResponse<QuestionClient[]>>(`/superadmin/questions/clients/${id_client}`);
};

/**
 * Clientes asignados a una pregunta
 */
export const getClientsForQuestion = async (id_question: number): Promise<ApiResponse<ClientAssignment[]>> => {
    return api.get<ApiResponse<ClientAssignment[]>>(`/superadmin/questions/${id_question}/clients`);
};

/**
 * Preguntas disponibles para asignar a cliente (no asignadas aún)
 */
export const getAvailableQuestionsForClient = async (id_client: number): Promise<ApiResponse<Question[]>> => {
    return api.get<ApiResponse<Question[]>>(`/superadmin/questions/clients/available/${id_client}`);
};

/**
 * Detalle de asignación
 */
export const getQuestionClientDetail = async (id_question_client: number): Promise<ApiResponse<QuestionClient>> => {
    return api.get<ApiResponse<QuestionClient>>(`/superadmin/questions-client/${id_question_client}`);
};

// ============================================================================
// ADMIN - Solo lectura
// ============================================================================

/**
 * Listar preguntas del cliente (Admin)
 */
export const getQuestionsForMyClient = async (id_client: number): Promise<ApiResponse<QuestionClient[]>> => {
    return api.get<ApiResponse<QuestionClient[]>>(`/admin/questions/${id_client}`);
};

/**
 * Obtener pregunta específica del cliente (Admin)
 */
export const getQuestionClientById = async (
    id_client: number,
    id_question_client: number
): Promise<ApiResponse<QuestionClient>> => {
    return api.get<ApiResponse<QuestionClient>>(`/admin/questions/${id_client}/${id_question_client}`);
};

/**
 * Buscar preguntas (Admin)
 */
export const searchQuestions = async (
    id_client: number,
    search?: string
): Promise<ApiResponse<QuestionClient[]>> => {
    return api.post<ApiResponse<QuestionClient[]>>("/admin/questions/search", {
        id_client,
        search,
    });
};

/**
 * Estadísticas de preguntas (Admin)
 */
export const getQuestionStats = async (id_client: number): Promise<ApiResponse<QuestionStats>> => {
    return api.get<ApiResponse<QuestionStats>>(`/admin/questions/${id_client}/stats`);
};
