import { Toaster } from "sonner";
import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";

// componente de carga (fallback de Suspense)

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  </div>
);

//  imports lazy - se cargan bajo demanda

const Navbar = lazy(() => import("./components/Navbar"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Pages
const Inicio = lazy(() => import("./pages/Inicio"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const Profile = lazy(() => import("./pages/Profile"));
const Perfil = lazy(() => import("./pages/Perfil"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminUsuarios = lazy(() => import("./pages/AdminUsuarios"));
const AdminEmpresas = lazy(() => import("./pages/AdminEmpresas"));
const AdminEmpleos = lazy(() => import("./pages/AdminEmpleos"));
const MapaPage = lazy(() => import("./pages/MapaPage"));
const Cursos = lazy(() => import("./pages/Cursos"));
const FormularioComercio = lazy(() => import("./pages/FormularioComercio"));
const Recompensas = lazy(() => import("./pages/Recompensas"));
const TopMundial = lazy(() => import("./pages/TopMundial"));
const Notificaciones = lazy(() => import("./pages/Notificaciones"));
const Mensajes = lazy(() => import("./pages/Mensajes"));
const Empleos = lazy(() => import("./pages/Empleos"));
const HerramientasFinancieras = lazy(() => import("./pages/HerramientasFinancieras"));
const EcommerceHome = lazy(() => import("./pages/ecommerce/EcommerceHome"));
const Marketplace = lazy(() => import("./pages/ecommerce/Marketplace"));
const ProductoDetalle = lazy(() => import("./pages/ecommerce/ProductoDetalle"));
const Comparador = lazy(() => import("./pages/ecommerce/Comparador"));
const Cotizaciones = lazy(() => import("./pages/ecommerce/Cotizaciones"));
const MisCompras = lazy(() => import("./pages/ecommerce/MisCompras"));
const MisVentas = lazy(() => import("./pages/ecommerce/MisVentas"));
const Checkout = lazy(() => import("./pages/ecommerce/Checkout"));
const EcommerceAnalytics = lazy(() => import("./pages/ecommerce/EcommerceAnalytics"));
const Ajustes = lazy(() => import("./pages/Ajustes"));
const Grupos = lazy(() => import("./pages/Grupos"));
const Alianzas = lazy(() => import("./pages/Alianzas"));
const Oportunidades = lazy(() => import("./pages/Oportunidades"));
const Tendencias = lazy(() => import("./pages/Tendencias"));
const Recomendaciones = lazy(() => import("./pages/Recomendaciones"));
const Favoritos = lazy(() => import("./pages/Favoritos"));
const Contactos = lazy(() => import("./pages/Contactos"));
const Eventos = lazy(() => import("./pages/Eventos"));
const Verificar = lazy(() => import("./pages/Verificar"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const EmpresaPublica = lazy(() => import("./pages/EmpresaPublica"));
const Explorar = lazy(() => import("./pages/Explorar"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminReportes = lazy(() => import("./pages/AdminReportes"));
const AdminConfiguracion = lazy(() => import("./pages/AdminConfiguracion"));

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const isLoggedIn = !!storedUser;

  useEffect(() => {
    const publicRoutes = ["/", "/login", "/register", "/subscribe", "/verificar", "/forgot-password", "/reset-password"];
    
    const publicDynamicRoutes = [
      /^\/empresa\/\d+$/,
    ];
    
    const isPublicRoute = 
      publicRoutes.includes(location.pathname) ||
      publicDynamicRoutes.some((regex) => regex.test(location.pathname));

    const isPublicOnlyRoute = 
      location.pathname === "/verificar" ||
      location.pathname === "/forgot-password" ||
      location.pathname === "/reset-password";

    if (isLoggedIn && isPublicRoute && !isPublicOnlyRoute) {
      const esPerfilEmpresa = /^\/empresa\/\d+$/.test(location.pathname);
      if (!esPerfilEmpresa) {
        navigate("/inicio");
      }
    }

    if (!isLoggedIn && !isPublicRoute) {
      navigate("/subscribe");
    }
  }, [isLoggedIn, location.pathname, navigate]);

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
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/verificar" element={<Verificar />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/empresa/:id" element={<EmpresaPublica />} />
            <Route path="/explorar" element={<Explorar />} />
            
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                </Suspense>
              }
            >
              <Route index element={<Admin />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="empresas" element={<AdminEmpresas />} />
              <Route path="empleos" element={<AdminEmpleos />} />
              <Route path="reportes" element={<AdminReportes />} />
              <Route path="configuracion" element={<AdminConfiguracion />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            background: "#0b1630",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
          },
        }}
      />
    </Router>
  );
}