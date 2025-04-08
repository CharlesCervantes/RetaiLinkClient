import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import SolicitudesPage from "../pages/Solicitudes"
import Settings from "../pages/Settings";
import CrearSolicitud from "@/components/CrearSolicitud";
import { ProductList } from "@/pages/ProductList";
import { CreateProduct } from "@/components/CreateProduct"
import { PrivateRoute } from "@/components/PrivateRoute"
import { Login } from "@/pages/Login"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas dentro del layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="solicitudes" element={<SolicitudesPage />} />
          <Route path="crearSolicitud" element={<CrearSolicitud />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pructList" element={<ProductList />} />
          <Route path="createProduct" element={<CreateProduct />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
