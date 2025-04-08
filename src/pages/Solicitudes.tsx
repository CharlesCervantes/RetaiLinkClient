import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SolicitudesPage() {
  const [solicitudesActivas, setSolicitudesActivas] = useState([]);
  const [solicitudesFinalizadas, setSolicitudesFinalizadas] = useState([]);

  useEffect(() => {
    // Simulación de carga de solicitudes desde API
    setSolicitudesActivas([
      { id: 1, etiqueta: "Ruta 1", pago: 200, tiendas: ["Tienda A", "Tienda B"] },
      { id: 2, etiqueta: "Ruta 2", pago: 150, tiendas: ["Tienda C"] },
    ]);
    setSolicitudesFinalizadas([
      { id: 3, etiqueta: "Descuento Octubre", pago: 100, tiendas: ["Tienda D", "Tienda E"] },
    ]);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Solicitudes</h1>
      
      <Tabs defaultValue="activas" className="w-full">
        <TabsList>
          <TabsTrigger value="activas">Solicitudes Activas</TabsTrigger>
          <TabsTrigger value="finalizadas">Solicitudes Finalizadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activas" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {solicitudesActivas.length > 0 ? (
            solicitudesActivas.map((solicitud) => (
              <Card key={solicitud.id}>
                <CardHeader>
                  <CardTitle>{solicitud.etiqueta}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Pago:</strong> ${solicitud.pago}</p>
                  <p><strong>Tiendas:</strong> {solicitud.tiendas.join(", ")}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No hay solicitudes activas.</p>
          )}
        </TabsContent>
        
        <TabsContent value="finalizadas" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {solicitudesFinalizadas.length > 0 ? (
            solicitudesFinalizadas.map((solicitud) => (
              <Card key={solicitud.id}>
                <CardHeader>
                  <CardTitle>{solicitud.etiqueta}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Pago:</strong> ${solicitud.pago}</p>
                  <p><strong>Tiendas:</strong> {solicitud.tiendas.join(", ")}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No hay solicitudes finalizadas.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
