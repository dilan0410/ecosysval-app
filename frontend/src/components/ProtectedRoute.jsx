import { Navigate } from "react-router-dom";

/**
 * Componente para proteger rutas según autenticación y rol.
 * 
 * Uso:
 * <ProtectedRoute requiredRole="admin">
 *   <ComponenteProtegido />
 * </ProtectedRoute>
 */
function ProtectedRoute({ children, requiredRole }) {
  // Obtener datos del usuario desde localStorage
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  // Si no hay token, redirigir al login
  if (!token || !userStr) {
    return <Navigate to="/" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to="/" replace />;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole && user.role !== requiredRole) {
    // Si no tiene el rol correcto, redirigir al perfil
    return <Navigate to="/profile" replace />;
  }

  // Todo OK, mostrar el componente
  return children;
}

export default ProtectedRoute;