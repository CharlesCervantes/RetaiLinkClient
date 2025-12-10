export interface DashboardStats {
  clientes: number;
  usuarios: number;
  establecimientos: number;
  ticketsPorCobrar: {
    total: number;
    monto: number;
  };
  ticketsPorPagar: {
    total: number;
    monto: number;
  };
  promotores: {
    total: number;
    activos: number;
  };
}

export interface PromoterLocation {
  id: number;
  lat: number;
  lng: number;
  name: string;
  active: boolean;
  idNegocio: number;
}

export const mockSuperAdminStats: DashboardStats = {
  clientes: 1247,
  usuarios: 523,
  establecimientos: 89,
  ticketsPorCobrar: {
    total: 342,
    monto: 1258450.50,
  },
  ticketsPorPagar: {
    total: 127,
    monto: 456789.25,
  },
  promotores: {
    total: 156,
    activos: 89,
  },
};

export const mockAdminStats: DashboardStats = {
  clientes: 234,
  usuarios: 45,
  establecimientos: 12,
  ticketsPorCobrar: {
    total: 67,
    monto: 234560.75,
  },
  ticketsPorPagar: {
    total: 23,
    monto: 87654.30,
  },
  promotores: {
    total: 28,
    activos: 16,
  },
};

export const mockPromoterLocations: PromoterLocation[] = [
  { id: 1, lat: 19.432608, lng: -99.133209, name: "Promotor CDMX 1", active: true, idNegocio: 1 },
  { id: 2, lat: 19.442608, lng: -99.143209, name: "Promotor CDMX 2", active: true, idNegocio: 1 },
  { id: 3, lat: 19.422608, lng: -99.123209, name: "Promotor CDMX 3", active: false, idNegocio: 1 },
  { id: 4, lat: 25.686613, lng: -100.316116, name: "Promotor MTY 1", active: true, idNegocio: 2 },
  { id: 5, lat: 25.696613, lng: -100.326116, name: "Promotor MTY 2", active: true, idNegocio: 2 },
  { id: 6, lat: 20.659698, lng: -103.349609, name: "Promotor GDL 1", active: true, idNegocio: 3 },
  { id: 7, lat: 20.669698, lng: -103.359609, name: "Promotor GDL 2", active: false, idNegocio: 3 },
  { id: 8, lat: 21.161908, lng: -86.851528, name: "Promotor Cancún 1", active: true, idNegocio: 1 },
  { id: 9, lat: 32.515285, lng: -117.038254, name: "Promotor Tijuana 1", active: true, idNegocio: 2 },
  { id: 10, lat: 19.452608, lng: -99.153209, name: "Promotor CDMX 4", active: true, idNegocio: 1 },
  { id: 11, lat: 19.462608, lng: -99.163209, name: "Promotor CDMX 5", active: false, idNegocio: 1 },
  { id: 12, lat: 20.679698, lng: -103.369609, name: "Promotor GDL 3", active: true, idNegocio: 3 },
  { id: 13, lat: 25.706613, lng: -100.336116, name: "Promotor MTY 3", active: true, idNegocio: 2 },
  { id: 14, lat: 19.040404, lng: -98.206293, name: "Promotor Puebla 1", active: true, idNegocio: 1 },
  { id: 15, lat: 21.885906, lng: -102.291366, name: "Promotor Aguascalientes 1", active: false, idNegocio: 3 },
  { id: 16, lat: 19.412608, lng: -99.113209, name: "Promotor CDMX 6", active: true, idNegocio: 1 },
  { id: 17, lat: 20.689698, lng: -103.379609, name: "Promotor GDL 4", active: true, idNegocio: 3 },
  { id: 18, lat: 25.716613, lng: -100.346116, name: "Promotor MTY 4", active: false, idNegocio: 2 },
];

export function getStatsForNegocio(idNegocio: number): DashboardStats {
  return {
    clientes: Math.floor(Math.random() * 300 + 100),
    usuarios: Math.floor(Math.random() * 50 + 20),
    establecimientos: Math.floor(Math.random() * 15 + 5),
    ticketsPorCobrar: {
      total: Math.floor(Math.random() * 100 + 30),
      monto: Math.floor(Math.random() * 300000 + 100000),
    },
    ticketsPorPagar: {
      total: Math.floor(Math.random() * 50 + 10),
      monto: Math.floor(Math.random() * 150000 + 50000),
    },
    promotores: {
      total: Math.floor(Math.random() * 35 + 15),
      activos: Math.floor(Math.random() * 20 + 10),
    },
  };
}

export function getPromotersForNegocio(idNegocio: number): PromoterLocation[] {
  return mockPromoterLocations.filter(p => p.idNegocio === idNegocio);
}
