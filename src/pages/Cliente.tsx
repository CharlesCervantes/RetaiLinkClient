import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Building2,
  Users,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// DATOS MOCK
const CLIENTES_MOCK = [
  {
    id_cliente: 1,
    vc_nombre: "Liverpool",
    vc_rfc: "LIV850101ABC",
    vc_email: "contacto@liverpool.com.mx",
    vc_telefono: "+52 81 8888 9999",
    i_cant_usuarios: 45,
    i_cant_establecimientos: 12,
    b_activo: true,
    dt_creacion: "2024-01-15",
  },
  {
    id_cliente: 2,
    vc_nombre: "CEMEX",
    vc_rfc: "CEM920827KL1",
    vc_email: "contacto@cemex.com",
    vc_telefono: "+52 81 8888 0000",
    i_cant_usuarios: 32,
    i_cant_establecimientos: 8,
    b_activo: true,
    dt_creacion: "2024-02-20",
  },
  {
    id_cliente: 3,
    vc_nombre: "Grupo Alfa",
    vc_rfc: "GAL740303MN8",
    vc_email: "info@alfa.com.mx",
    vc_telefono: "+52 81 8748 1111",
    i_cant_usuarios: 18,
    i_cant_establecimientos: 5,
    b_activo: true,
    dt_creacion: "2024-03-10",
  },
  {
    id_cliente: 4,
    vc_nombre: "Soriana",
    vc_rfc: "SOR680915RT5",
    vc_email: "soporte@soriana.com",
    vc_telefono: "+52 81 8529 5555",
    i_cant_usuarios: 28,
    i_cant_establecimientos: 9,
    b_activo: false,
    dt_creacion: "2023-11-05",
  },
  {
    id_cliente: 5,
    vc_nombre: "Coppel",
    vc_rfc: "COP870512XY9",
    vc_email: "contacto@coppel.com",
    vc_telefono: "+52 81 8333 4444",
    i_cant_usuarios: 22,
    i_cant_establecimientos: 6,
    b_activo: true,
    dt_creacion: "2024-04-01",
  },
  {
    id_cliente: 6,
    vc_nombre: "Home Depot México",
    vc_rfc: "HDM010920PQ2",
    vc_email: "info@homedepot.com.mx",
    vc_telefono: "+52 81 8555 7777",
    i_cant_usuarios: 15,
    i_cant_establecimientos: 4,
    b_activo: false,
    dt_creacion: "2023-12-15",
  },
];

export default function Clientes() {
  const [clientes, setClientes] = useState(CLIENTES_MOCK);
  const [filteredClientes, setFilteredClientes] = useState(CLIENTES_MOCK);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const filtered = clientes.filter(
      (cliente) =>
        cliente.vc_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.vc_rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.vc_email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredClientes(filtered);
  }, [searchTerm, clientes]);

  const stats = {
    total: clientes.length,
    activos: clientes.filter((c) => c.b_activo).length,
    inactivos: clientes.filter((c) => !c.b_activo).length,
    usuarios: clientes.reduce((sum, c) => sum + (c.i_cant_usuarios || 0), 0),
  };

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      setClientes(clientes.filter((c) => c.id_cliente !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Administra los clientes del sistema
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Plus size={18} />
            Nuevo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Activos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.activos}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Inactivos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.inactivos}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Usuarios</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.usuarios}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Establecimientos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id_cliente}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-medium">
                          {cliente.vc_nombre.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {cliente.vc_nombre}
                          </p>
                          <p className="text-sm text-gray-500">
                            {cliente.vc_rfc}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {cliente.vc_email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          {cliente.vc_telefono}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                        <Users size={14} />
                        {cliente.i_cant_usuarios}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                        <MapPin size={14} />
                        {cliente.i_cant_establecimientos}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cliente.b_activo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-sm rounded-md">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-sm rounded-md">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id_cliente)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No se encontraron clientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
