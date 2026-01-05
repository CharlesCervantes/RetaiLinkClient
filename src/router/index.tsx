import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login";
import Home from "../pages/inicio/Home";
import ClientesList from "../pages/clientes/Cliente";
import RestorePassword from "../pages/auth/restore-password";
import CrearCliente from "../pages/clientes/ClienteN";
import ClientDetailPage from "../pages/clientes/ClientDetail";
import ProductPage from "../pages/productos/Products";
import CreateProduct from "../pages/productos/NewProduct";
import ProductDetail from "../pages/productos/ProductDetail";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/restore-pwd" element={<RestorePassword />} />

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
          <Route path="clientes" element={<ClientesList />} />
          <Route path="crearCliente" element={<CrearCliente />} />
          <Route path="clientes/:id" element={<ClientDetailPage />} />
          <Route path="productos" element={<ProductPage />} />
          <Route path="producto" element={<CreateProduct />} />
          <Route path="producto/:id_product" element={<CreateProduct />} />
          <Route path="producto/detalle/:id_product" element={<ProductDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
