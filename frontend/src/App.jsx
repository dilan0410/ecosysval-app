import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// Navbar en components
import Navbar from "./components/Navbar";

// NUEVO IMPORT: Componente para proteger rutas
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscribe from "./pages/Subscribe";
import Profile from "./pages/Profile";
import Perfil from "./pages/Perfil";
import AdminLayout from "./components/AdminLayout";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminEmpresas from "./pages/AdminEmpresas";
import AdminEmpleos from "./pages/AdminEmpleos";
import MapaPage from "./pages/MapaPage";
import Cursos from "./pages/Cursos";
import FormularioComercio from "./pages/FormularioComercio";
import Recompensas from "./pages/Recompensas";
import TopMundial from "./pages/TopMundial";
import Notificaciones from "./pages/Notificaciones";
import Mensajes from "./pages/Mensajes";
import Empleos from "./pages/Empleos";
import HerramientasFinancieras from "./pages/HerramientasFinancieras";
import EcommerceHome from "./pages/ecommerce/EcommerceHome";
import Marketplace from "./pages/ecommerce/Marketplace";
import ProductoDetalle from "./pages/ecommerce/ProductoDetalle";
import Comparador from "./pages/ecommerce/Comparador";
import Cotizaciones from "./pages/ecommerce/Cotizaciones";
import MisCompras from "./pages/ecommerce/MisCompras";
import MisVentas from "./pages/ecommerce/MisVentas";
import Checkout from "./pages/ecommerce/Checkout";
import EcommerceAnalytics from "./pages/ecommerce/EcommerceAnalytics";
import Ajustes from "./pages/Ajustes";
import Grupos from "./pages/Grupos";
import Alianzas from "./pages/Alianzas";
import Oportunidades from "./pages/Oportunidades";
import Tendencias from "./pages/Tendencias";
import Recomendaciones from "./pages/Recomendaciones";
import Favoritos from "./pages/Favoritos";
import Contactos from "./pages/Contactos";
import Eventos from "./pages/Eventos";

// NUEVA PÁGINA: Panel de Administrador
import Admin from "./pages/Admin";

function AppContent() {
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const isLoggedIn = !!storedUser;

  const showNavbar =
      !isLoggedIn &&
      (location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register" ||
        location.pathname === "/subscribe");

  return (
    <>
      {showNavbar && <Navbar />}

      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Subscribe />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mapa" element={<MapaPage />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/formulario-comercio/" element={<FormularioComercio />} />
          <Route path="/recompensas" element={<Recompensas />} />
          <Route path="/top-mundial" element={<TopMundial />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/mensajes" element={<Mensajes />} />
          <Route path="/empleos" element={<Empleos />} />
          <Route path="/herramientas-financieras" element={<HerramientasFinancieras />} />
          <Route path="/ecommerce" element={<EcommerceHome />} />
          <Route path="/ecommerce/marketplace" element={<Marketplace />} />
          <Route path="/ecommerce/producto/:id" element={<ProductoDetalle />} />
          <Route path="/ecommerce/comparador" element={<Comparador />} />
          <Route path="/ecommerce/cotizaciones" element={<Cotizaciones />} />
          <Route path="/ecommerce/compras" element={<MisCompras />} />
          <Route path="/ecommerce/ventas" element={<MisVentas />} />
          <Route path="/ecommerce/checkout" element={<Checkout />} />
          <Route path="/ecommerce/analytics" element={<EcommerceAnalytics />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/alianzas" element={<Alianzas />} />
          <Route path="/oportunidades" element={<Oportunidades />} />
          <Route path="/tendencias" element={<Tendencias />} />
          <Route path="/recomendaciones" element={<Recomendaciones />} />
          <Route path="/favoritos" element={<Favoritos />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/eventos" element={<Eventos />} />
          
          {/* RUTAS DEL PANEL DE ADMIN (todas protegidas) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
          <Route index element={<Admin />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="empresas" element={<AdminEmpresas />} />
          <Route path="empleos" element={<AdminEmpleos />} />
          
        </Route>
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}