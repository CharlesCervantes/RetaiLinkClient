import { BrowserRouter, Routes, Route } from "react-router-dom";
import CrearSolicitud from "../components/CrearSolicitud";
import CreateProduct from "../components/CreateProduct";
import PrivateRoute from "../components/PrivateRoute";
import Layout from "../components/layout/Layout";
import Solicitudes from "../pages/Solicitudes";
import ProductList from "../pages/ProductList";
import Settings from "../pages/Settings";
import Login from "../pages/Login";
import Home from "../pages/Home";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas privadas, protegidas por PrivateRoute */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="solicitudes" element={<Solicitudes />} />
          <Route path="crearSolicitud" element={<CrearSolicitud />} />
          <Route path="settings" element={<Settings />} />
          <Route path="productList" element={<ProductList />} />
          <Route path="createProduct" element={<CreateProduct />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
