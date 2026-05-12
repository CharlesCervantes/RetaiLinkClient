import { v4 as uuidv4 } from "uuid";

// Tipos base de una solicitud finalizada (Mock)
export interface SolicitudProductoMock {
  id_producto: string;
  nombre: string;
  cantidad: number;
  precio_extra: number;
  preguntas: {
    id_pregunta: string;
    texto: string;
    precio: number;
  }[];
}

export interface SolicitudMock {
  id: string;
  nombre: string;
  tiendas: number;
  id_client: number;
  productos: SolicitudProductoMock[];
  estatus: "Pendiente" | "En progreso" | "Completada";
  total: number;
  dt_registro: number;
}

// Simulamos una base de datos en memoria para las solicitudes
let mockDatabase: SolicitudMock[] = [
  {
    id: "1",
    id_client: 1, // Pertenece a este cliente
    nombre: "Solicitud Inicial de Prueba",
    tiendas: 2,
    productos: [
      {
        id_producto: "p1",
        nombre: "Producto Mock A",
        cantidad: 1,
        precio_extra: 0,
        preguntas: [
          { id_pregunta: "q1", texto: "¿Está limpio?", precio: 0 },
          { id_pregunta: "q2", texto: "¿Caducidad visible?", precio: 10 },
        ],
      },
    ],
    estatus: "Pendiente",
    total: 55, // 45 base + 10 preguntas
    dt_registro: Date.now(),
  },
];

// Helper para simular retardo de red
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getTodasLasSolicitudesMock = async (): Promise<SolicitudMock[]> => {
  await delay(500);
  return [...mockDatabase].sort((a, b) => b.dt_registro - a.dt_registro);
};

export const getSolicitudesPorClienteMock = async (id_client: number): Promise<SolicitudMock[]> => {
  await delay(500);
  return mockDatabase
    .filter((s) => s.id_client === id_client)
    .sort((a, b) => b.dt_registro - a.dt_registro);
};

export const getSolicitudByIdMock = async (id: string): Promise<SolicitudMock | undefined> => {
  await delay(300);
  return mockDatabase.find((s) => s.id === id);
};

export const createSolicitudMock = async (
  payload: Omit<SolicitudMock, "id" | "dt_registro" | "estatus">
): Promise<SolicitudMock> => {
  await delay(800);
  
  const nuevaSolicitud: SolicitudMock = {
    ...payload,
    id: uuidv4(),
    estatus: "Pendiente",
    dt_registro: Date.now(),
  };

  mockDatabase.push(nuevaSolicitud);
  return nuevaSolicitud;
};

export const deleteSolicitudMock = async (id: string): Promise<boolean> => {
  await delay(500);
  const initialLength = mockDatabase.length;
  mockDatabase = mockDatabase.filter((s) => s.id !== id);
  return mockDatabase.length < initialLength;
};
