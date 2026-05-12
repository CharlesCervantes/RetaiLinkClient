import { ClientDTO } from './clients'

export interface QuestionOptionDTO {
    id_option: number
    id_question: number
    option_text: string
    option_value_numeric?: number
    option_value_text?: string
    option_order: number
    i_status: number
    dt_register: string
    dt_update: string
}

export interface QuestionClintsDTO {
    id_question_client: number
    id_question: number
    id_client: number
    id_user: number
    i_status: number
    dt_register: string
    dt_update: string
    clients: ClientDTO
}

export interface QuestionDTO{
    id_question: number
    id_user: number
    question: string
    i_status: number
    dt_register: string
    dt_update: string
    question_type: string
    min_value?: number
    max_value?: number
    max_photos?: number
    question_options?: QuestionOptionDTO[]
    questions_client?: QuestionClintsDTO[]
}